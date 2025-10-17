import { prisma } from "@/lib/db";

export async function getCartItemCountByUser(userId: string): Promise<number> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { select: { quantity: true } } },
  });
  return cart?.items.reduce((a, b) => a + b.quantity, 0) ?? 0;
}



/**
 * Returns the user's cart, or creates a new one if none exists.
 */
export async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { variantSize: true } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { variantSize: true } } },
    });
  }

  return cart;
}
