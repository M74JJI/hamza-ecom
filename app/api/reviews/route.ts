import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { z } from "zod";

const reviewSchema = z
  .object({
    productId: z.string().min(1).max(100),
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().min(1).max(2000),
    chosenVariantId: z.string().min(1).max(100).nullable().optional(),
    chosenSize: z.string().trim().min(1).max(100).nullable().optional(),
    quantity: z.number().int().min(1).max(100).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.chosenSize && !value.chosenVariantId) {
      ctx.addIssue({
        code: "custom",
        path: ["chosenSize"],
        message: "A chosen variant is required when a size is provided",
      });
    }
  });

export async function POST(req: Request) {
  const { user } = await requireUser();
  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const {
    productId,
    rating,
    comment,
    chosenVariantId,
    chosenSize,
    quantity,
  } = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: {
        id: productId,
        status: "PUBLISHED",
      },
      select: { id: true },
    });

    if (!product) {
      return { ok: false as const, status: 404, error: "Product not found" };
    }

    // Serialize review writes for a product so the cached aggregate rating
    // stays consistent with the database-level one-review-per-user constraint.
    await tx.$queryRaw`SELECT "id" FROM "Product" WHERE "id" = ${product.id} FOR UPDATE`;

    if (chosenVariantId) {
      const variant = await tx.variant.findFirst({
        where: {
          id: chosenVariantId,
          productId: product.id,
        },
        select: { id: true },
      });

      if (!variant) {
        return {
          ok: false as const,
          status: 400,
          error: "Chosen variant does not belong to this product",
        };
      }

      if (chosenSize) {
        const size = await tx.variantSize.findFirst({
          where: {
            variantId: variant.id,
            size: chosenSize,
          },
          select: { id: true },
        });

        if (!size) {
          return {
            ok: false as const,
            status: 400,
            error: "Chosen size does not belong to the selected variant",
          };
        }
      }
    }

    await tx.review.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id,
        },
      },
      update: {
        rating,
        comment,
        chosenVariantId: chosenVariantId ?? null,
        chosenSize: chosenSize ?? null,
        quantity: quantity ?? null,
      },
      create: {
        productId: product.id,
        userId: user.id,
        rating,
        comment,
        chosenVariantId: chosenVariantId ?? null,
        chosenSize: chosenSize ?? null,
        quantity: quantity ?? null,
      },
    });

    const aggregate = await tx.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
    });

    const newRating = aggregate._avg.rating ?? 0;

    await tx.product.update({
      where: { id: product.id },
      data: { rating: newRating },
    });

    return {
      ok: true as const,
      newRating,
    };
  });

  if (!result.ok) {
    return Response.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return Response.json(result);
}
