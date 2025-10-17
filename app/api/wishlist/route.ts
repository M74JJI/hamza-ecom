import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: {
      product: true,
      variant: true, // ✅ include variant too
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { ok: false, error: "UNAUTHENTICATED" },
      { status: 401 }
    );

  const { productId, variantId, action } = await req.json();

  if (!productId || !variantId)
    return NextResponse.json(
      { ok: false, error: "MISSING_IDS" },
      { status: 400 }
    );

  if (action === "remove") {
    await prisma.wishlistItem.deleteMany({
      where: { userId: user.id, productId, variantId },
    });
    return NextResponse.json({ ok: true, action: "removed" });
  }

  await prisma.wishlistItem.upsert({
    where: {
      userId_productId_variantId: {
        userId: user.id,
        productId,
        variantId,
      },
    },
    create: { userId: user.id, productId, variantId },
    update: {},
  });

  return NextResponse.json({ ok: true, action: "added" });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { ok: false, error: "UNAUTHENTICATED" },
      { status: 401 }
    );

  const url = new URL(req.url);
  const productId = url.searchParams.get("productId") ?? undefined;
  const variantId = url.searchParams.get("variantId") ?? undefined;

  if (!productId || !variantId)
    return NextResponse.json(
      { ok: false, error: "MISSING_IDS" },
      { status: 400 }
    );

  await prisma.wishlistItem.deleteMany({
    where: { userId: user.id, productId, variantId },
  });

  return NextResponse.json({ ok: true, action: "removed" });
}
