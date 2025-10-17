import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, context: any) {
  const params = await Promise.resolve(context.params);
  const { productId } = params;

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

  return Response.json({ total, avg, buckets });
}
