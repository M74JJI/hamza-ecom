'use server';

import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { makePremiumInvoicePdf } from '@/lib/pdf/invoice';

function readAttributes(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function downloadInvoice(orderId: string) {
  const { user } = await requireUser();

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: {
      shippingAddress: true,
      shippingCompany: true,
      items: {
        include: {
          variantSize: {
            include: {
              variant: {
                include: {
                  product: true,
                  images: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) throw new Error('Order not found');

  const hasAddressSnapshot = Boolean(
    order.shippingFullNameSnapshot ||
      order.shippingPhoneSnapshot ||
      order.shippingCitySnapshot ||
      order.shippingAddressSnapshot,
  );

  const invoiceData = {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    subtotalMAD: Number(order.subtotalMAD ?? 0),
    discountMAD: Number(order.discountMAD ?? 0),
    shippingFeeMAD: Number(order.shippingFeeMAD ?? 0),
    totalMAD: Number(order.totalMAD ?? 0),
    couponCode: order.couponCode ?? null,
    shippingCompany:
      order.shippingCompanyNameSnapshot ??
      order.shippingCompany?.name ??
      null,
    address:
      hasAddressSnapshot || order.shippingAddress
        ? {
            fullName:
              order.shippingFullNameSnapshot ??
              order.shippingAddress?.fullName ??
              '',
            phone:
              order.shippingPhoneSnapshot ??
              order.shippingAddress?.phone ??
              '',
            city:
              order.shippingCitySnapshot ??
              order.shippingAddress?.city ??
              '',
            fullAddress:
              order.shippingAddressSnapshot ??
              order.shippingAddress?.fullAddress ??
              '',
          }
        : null,
    items: order.items.map((item) => {
      const attributes = readAttributes(item.attributesSnapshot);
      const variantSize = item.variantSize;
      const variant = variantSize.variant;
      const product = variant.product;

      const size =
        typeof attributes.size === 'string'
          ? attributes.size
          : variantSize.size;

      return {
        title: item.titleSnapshot || variant.title,
        productBrand:
          item.productBrandSnapshot ??
          product.brand,
        size,
        sku: item.skuSnapshot || variantSize.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPriceMAD),
        totalPrice: Number(item.unitPriceMAD) * item.quantity,
        image:
          item.imageSnapshot ??
          variant.images[0]?.url ??
          variant.variantStyleImg ??
          null,
      };
    }),
  };

  const pdfBytes = await makePremiumInvoicePdf({ order: invoiceData });
  return { bytes: pdfBytes.buffer };
}
