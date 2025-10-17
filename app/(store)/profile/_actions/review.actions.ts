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
  await prisma.review.update({
    where: { id },
    data: { rating: data.rating, comment: data.comment }
  });

  // Recompute product rating
  const r = await prisma.review.findUnique({ where: { id }, select: { productId: true } });
  if(r?.productId){
    const agg = await prisma.review.aggregate({ where: { productId: r.productId }, _avg: { rating: true } });
    await prisma.product.update({ where: { id: r.productId }, data: { rating: agg._avg.rating ?? 0 } });
  }
}

export async function deleteReview(id: string){
  const { user } = await requireUser();
  const r = await prisma.review.delete({ where: { id } });

  // Recompute rating
  const agg = await prisma.review.aggregate({ where: { productId: r.productId }, _avg: { rating: true } });
  await prisma.product.update({ where: { id: r.productId }, data: { rating: agg._avg.rating ?? 0 } });
}
