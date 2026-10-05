'use server';

import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
});

export async function updateReview(id: string, input: unknown){
  const { user } = await requireUser();
  const data = reviewSchema.parse(input);

  const existing = await prisma.review.findFirst({
    where: { id, userId: user.id },
    select: { id: true, productId: true },
  });
  if (!existing) {
    throw new Error('Review not found');
  }

  await prisma.review.update({
    where: { id: existing.id },
    data: { rating: data.rating, comment: data.comment }
  });

  const agg = await prisma.review.aggregate({
    where: { productId: existing.productId },
    _avg: { rating: true }
  });
  await prisma.product.update({
    where: { id: existing.productId },
    data: { rating: agg._avg.rating ?? 0 }
  });
}

export async function deleteReview(id: string){
  const { user } = await requireUser();

  const existing = await prisma.review.findFirst({
    where: { id, userId: user.id },
    select: { id: true, productId: true },
  });
  if (!existing) {
    throw new Error('Review not found');
  }

  await prisma.review.delete({ where: { id: existing.id } });

  const agg = await prisma.review.aggregate({
    where: { productId: existing.productId },
    _avg: { rating: true }
  });
  await prisma.product.update({
    where: { id: existing.productId },
    data: { rating: agg._avg.rating ?? 0 }
  });
}
