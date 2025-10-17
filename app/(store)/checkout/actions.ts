'use server';

import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ApplyCouponSchema, CheckoutSchema } from '@/lib/zod-checkout';
import { sendEmail } from '@/lib/send-email';
import { renderEmail } from '@/lib/render-email';
import OrderConfirmationEmail from '@/emails/order-confirmation';

type CookieCartItem = {
  productId: string;
  productSlug: string;
  variantId: string;
  variantTitle: string;
  variantName: string;
  variantStyleImg?: string | null;
  variantImage?: string | null;
  variantSizeId: string;
  sizeLabel: string;
  sku: string;
  unitPriceMAD: number;
  discountPercent?: number | null;
  finalUnitPriceMAD: number;
  maxStock: number;
  qty: number;
};

async function readCookieCart(): Promise<{ items: CookieCartItem[]; }> {
  const cookie=await cookies()
  const c = cookie.get('hajzen_cart')?.value;
  if (!c) return { items: [] };
  try { const parsed = JSON.parse(c); return { items: parsed.items || [] }; } catch { return { items: [] }; }
}

function priceAfterDiscount(base: number, pct?: number | null) {
  if (!pct || pct <= 0) return base;
  return Math.max(0, Number((base * (100 - pct) / 100).toFixed(2)));
}

export async function ensureLoggedInOrRedirectCart() {
  const user = await getCurrentUser();
  if (!user) redirect('/cart?auth=required');
  return user;
}

// Sync cookie cart -> DB Cart/CartItem with stock/price revalidation
export async function syncCartToDBAndValidate() {
  const user = await ensureLoggedInOrRedirectCart();
  const { items } = await readCookieCart();
  if (items.length === 0) return { ok: true, problems: [], items: [] };

  const problems: any[] = [];
  const sizes = await prisma.variantSize.findMany({
    where: { id: { in: items.map(i => i.variantSizeId) } },
    include: { variant: { select: { title: true, name: true, freeDelivery: true } } }
  });
  const byId = new Map(sizes.map(s => [s.id, s]));

  for (const it of items) {
    const s = byId.get(it.variantSizeId);
    if (!s || !s.isActive) {
      problems.push({ type: 'unavailable', variantSizeId: it.variantSizeId, message: 'This size is no longer available.' });
      continue;
    }
    const freshBase = Number(s.priceMAD);
    const freshFinal = priceAfterDiscount(freshBase, s.discountPercent ?? null);
    const freshStock = s.stockQty;

    if (freshStock <= 0) {
      problems.push({ type: 'out_of_stock', variantSizeId: it.variantSizeId, message: 'Out of stock.' });
    } else if (it.qty > freshStock) {
      problems.push({ type: 'qty_reduced', variantSizeId: it.variantSizeId, newQty: freshStock, message: `Quantity reduced to ${freshStock}.` });
    }

    if (Number(it.finalUnitPriceMAD) !== freshFinal) {
      problems.push({ type: 'price_changed', variantSizeId: it.variantSizeId, newPrice: freshFinal, message: 'Price has changed.' });
    }
  }

  if (problems.length) {
    return { ok: false, problems };
  }

  // Upsert Cart snapshot
  const existing = await prisma.cart.findFirst({ where: { userId: user.id } });
  const cartId = existing?.id ?? (await prisma.cart.create({ data: { userId: user.id } })).id;
  await prisma.cartItem.deleteMany({ where: { cartId } });
  await prisma.cartItem.createMany({
    data: items.map(it => ({
      cartId,
      variantSizeId: it.variantSizeId,
      quantity: it.qty,
      unitPriceMAD: it.finalUnitPriceMAD,
    }))
  });
  return { ok: true, problems: [], items };
}

