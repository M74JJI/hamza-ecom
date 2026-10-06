import { prisma } from "@/lib/db";

export async function getCartItemCountByUser(userId: string): Promise<number> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { select: { quantity: true } } },
  });

  return cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
}

/**
 * Returns the user's cart, creating it atomically when needed.
 */
export async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: { variantSize: true },
      },
    },
  });
}
