'use server';

import { getSessionUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';

/**
 * Add an item to the user's wishlist.
 * Prevents duplicates for the same (product, variant).
 */
export async function addWishlistItem(productId: string, variantId: string) {
  const { user } = await requireUser();

  // Validate product & variant relationship
  const variant = await prisma.variant.findUnique({
    where: { id: variantId },
    select: { productId: true },
  });

  if (!variant || variant.productId !== productId) {
    throw new Error('Invalid product/variant combination');
  }

  await prisma.wishlistItem.upsert({
    where: {
      userId_productId_variantId: {
        userId: user.id,
        productId,
        variantId,
      },
    },
    update: {}, // nothing to update if it already exists
    create: {
      userId: user.id,
      productId,
      variantId,
    },
  });

  return { ok: true };
}

/**
 * Remove an item from the user's wishlist.
 */
export async function removeWishlistItem(productId: string, variantId: string) {
  const { user } = await requireUser();

  await prisma.wishlistItem.delete({
    where: {
      userId_productId_variantId: {
        userId: user.id,
        productId,
        variantId,
      },
    },
  });

  return { ok: true };
}

/**
 * Move an item from wishlist to cart (optional future enhancement).
 * Currently just removes it from wishlist.
 */
export async function moveWishlistToCart(productId: string, variantId: string) {
  const { user } = await requireUser();

  await prisma.wishlistItem.delete({
    where: {
      userId_productId_variantId: {
        userId: user.id,
        productId,
        variantId,
      },
    },
  });

  // Optional: you could add to cart here in the future
  return { ok: true };
}


export async function isInWishlist(productId: string, variantId: string) {
  const user = await getSessionUser();
  if (!user) return false;

  const item = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId_variantId: {
        userId: user.id,
        productId,
        variantId,
      },
    },
  });

  return !!item;
}