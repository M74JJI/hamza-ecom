"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";

const applyDiscount = (value: number, percent?: number | null) => {
  const discount = Math.min(100, Math.max(0, percent ?? 0));
  return Math.max(0, Number((value * (1 - discount / 100)).toFixed(2)));
};

const CartItemSchema = z.object({
  variantSizeId: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(10),
});

const CartQuantitySchema = z.number().int().min(0).max(10);

export async function addToCartAction(input: unknown) {
  const { user } = await requireUser();
  const parsed = CartItemSchema.parse(input);

  const result = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
      select: { id: true },
    });

    // Serialize mutations for this cart so concurrent add requests cannot
    // create duplicate logical lines for the same variant size.
    await tx.$queryRaw`SELECT "id" FROM "Cart" WHERE "id" = ${cart.id} FOR UPDATE`;

    const size = await tx.variantSize.findFirst({
      where: {
        id: parsed.variantSizeId,
        isActive: true,
        variant: {
          isActive: true,
          product: { status: "PUBLISHED" },
        },
      },
      select: {
        id: true,
        stockQty: true,
        priceMAD: true,
        discountPercent: true,
      },
    });

    if (!size) return { error: "Variant size is unavailable" };
    if (size.stockQty <= 0) return { error: "Out of stock" };

    const existing = await tx.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantSizeId: size.id,
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    const nextQuantity = (existing?.quantity ?? 0) + parsed.quantity;
    if (nextQuantity > 10) {
      return { error: "Maximum quantity is 10 per cart line" };
    }
    if (nextQuantity > size.stockQty) {
      return { error: "Requested quantity exceeds available stock" };
    }

    const unitPriceMAD = applyDiscount(
      Number(size.priceMAD),
      size.discountPercent,
    );

    if (existing) {
      await tx.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: nextQuantity,
          unitPriceMAD,
        },
      });
    } else {
      await tx.cartItem.create({
        data: {
          cartId: cart.id,
          variantSizeId: size.id,
          quantity: parsed.quantity,
          unitPriceMAD,
        },
      });
    }

    return { ok: true as const };
  });

  if (result.ok) revalidatePath("/cart");
  return result;
}

export async function updateCartItemQuantityAction(id: string, quantity: number) {
  const { user } = await requireUser();
  const parsedQuantity = CartQuantitySchema.parse(quantity);

  const result = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!cart) return { error: "Cart item not found" };

    await tx.$queryRaw`SELECT "id" FROM "Cart" WHERE "id" = ${cart.id} FOR UPDATE`;

    const item = await tx.cartItem.findFirst({
      where: {
        id,
        cartId: cart.id,
      },
      include: {
        variantSize: {
          include: {
            variant: {
              select: {
                isActive: true,
                product: { select: { status: true } },
              },
            },
          },
        },
      },
    });

    if (!item) return { error: "Cart item not found" };

    if (parsedQuantity === 0) {
      await tx.cartItem.delete({ where: { id: item.id } });
      return { ok: true as const };
    }

    const size = item.variantSize;
    if (
      !size.isActive ||
      !size.variant.isActive ||
      size.variant.product.status !== "PUBLISHED"
    ) {
      return { error: "Variant size is unavailable" };
    }

    if (parsedQuantity > size.stockQty) {
      return { error: "Requested quantity exceeds available stock" };
    }

    await tx.cartItem.update({
      where: { id: item.id },
      data: {
        quantity: parsedQuantity,
        unitPriceMAD: applyDiscount(
          Number(size.priceMAD),
          size.discountPercent,
        ),
      },
    });

    return { ok: true as const };
  });

  if (result.ok) revalidatePath("/cart");
  return result;
}

export async function removeCartItemAction(id: string) {
  const { user } = await requireUser();

  const result = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!cart) return { error: "Cart item not found" };

    await tx.$queryRaw`SELECT "id" FROM "Cart" WHERE "id" = ${cart.id} FOR UPDATE`;

    const deleted = await tx.cartItem.deleteMany({
      where: {
        id,
        cartId: cart.id,
      },
    });

    if (deleted.count !== 1) {
      return { error: "Cart item not found" };
    }

    return { ok: true as const };
  });

  if (result.ok) revalidatePath("/cart");
  return result;
}
