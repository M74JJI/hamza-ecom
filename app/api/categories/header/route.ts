import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const items = await prisma.category.findMany({
    where: { isActiveInHeader: true },
    select: { id: true, name: true, slug: true, imageUrl: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ items });
}
