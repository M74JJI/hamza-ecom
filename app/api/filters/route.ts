import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

type CategoryNode = {
  id: string;
  name: string;
  parentId: string | null;
  slug?: string;
  children?: CategoryNode[];
};

function buildCategoryTree(
  categories: { id: string; name: string; parentId: string | null; slug?: string }[],
  parentId: string | null = null
): CategoryNode[] {
  return categories
    .filter((c) => c.parentId === parentId)
    .map((c) => ({
      ...c,
      children: buildCategoryTree(categories, c.id),
    }));
}

// 🧠 Recursively collect all children IDs
function collectCategoryIds(all: { id: string; parentId: string | null }[], id: string): string[] {
  const collected: string[] = [id];
  all
    .filter((c) => c.parentId === id)
    .forEach((child) => collected.push(...collectCategoryIds(all, child.id)));
  return collected;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryParams = searchParams.getAll("category");

  // 🟩 1. Fetch all categories
  const allCategories = await prisma.category.findMany({
    select: { id: true, name: true, parentId: true, slug: true },
    orderBy: { name: "asc" },
  });

  const categoryTree = buildCategoryTree(allCategories);

  // 🟩 2. Collect all selected category IDs recursively
  let categoryIds: string[] = [];
  if (categoryParams.length) {
    const allIds = new Set<string>();
    for (const id of categoryParams) {
      collectCategoryIds(allCategories, id).forEach((cid) => allIds.add(cid));
    }
    categoryIds = Array.from(allIds);
  }

  // 🟩 3. Product filter base
  const productFilter: any = {
    status: "PUBLISHED",
    ...(categoryIds.length
      ? {
          categories: {
            some: { categoryId: { in: categoryIds } },
          },
        }
      : {}),
  };

  // 🟩 4. Fetch all filters + variant prices
  const [brands, variants, variantSizes] = await Promise.all([
    prisma.product.findMany({
      where: productFilter,
      select: { brand: true },
      distinct: ["brand"],
    }),
    prisma.variant.findMany({
      where: { isActive: true, product: productFilter },
      select: {
        color: true,
        sizes: {
          where: { isActive: true },
          select: { size: true },
        },
      },
    }),
    prisma.variantSize.findMany({
      where: {
        variant: { product: productFilter },
        isActive: true,
      },
      select: {
        priceMAD: true,
        discountPercent: true,
      },
    }),
  ]);

  // 🟩 5. Extract unique colors and sizes
  const colorSet = new Set<string>();
  const sizeSet = new Set<string>();
  variants.forEach((v) => {
    if (v.color) colorSet.add(v.color);
    v.sizes.forEach((s) => sizeSet.add(s.size));
  });

  // 🟩 6. Compute price range (with discount)
  let minPrice = Infinity;
  let maxPrice = 0;

  for (const vs of variantSizes) {
    const discount = vs.discountPercent ? vs.discountPercent / 100 : 0;
    const finalPrice = Math.max(0, vs.priceMAD * (1 - discount));
    if (finalPrice < minPrice) minPrice = finalPrice;
    if (finalPrice > maxPrice) maxPrice = finalPrice;
  }

  if (!isFinite(minPrice)) minPrice = 0;
  if (!isFinite(maxPrice)) maxPrice = 10000;

  // 🟩 7. Build category label map
  const categoryNameMap: Record<string, string> = {};
  allCategories.forEach((c) => {
    categoryNameMap[c.id] = c.name;
  });

  // 🟩 8. Return final JSON
  return NextResponse.json({
    categories: categoryTree,
    categoryNameMap,
    brands: brands.map((b) => b.brand).filter(Boolean),
    colors: Array.from(colorSet),
    sizes: Array.from(sizeSet),
    priceRange: {
      min: Math.round(minPrice),
      max: Math.round(maxPrice),
    },
  });
}
