import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { publicDatabaseCache } from "@/lib/http/cache";
import { z } from "zod";

const paramsSchema = z.object({ productId: z.string().min(1).max(100) });

export async function GET(_req: NextRequest, context: RouteContext<"/api/reviews/[productId]">) {
  const parsed = paramsSchema.safeParse(await context.params);
  if (!parsed.success) {
    return Response.json({ error: "Invalid product" }, { status: 400 });
  }
  const { productId } = parsed.data;

  const pageSize = 10;

  const reviews = await prisma.review.findMany({
    where: { productId },
    take: pageSize,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
      chosenVariant: true,
    },
  });

  const count = await prisma.review.count({ where: { productId } });

  return Response.json(
    { reviews, count },
    { headers: publicDatabaseCache(60) },
  );
}
