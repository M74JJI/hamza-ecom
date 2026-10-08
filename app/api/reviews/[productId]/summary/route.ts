import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { publicDatabaseCache } from "@/lib/http/cache";
import { z } from "zod";

const paramsSchema = z.object({ productId: z.string().min(1).max(100) });

export async function GET(_req: NextRequest, context: RouteContext<"/api/reviews/[productId]/summary">) {
  const parsed = paramsSchema.safeParse(await context.params);
  if (!parsed.success) {
    return Response.json({ error: "Invalid product" }, { status: 400 });
  }
  const { productId } = parsed.data;

  const grouped = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: { _all: true },
  });

  const total = grouped.reduce((a, g) => a + g._count._all, 0);
  const avg =
    total === 0
      ? 0
      : Number(
          (
            grouped.reduce((s, g) => s + g.rating * g._count._all, 0) / total
          ).toFixed(2)
        );

  const buckets = [5, 4, 3, 2, 1].map((star) => {
    const g = grouped.find((x) => x.rating === star);
    const count = g?._count._all || 0;
    return {
      star,
      count,
      pct: total ? Number(((count / total) * 100).toFixed(1)) : 0,
    };
  });

  return Response.json(
    { total, avg, buckets },
    { headers: publicDatabaseCache(60) },
  );
}
