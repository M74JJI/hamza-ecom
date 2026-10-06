import { prisma } from "@/lib/db";
import {
  expandCategoryIds,
  getCatalogCategories,
  type CatalogCategory,
} from "@/lib/catalog/categories";
import { NextResponse } from "next/server";
import { z } from "zod";

type CategoryNode = CatalogCategory & {
  children: CategoryNode[];
};

const querySchema = z.object({
  categories: z.array(z.string().trim().min(1).max(100)).max(20),
});

function buildCategoryTree(
  categories: CatalogCategory[],
  parentId: string | null = null,
): CategoryNode[] {
  return categories
    .filter((category) => category.parentId === parentId)
    .map((category) => ({
      ...category,
      children: buildCategoryTree(categories, category.id),
    }));
}

function finalPrice(priceMAD: number, discountPercent?: number | null) {
  const discount = Math.min(100, Math.max(0, discountPercent ?? 0));
  return Math.max(0, priceMAD * (1 - discount / 100));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({
    categories: searchParams.getAll("category"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid filter parameters" },
      { status: 400 },
    );
  }

  const allCategories = await getCatalogCategories();
  const categoryTree = buildCategoryTree(allCategories);
  const selectedCategories = Array.from(new Set(parsed.data.categories));
  const categoryIds = expandCategoryIds(allCategories, selectedCategories);

  const productFilter = {
    status: "PUBLISHED",
    variants: {
      some: {
        isActive: true,
        sizes: { some: { isActive: true } },
      },
    },
    ...(selectedCategories.length > 0
      ? {
          categories: {
            some: {
              categoryId: { in: categoryIds },
            },
          },
        }
      : {}),
  } as const;

  const [brands, variants, variantSizes] = await Promise.all([
    prisma.product.findMany({
      where: productFilter,
      select: { brand: true },
      distinct: ["brand"],
    }),
    prisma.variant.findMany({
      where: {
        isActive: true,
        product: productFilter,
        sizes: { some: { isActive: true } },
      },
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
        isActive: true,
        variant: {
          isActive: true,
          product: productFilter,
        },
      },
      select: {
        priceMAD: true,
        discountPercent: true,
      },
    }),
  ]);

  const colors = new Set<string>();
  const sizes = new Set<string>();

  for (const variant of variants) {
    if (variant.color) colors.add(variant.color);
    for (const size of variant.sizes) sizes.add(size.size);
  }

  const prices = variantSizes.map((size) =>
    finalPrice(Number(size.priceMAD), size.discountPercent),
  );

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const categoryNameMap = Object.fromEntries(
    allCategories.map((category) => [category.id, category.name]),
  );

  return NextResponse.json({
    categories: categoryTree,
    categoryNameMap,
    brands: brands
      .map((entry) => entry.brand.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b)),
    colors: Array.from(colors).sort((a, b) => a.localeCompare(b)),
    sizes: Array.from(sizes).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    ),
    priceRange: {
      min: Math.floor(minPrice),
      max: Math.ceil(maxPrice),
    },
  });
}
