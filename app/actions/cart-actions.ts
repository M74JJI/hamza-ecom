'use server';

import { prisma } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getOrCreateCart } from "@/lib/cart";
import { requireUser } from "@/lib/require-user";

const applyDiscount = (val:number, pct?:number|null)=> (!pct || pct<=0) ? val : Math.max(0, Number((val * (100 - pct)/100).toFixed(2)));

const CartItemSchema = z.object({
  variantSizeId: z.string().min(1),
  quantity: z.number().int().min(1).max(10)
});

const CartQuantitySchema = z.number().int().min(0).max(10);

export async function addToCartAction(input: unknown) {
  const { user } = await requireUser();
  const parsed = CartItemSchema.parse(input);

  const size = await prisma.variantSize.findUnique({
    where: { id: parsed.variantSizeId },
    include: { variant: true }
  });
  if(!size) return { error: "Variant size not found" };
  if(size.stockQty <= 0) return { error: "Out of stock" };

  const unitPriceMAD = applyDiscount(Number(size.priceMAD), size.discountPercent);

  let cart = await getOrCreateCart(user.id);
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: user.id },
      include: { items: { include: { variantSize: true } } },
    });
  }

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, variantSizeId: parsed.variantSizeId }
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: Math.min(10, existing.quantity + parsed.quantity),
        unitPriceMAD
      }
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantSizeId: parsed.variantSizeId,
        quantity: parsed.quantity,
        unitPriceMAD
      }
    });
  }

  revalidatePath("/cart");
  return { ok: true };
}

export async function updateCartItemQuantityAction(id: string, quantity: number) {
  const { user } = await requireUser();
  const parsedQuantity = CartQuantitySchema.parse(quantity);

  const owned = await prisma.cartItem.findFirst({
    where: {
      id,
      cart: { userId: user.id },
    },
    select: { id: true },
  });
  if (!owned) {
    throw new Error("Cart item not found");
  }

  if (parsedQuantity === 0) {
    await prisma.cartItem.delete({ where: { id: owned.id } });
  } else {
    await prisma.cartItem.update({
      where: { id: owned.id },
      data: { quantity: parsedQuantity }
    });
  }

  revalidatePath("/cart");
}

export async function removeCartItemAction(id: string) {
  const { user } = await requireUser();

  const deleted = await prisma.cartItem.deleteMany({
    where: {
      id,
      cart: { userId: user.id },
    },
  });

  if (deleted.count !== 1) {
    throw new Error("Cart item not found");
  }

  revalidatePath("/cart");
}
