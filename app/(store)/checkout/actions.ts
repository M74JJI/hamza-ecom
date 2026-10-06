'use server';

import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { CheckoutSchema } from '@/lib/zod-checkout';
import { sendEmail } from '@/lib/email';
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
    where: {
      id: { in: items.map(i => i.variantSizeId) },
      isActive: true,
      variant: {
        isActive: true,
        product: { status: 'PUBLISHED' },
      },
    },
    include: {
      variant: {
        select: {
          title: true,
          name: true,
          freeDelivery: true,
        },
      },
    },
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

  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Cart" WHERE "id" = ${cart.id} FOR UPDATE`;
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cartItem.createMany({ data: itemData });
  });
  return { ok: true, problems: [], items };
}

// coupon
export async function applyCouponAction(prevState: any, formData: FormData) {
 const rawCode = String(formData.get('code') || '').trim().toUpperCase();
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
    couponCode: String(formData.get('couponCode') || ''),
    fullName: String(formData.get('fullName') || ''),
    phone: String(formData.get('phone') || ''),
    city: String(formData.get('city') || ''),
    fullAddress: String(formData.get('street') || ''),
  };

  const parsed = CheckoutSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: 'Invalid checkout data' };
  if (!parsed.data.shippingCompanyId) return { ok: false, error: 'Select delivery company' };

  let addressId = parsed.data.addressId;
  const moroccoPhoneRegex = /^(?:\+212|0)(6|7)\d{8}$/;

  if (addressId === 'new' || !addressId) {
    if (
      !payload.fullName.trim() ||
      !payload.fullAddress.trim() ||
      !payload.city.trim() ||
      !moroccoPhoneRegex.test(payload.phone)
    ) {
      return { ok: false, error: 'Please enter a valid address and phone number' };
    }

    const newAddr = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id} FOR UPDATE`;

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
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!cart) {
    return { ok: false, error: 'Your cart is empty' };
  }

  const requestedCouponCode = payload.couponCode.trim().toUpperCase();

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      // Serialize checkout against cart add/update/remove and cookie->DB sync.
      await tx.$queryRaw`SELECT "id" FROM "Cart" WHERE "id" = ${cart.id} FOR UPDATE`;

      const currentCart = await tx.cart.findFirst({
        where: {
          id: cart.id,
          userId: user.id,
        },
        include: {
          items: {
            select: {
              id: true,
              variantSizeId: true,
              quantity: true,
            },
          },
        },
      });

      if (!currentCart || currentCart.items.length === 0) {
        throw new Error('CART_CHANGED');
      }

      const sizeIds = Array.from(
        new Set(currentCart.items.map((item) => item.variantSizeId)),
      ).sort();

      // Freeze catalog price/stock rows for the remainder of this order snapshot.
      for (const variantSizeId of sizeIds) {
        await tx.$queryRaw`SELECT "id" FROM "VariantSize" WHERE "id" = ${variantSizeId} FOR UPDATE`;
      }

      const sizes = await tx.variantSize.findMany({
        where: {
          id: { in: sizeIds },
        },
        include: {
          variant: {
            include: {
              product: {
                select: {
                  brand: true,
                  status: true,
                },
              },
              images: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
              },
            },
          },
        },
      });

      const sizeById = new Map(sizes.map((size) => [size.id, size]));
      let subtotal = 0;
      let allFreeDelivery = true;

      const pricedItems = currentCart.items.map((item) => {
        const size = sizeById.get(item.variantSizeId);

        if (
          !size ||
          !size.isActive ||
          !size.variant.isActive ||
          size.variant.product.status !== 'PUBLISHED'
        ) {
          throw new Error('CART_CHANGED');
        }

        if (
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 10 ||
          item.quantity > size.stockQty
        ) {
          throw new Error('CART_CHANGED');
        }

        const unitPriceMAD = priceAfterDiscount(
          Number(size.priceMAD),
          size.discountPercent ?? null,
        );

        subtotal += unitPriceMAD * item.quantity;
        if (!size.variant.freeDelivery) allFreeDelivery = false;

        return {
          item,
          size,
          unitPriceMAD,
        };
      });

      let couponPercent: number | null = null;
      let couponCode: string | null = null;

      if (requestedCouponCode) {
        await tx.$queryRaw`SELECT "code" FROM "Coupon" WHERE "code" = ${requestedCouponCode} FOR UPDATE`;

        const now = new Date();
        const coupon = await tx.coupon.findFirst({
          where: {
            code: requestedCouponCode,
            active: true,
            AND: [
              { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
              { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
            ],
          },
        });

        if (!coupon) {
          throw new Error('COUPON_INVALID');
        }

        couponPercent = coupon.percent;
        couponCode = coupon.code;
      }

      await tx.$queryRaw`SELECT "id" FROM "DeliveryCompany" WHERE "id" = ${parsed.data.shippingCompanyId} FOR UPDATE`;

      const company = await tx.deliveryCompany.findFirst({
        where: {
          id: parsed.data.shippingCompanyId,
          active: true,
        },
      });

      if (!company) {
        throw new Error('SHIPPING_INVALID');
      }

      await tx.$queryRaw`SELECT "id" FROM "Address" WHERE "id" = ${addressId} FOR UPDATE`;

      const shippingAddress = await tx.address.findFirst({
        where: {
          id: addressId,
          userId: user.id,
        },
        select: {
          fullName: true,
          phone: true,
          city: true,
          fullAddress: true,
        },
      });

      if (!shippingAddress) {
        throw new Error('ADDRESS_INVALID');
      }

      // Stock reservation is still conditional so product/variant deactivation
      // committed during this transaction causes a rollback instead of a stale sale.
      for (const { item } of pricedItems) {
        const reserved = await tx.variantSize.updateMany({
          where: {
            id: item.variantSizeId,
            isActive: true,
            stockQty: { gte: item.quantity },
            variant: {
              isActive: true,
              product: { status: 'PUBLISHED' },
            },
          },
          data: {
            stockQty: { decrement: item.quantity },
          },
        });

        if (reserved.count !== 1) {
          throw new Error('STOCK_RACE');
        }
      }

      const shippingFee = allFreeDelivery ? 0 : Number(company.priceMAD);
      const normalizedSubtotal = Number(subtotal.toFixed(2));
      const discountMAD = couponPercent
        ? Number((normalizedSubtotal * couponPercent / 100).toFixed(2))
        : 0;
      const totalMAD = Number(
        (normalizedSubtotal - discountMAD + shippingFee).toFixed(2),
      );

      const created = await tx.order.create({
        data: {
          userId: user.id,
          status: 'PENDING',
          totalMAD,
          currency: 'MAD',
          shippingCompanyId: company.id,
          shippingCompanyNameSnapshot: company.name,
          shippingFeeMAD: shippingFee,
          couponCode,
          couponCodeSnapshot: couponCode,
          couponPercentApplied: couponPercent ?? undefined,
          subtotalMAD: normalizedSubtotal,
          discountMAD,
          placedAt: new Date(),
          shippingAddressId: addressId,
          shippingFullNameSnapshot: shippingAddress.fullName,
          shippingPhoneSnapshot: shippingAddress.phone,
          shippingCitySnapshot: shippingAddress.city,
          shippingAddressSnapshot: shippingAddress.fullAddress,
          items: {
            create: pricedItems.map(({ item, size, unitPriceMAD }) => ({
              variantSizeId: size.id,
              titleSnapshot: size.variant.title,
              skuSnapshot: size.sku,
              productBrandSnapshot: size.variant.product.brand,
              imageSnapshot:
                size.variant.images[0]?.url ??
                size.variant.variantStyleImg ??
                null,
              attributesSnapshot: {
                size: size.size,
                variantName: size.variant.name,
              },
              quantity: item.quantity,
              unitPriceMAD,
            })),
          },
        },
        include: {
          items: true,
          shippingCompany: true,
          shippingAddress: true,
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return created;
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === 'CART_CHANGED' ||
        error.message === 'STOCK_RACE'
      ) {
        return {
          ok: false,
          error: 'Your cart changed while placing the order. Please review it and try again.',
        };
      }

      if (error.message === 'COUPON_INVALID') {
        return { ok: false, error: 'Coupon invalid or expired' };
      }

      if (error.message === 'SHIPPING_INVALID') {
        return { ok: false, error: 'Invalid delivery company' };
      }

      if (error.message === 'ADDRESS_INVALID') {
        return { ok: false, error: 'Invalid shipping address' };
      }
    }

    throw error;
  }

  const cookie = await cookies();
  cookie.set('hajzen_cart', JSON.stringify({ items: [], updatedAt: Date.now() }), {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  try {
    const html = renderEmail(OrderConfirmationEmail({ order } as any));
    const u = await prisma.user.findUnique({ where: { id: order.userId! } });
    if (u?.email) await sendEmail(u.email, 'Your order has been placed', html);
  } catch {}

  redirect('/profile/orders/' + order.id);
}
