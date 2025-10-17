import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, context: any) {
  // ✅ Handle both sync and async params
  const params = await Promise.resolve(context.params);
  const { productId } = params;

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

  return Response.json({ reviews, count });
}
