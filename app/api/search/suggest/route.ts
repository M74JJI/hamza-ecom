import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().trim().min(1).max(120),
});

function finalPrice(priceMAD: number, discountPercent?: number | null) {
  const discount = Math.min(100, Math.max(0, discountPercent ?? 0));
  return Math.max(0, priceMAD * (1 - discount / 100));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({ q: searchParams.get("q") ?? "" });

  if (!parsed.success) {
    if (!(searchParams.get("q") ?? "").trim()) {
      return NextResponse.json({ suggestions: [] });
    }

    return NextResponse.json(
      { error: "Invalid search query" },
      { status: 400 },
    );
  }

  const q = parsed.data.q;

  const variants = await prisma.variant.findMany({
    where: {
      isActive: true,
      sizes: { some: { isActive: true } },
      product: { status: "PUBLISHED" },
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { product: { brand: { contains: q, mode: "insensitive" } } },
      ],
    },
    include: {
      product: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      sizes: {
        where: { isActive: true },
        orderBy: { priceMAD: "asc" },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 6,
  });

  const suggestions = variants.map((variant) => {
    const cheapest = variant.sizes.reduce<{
      price: number;
      originalPrice: number;
      discountPercent: number;
    } | null>((best, size) => {
      const originalPrice = Number(size.priceMAD);
      const price = finalPrice(originalPrice, size.discountPercent);
      if (!best || price < best.price) {
        return {
          price,
          originalPrice,
          discountPercent: size.discountPercent ?? 0,
        };
      }
      return best;
    }, null);

    return {
      productSlug: variant.product.slug,
      variantId: variant.id,
      title: variant.title,
      name: variant.name,
      brand: variant.product.brand,
      thumb: variant.variantStyleImg || variant.images[0]?.url || null,
      price: cheapest?.price ?? null,
      originalPrice: cheapest?.originalPrice ?? null,
      discountPercent: cheapest?.discountPercent ?? 0,
    };
  });

  return NextResponse.json({ suggestions });
}
