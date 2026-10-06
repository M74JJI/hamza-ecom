"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(2000),
});

export async function updateReview(id: string, input: unknown) {
  const { user } = await requireUser();
  const data = reviewSchema.parse(input);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.review.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
        productId: true,
      },
    });

    if (!existing) {
      throw new Error("Review not found");
    }

    await tx.$queryRaw`SELECT "id" FROM "Product" WHERE "id" = ${existing.productId} FOR UPDATE`;

    const stillOwned = await tx.review.findFirst({
      where: {
        id: existing.id,
        userId: user.id,
        productId: existing.productId,
      },
      select: { id: true },
    });

    if (!stillOwned) {
      throw new Error("Review not found");
    }

    await tx.review.update({
      where: { id: stillOwned.id },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
    });

    const aggregate = await tx.review.aggregate({
      where: { productId: existing.productId },
      _avg: { rating: true },
    });

    await tx.product.update({
      where: { id: existing.productId },
      data: { rating: aggregate._avg.rating ?? 0 },
    });
  });

  return { ok: true };
}

export async function deleteReview(id: string) {
  const { user } = await requireUser();

  await prisma.$transaction(async (tx) => {
    const existing = await tx.review.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
        productId: true,
      },
    });

    if (!existing) {
      throw new Error("Review not found");
    }

    await tx.$queryRaw`SELECT "id" FROM "Product" WHERE "id" = ${existing.productId} FOR UPDATE`;

    const deleted = await tx.review.deleteMany({
      where: {
        id: existing.id,
        userId: user.id,
        productId: existing.productId,
      },
    });

    if (deleted.count !== 1) {
      throw new Error("Review not found");
    }

    const aggregate = await tx.review.aggregate({
      where: { productId: existing.productId },
      _avg: { rating: true },
    });

    await tx.product.update({
      where: { id: existing.productId },
      data: { rating: aggregate._avg.rating ?? 0 },
    });
  });

  return { ok: true };
}
