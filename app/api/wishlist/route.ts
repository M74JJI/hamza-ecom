import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isSameOriginMutation } from "@/lib/security/request-origin";
import { z } from "zod";

const idPairSchema = z.object({
  productId: z.string().min(1).max(100),
  variantId: z.string().min(1).max(100),
});

const wishlistMutationSchema = idPairSchema.extend({
  action: z.enum(["add", "remove"]).optional().default("add"),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: {
      product: true,
      variant: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json(
      { ok: false, error: "CROSS_ORIGIN_REJECTED" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = wishlistMutationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "INVALID_INPUT" },
      { status: 400 },
    );
  }

  const { productId, variantId, action } = parsed.data;

  if (action === "remove") {
    await prisma.wishlistItem.deleteMany({
      where: { userId: user.id, productId, variantId },
    });
    return NextResponse.json({ ok: true, action: "removed" });
  }

  const validVariant = await prisma.variant.findFirst({
    where: {
      id: variantId,
      productId,
      isActive: true,
      product: {
        status: "PUBLISHED",
      },
    },
    select: { id: true },
  });

  if (!validVariant) {
    return NextResponse.json(
      { ok: false, error: "VARIANT_UNAVAILABLE" },
      { status: 400 },
    );
  }

  await prisma.wishlistItem.upsert({
    where: {
      userId_productId_variantId: {
        userId: user.id,
        productId,
        variantId: validVariant.id,
      },
    },
    create: {
      userId: user.id,
      productId,
      variantId: validVariant.id,
    },
    update: {},
  });

  return NextResponse.json({ ok: true, action: "added" });
}

export async function DELETE(req: Request) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json(
      { ok: false, error: "CROSS_ORIGIN_REJECTED" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const parsed = idPairSchema.safeParse({
    productId: url.searchParams.get("productId"),
    variantId: url.searchParams.get("variantId"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "INVALID_INPUT" },
      { status: 400 },
    );
  }

  await prisma.wishlistItem.deleteMany({
    where: {
      userId: user.id,
      productId: parsed.data.productId,
      variantId: parsed.data.variantId,
    },
  });

  return NextResponse.json({ ok: true, action: "removed" });
}