// coupon
export async function applyCouponAction(prevState: any, formData: FormData) {
 const rawCode = String(formData.get('code') || '').trim();
  if (!rawCode) return { ok: false, error: 'Invalid code' };

  const now = new Date();
const c = await prisma.coupon.findFirst({
  where: {
    code:rawCode,
    active: true,
    AND: [
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
      { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
    ]
  }
});

  if (!c) return { ok: false, error: 'Coupon not valid or expired' };

  return { ok: true, percent: c.percent, code: c.code };
}


// place order using DB cart snapshot
export async function placeOrderAction(prevState: any, formData: FormData) {
  const user = await ensureLoggedInOrRedirectCart();

  const payload = {
    addressId: String(formData.get('addressId') || ''),
    shippingCompanyId: String(formData.get('shippingCompanyId') || ''),
    couponCode: (formData.get('couponCode') || '') as string,
    fullName: String(formData.get('fullName') || ''),
    phone: String(formData.get('phone') || ''),
    city: String(formData.get('city') || ''),
    fullAddress: String(formData.get('street') || ''),
  };

  const parsed = CheckoutSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: 'Invalid checkout data' };
  if (!parsed.data.shippingCompanyId) return { ok: false, error: 'Select delivery company' };

  // --- Ensure Address ---
  let addressId = parsed.data.addressId;
  const moroccoPhoneRegex = /^(?:\+212|0)(6|7)\d{8}$/;

  if (addressId === 'new' || !addressId) {
    // Validate fields
    if (
      !payload.fullName.trim() ||
      !payload.fullAddress.trim() ||
      !payload.city.trim() ||
      !moroccoPhoneRegex.test(payload.phone)
    ) {
      return { ok: false, error: 'Please enter a valid address and phone number' };
    }

    const newAddr = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: payload.fullName.trim(),
        phone: payload.phone.trim(),
        city: payload.city.trim(),
        fullAddress: payload.fullAddress.trim(),
        isDefault: true,
      },
    });
    addressId = newAddr.id;
  } else {
    // Verify ownership of selected address
    const addr = await prisma.address.findFirst({ where: { id: addressId, userId: user.id } });
    if (!addr) return { ok: false, error: 'Invalid address' };
  }

  // --- Load DB cart ---
  const cart = await prisma.cart.findFirst({
    where: { userId: user.id },
    include: { items: { include: { variantSize: { include: { variant: true } } } } },
  });
  if (!cart || cart.items.length === 0) return { ok: false, error: 'Your cart is empty' };

  // --- Validate stock/prices ---
  let subtotal = 0;
  let allFreeDelivery = true;

  for (const ci of cart.items) {
    const s = ci.variantSize;
    if (!s || !s.isActive) return { ok: false, error: 'Some items are no longer available.' };
    if (ci.quantity > s.stockQty) return { ok: false, error: 'Quantity changed. Please review your cart.' };
    const final = priceAfterDiscount(Number(s.priceMAD), s.discountPercent ?? null);
    subtotal += final * ci.quantity;
    if (!s.variant.freeDelivery) allFreeDelivery = false;
  }

  // --- Coupon ---
  let couponPercent: number | null = null;
  let couponCode: string | null = null;

  const now = new Date();
  if (payload.couponCode) {
    const c = await prisma.coupon.findFirst({
      where: {
        code: payload.couponCode.toUpperCase(),
        active: true,
          AND: [
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
      { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
    ]
      },
    });
    if (!c) return { ok: false, error: 'Coupon invalid or expired' };
    couponPercent = c.percent;
    couponCode = c.code;
  }

  // --- Delivery company ---
  const company = await prisma.deliveryCompany.findFirst({
    where: { id: parsed.data.shippingCompanyId, active: true },
  });
  if (!company) return { ok: false, error: 'Invalid delivery company' };

  const shippingFee = allFreeDelivery ? 0 : Number(company.priceMAD);
  const discountMAD = couponPercent ? Number((subtotal * couponPercent / 100).toFixed(2)) : 0;
  const totalMAD = Number((subtotal - discountMAD + shippingFee).toFixed(2));

  // --- Transaction: decrement stock + create order ---
  const order = await prisma.$transaction(async (tx) => {
    for (const ci of cart.items) {
      const s = await tx.variantSize.update({
        where: { id: ci.variantSizeId },
        data: { stockQty: { decrement: ci.quantity } },
      });
      if (s.stockQty < 0) throw new Error('STOCK_RACE');
    }

    const created = await tx.order.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        totalMAD,
        currency: 'MAD',
        shippingCompanyId: company.id,
        shippingFeeMAD: shippingFee,
        couponCode,
        couponPercentApplied: couponPercent ?? undefined,
        subtotalMAD: Number(subtotal.toFixed(2)),
        discountMAD,
        placedAt: new Date(),
        shippingAddressId: addressId,
        items: {
          create: cart.items.map((ci) => {
            const s = ci.variantSize;
            const final = priceAfterDiscount(Number(s.priceMAD), s.discountPercent ?? null);
            return {
              variantSizeId: s.id,
              titleSnapshot: s.variant.title,
              skuSnapshot: s.sku,
              attributesSnapshot: { size: s.size, variantName: s.variant.name },
              quantity: ci.quantity,
              unitPriceMAD: final,
            };
          }),
        },
      },
      include: { items: true, shippingCompany: true, shippingAddress: true },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });

  // --- Clear cookie snapshot ---
  const cookie=await cookies()
  cookie.set('hajzen_cart', JSON.stringify({ items: [], updatedAt: Date.now() }), {
    path: '/',
    sameSite: 'lax',
  });

  // --- Send confirmation email ---
  try {
    const html = renderEmail(OrderConfirmationEmail({ order } as any));
    const u = await prisma.user.findUnique({ where: { id: order.userId! } });
    if (u?.email) await sendEmail(u.email, 'Your order has been placed', html);
  } catch {}

  redirect('/profile/orders/' + order.id);
}