'use server';

import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { makePremiumInvoicePdf } from '@/lib/pdf/invoice';

export async function downloadInvoice(orderId: string) {
  const { user } = await requireUser();

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: {
      shippingAddress: true,
      shippingCompany: true,
      coupon: true,
      items: {
        include: {
          variantSize: {
            include: {
              variant: {
                include: {
                  product: true,
                  images: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) throw new Error('Order not found');

  const invoiceData = {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    subtotalMAD: Number(order.subtotalMAD ?? 0),
    discountMAD: Number(order.discountMAD ?? 0),
    shippingFeeMAD: Number(order.shippingFeeMAD ?? 0),
    totalMAD: Number(order.totalMAD ?? 0),
    couponCode: order.couponCode ?? null,
    shippingCompany: order.shippingCompany?.name ?? null,
    address: order.shippingAddress
      ? {
          fullName: order.shippingAddress.fullName,
          phone: order.shippingAddress.phone,
          city: order.shippingAddress.city,
          fullAddress: order.shippingAddress.fullAddress,
        }
      : null,
    items: order.items.map((it) => {
      const vs = it.variantSize;
      const v = vs.variant;
      const p = v.product;

      return {
        title: v.title,
        productBrand: p.brand,
        size: vs.size,
        sku: vs.sku,
        quantity: it.quantity,
        unitPrice: Number(it.unitPriceMAD),
        totalPrice: Number(it.unitPriceMAD) * it.quantity,
        image:
          Array.isArray(v.images) && v.images.length > 0
            ? v.images[0].url
            : v.variantStyleImg || null,
      };
    }),
  };

  // ✅ Await the async PDF generator
  const pdfBytes = await makePremiumInvoicePdf({ order: invoiceData });

  // Return directly as ArrayBuffer to client
  return { bytes: pdfBytes.buffer };
}
