'use server';

import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ApplyCouponSchema, CheckoutSchema } from '@/lib/zod-checkout';
import { sendEmail } from '@/lib/send-email';
import { renderEmail } from '@/lib/render-email';
import OrderConfirmationEmail from '@/emails/order-confirmation';
import { z } from 'zod';

const CookieCartSchema = z.object({
  items: z.array(z.object({
    variantSizeId: z.string().min(1),
    qty: z.number().int().min(1).max(10),
  })).max(100),
});

type CookieCartItem = z.infer<typeof CookieCartSchema>['items'][number];

async function readCookieCart(): Promise<{ items: CookieCartItem[]; invalid: boolean }> {
  const cookie = await cookies();
  const raw = cookie.get('hajzen_cart')?.value;
  if (!raw) return { items: [], invalid: false };

  try {
    const parsed = CookieCartSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return { items: [], invalid: true };

    const deduped = new Map<string, number>();
    for (const item of parsed.data.items) {
      const current = deduped.get(item.variantSizeId) ?? 0;
      deduped.set(item.variantSizeId, Math.min(10, current + item.qty));
    }

    return {
      items: Array.from(deduped, ([variantSizeId, qty]) => ({ variantSizeId, qty })),
      invalid: false,
    };
  } catch {
    return { items: [], invalid: true };
  }
}

function priceAfterDiscount(base: number, pct?: number | null) {
  if (!pct || pct <= 0) return base;
  return Math.max(0, Number((base * (100 - pct) / 100).toFixed(2)));
}

export async function ensureLoggedInOrRedirectCart() {
  const user = await getCurrentUser();
  if (!user) redirect('/signin?callbackUrl=/cart');
  return user;
}

// Sync cookie cart -> DB Cart/CartItem with stock/price revalidation
export async function syncCartToDBAndValidate() {
  const user = await ensureLoggedInOrRedirectCart();
  const { items, invalid } = await readCookieCart();
  if (invalid) {
    return {
      ok: false,
      problems: [{ type: 'invalid_cart', message: 'Your cart data is invalid. Please review your cart.' }],
      items: [],
    };
  }
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

    // Cookie prices and stock are never trusted. Fresh values above are authoritative.
  }

  if (problems.length) {
    return { ok: false, problems };
  }

  // Upsert the user's cart and replace its items atomically.
  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    select: { id: true },
  });

  const itemData = items.map((it) => {
    const size = byId.get(it.variantSizeId);
    if (!size) throw new Error('CART_SIZE_MISSING');
    return {
      cartId: cart.id,
      variantSizeId: it.variantSizeId,
      quantity: it.qty,
      unitPriceMAD: priceAfterDiscount(Number(size.priceMAD), size.discountPercent ?? null),
    };
  });

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
    prisma.cartItem.createMany({ data: itemData }),
  ]);
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

    const newAddr = await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });

      return tx.address.create({
        data: {
          userId: user.id,
          fullName: payload.fullName.trim(),
          phone: payload.phone.trim(),
          city: payload.city.trim(),
          fullAddress: payload.fullAddress.trim(),
          isDefault: true,
        },
      });
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
    if (!Number.isInteger(ci.quantity) || ci.quantity < 1 || ci.quantity > 10) {
      return { ok: false, error: 'Invalid cart quantity. Please review your cart.' };
    }
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

  // --- Transaction: atomically reserve stock + create order ---
  const order = await prisma.$transaction(async (tx) => {
      for (const ci of cart.items) {
        const reserved = await tx.variantSize.updateMany({
          where: {
            id: ci.variantSizeId,
            isActive: true,
            stockQty: { gte: ci.quantity },
          },
          data: { stockQty: { decrement: ci.quantity } },
        });

        if (reserved.count !== 1) throw new Error('STOCK_RACE');
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
    }).catch((error: unknown) => {
      if (error instanceof Error && error.message === 'STOCK_RACE') {
        return null;
      }
      throw error;
    });

  if (!order) {
    return { ok: false, error: 'Stock changed while placing your order. Please review your cart and try again.' };
  }

  // --- Clear cookie snapshot ---
  const cookie=await cookies()
  cookie.set('hajzen_cart', JSON.stringify({ items: [], updatedAt: Date.now() }), {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // --- Send confirmation email ---
  try {
    const html = renderEmail(OrderConfirmationEmail({ order } as any));
    const u = await prisma.user.findUnique({ where: { id: order.userId! } });
    if (u?.email) await sendEmail(u.email, 'Your order has been placed', html);
  } catch {}

  redirect('/profile/orders/' + order.id);
}