import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';

export async function POST(req: Request) {
  const { user } = await requireUser();
  const body = await req.json();
  const { productId, rating, comment, chosenVariantId, chosenSize, quantity } = body || {};

  if (!productId || !rating || rating < 1 || rating > 5 || !comment) {
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
  }

  // ensure product exists
  const prod = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!prod) {
    return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
  }

  // run transaction: upsert review + recalc product rating
  const result = await prisma.$transaction(async (tx) => {
    // check if user already reviewed this product
    const existing = await tx.review.findFirst({
      where: { productId, userId: user.id },
      select: { id: true },
    });

    // create or update review
    if (existing) {
      await tx.review.update({
        where: { id: existing.id },
        data: {
          rating,
          comment,
          chosenVariantId: chosenVariantId || null,
          chosenSize: chosenSize || null,
          quantity: typeof quantity === 'number' ? quantity : null,
          updatedAt: new Date(),
        },
      });
    } else {
      await tx.review.create({
        data: {
          productId,
          userId: user.id,
          rating,
          comment,
          chosenVariantId: chosenVariantId || null,
          chosenSize: chosenSize || null,
          quantity: typeof quantity === 'number' ? quantity : null,
        },
      });
    }

    // recalculate average rating
    const avg = await tx.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    await tx.product.update({
      where: { id: productId },
      data: { rating: avg._avg.rating ?? 0 },
    });

    return avg._avg.rating ?? 0;
  });

  return Response.json({ ok: true, newRating: result });
}
