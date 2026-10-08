import { prisma } from "@/lib/db";
import { expandCategoryIds, getCatalogCategories } from "@/lib/catalog/categories";
import type { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { publicDatabaseCache } from "@/lib/http/cache";

const PAGE_SIZE = 12;
const MAX_PRICE_MAD = 10_000_000;

const listParam = z.array(z.string().trim().min(1).max(100)).max(20);

const searchSchema = z
  .object({
    q: z.string().trim().max(120).default(""),
    categories: listParam.default([]),
    brands: listParam.default([]),
    colors: listParam.default([]),
    sizes: listParam.default([]),
    min: z.coerce.number().finite().min(0).max(MAX_PRICE_MAD).optional(),
    max: z.coerce.number().finite().min(0).max(MAX_PRICE_MAD).optional(),
    rating: z.coerce.number().finite().min(0).max(5).default(0),
    sort: z
      .enum(["newest", "oldest", "rating", "popular", "price-asc", "price-desc"])
      .default("newest"),
    page: z.coerce.number().int().min(1).max(500).default(1),
  })
  .superRefine((value, ctx) => {
    if (value.min !== undefined && value.max !== undefined && value.min > value.max) {
      ctx.addIssue({
        code: "custom",
        path: ["min"],
        message: "Minimum price cannot exceed maximum price",
      });
    }
  });

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function finalPrice(priceMAD: number, discountPercent?: number | null) {
  const discount = Math.min(100, Math.max(0, discountPercent ?? 0));
  return Math.max(0, priceMAD * (1 - discount / 100));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const parsed = searchSchema.safeParse({
    q: searchParams.get("q") ?? "",
    categories: searchParams.getAll("category"),
    brands: searchParams.getAll("brand"),
    colors: searchParams.getAll("color"),
    sizes: searchParams.getAll("size"),
    min: searchParams.get("min") ?? undefined,
    max: searchParams.get("max") ?? undefined,
    rating: searchParams.get("rating") ?? 0,
    sort: searchParams.get("sort") ?? "newest",
    page: searchParams.get("page") ?? 1,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid search parameters", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const q = parsed.data.q;
  const categories = unique(parsed.data.categories);
  const brands = unique(parsed.data.brands);
  const colors = unique(parsed.data.colors);
  const sizes = unique(parsed.data.sizes);
  const { min, max, rating, sort, page } = parsed.data;
  const skip = (page - 1) * PAGE_SIZE;

  let expandedCategoryIds: string[] = [];
  if (categories.length > 0) {
    const allCategories = await getCatalogCategories();
    expandedCategoryIds = expandCategoryIds(allCategories, categories);
  }

  const andFilters: Prisma.ProductWhereInput[] = [];

  if (q) {
    andFilters.push({
      OR: [
        { brand: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        {
          variants: {
            some: {
              isActive: true,
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { name: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
        {
          categories: {
            some: {
              category: {
                name: { contains: q, mode: "insensitive" },
              },
            },
          },
        },
      ],
    });
  }

  if (categories.length > 0) {
    andFilters.push({
      categories: {
        some: {
          categoryId: { in: expandedCategoryIds },
        },
      },
    });
  }

  if (brands.length > 0) {
    andFilters.push({
      brand: { in: brands, mode: "insensitive" },
    });
  }

  const scopedVariantFilter: Prisma.VariantWhereInput = {
    isActive: true,
  };

  const scopedSizeFilter: Prisma.VariantSizeWhereInput = {
    isActive: true,
  };

  if (colors.length > 0) {
    scopedVariantFilter.color = {
      in: colors,
      mode: "insensitive",
    };
  }

  if (sizes.length > 0) {
    scopedSizeFilter.size = { in: sizes };
  }

  scopedVariantFilter.sizes = { some: scopedSizeFilter };
  andFilters.push({ variants: { some: scopedVariantFilter } });

  if (rating > 0) {
    andFilters.push({ rating: { gte: rating } });
  }

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    AND: andFilters,
  };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "rating":
      orderBy = { rating: "desc" };
      break;
    case "popular":
      orderBy = { reviews: { _count: "desc" } };
      break;
  }

  const include = {
    variants: {
      where: {
        isActive: true,
        sizes: { some: { isActive: true } },
      },
      include: {
        images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
        sizes: {
          where: { isActive: true },
          orderBy: { priceMAD: "asc" as const },
        },
      },
      orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
    },
    categories: { include: { category: true } },
    _count: { select: { reviews: true } },
  } satisfies Prisma.ProductInclude;

  const priceSensitive =
    min !== undefined ||
    max !== undefined ||
    sort === "price-asc" ||
    sort === "price-desc";

  type SearchProduct = Prisma.ProductGetPayload<{ include: typeof include }>;

  let products: SearchProduct[];
  let total: number;

  if (priceSensitive) {
    const priceCandidates = await prisma.product.findMany({
      where,
      select: {
        id: true,
        variants: {
          where: scopedVariantFilter,
          select: {
            sizes: {
              where: scopedSizeFilter,
              select: {
                priceMAD: true,
                discountPercent: true,
              },
            },
          },
        },
      },
    });

    const minAllowed = min ?? 0;
    const maxAllowed = max ?? MAX_PRICE_MAD;

    const candidateMetrics = priceCandidates
      .map((product) => {
        const prices = product.variants.flatMap((variant) =>
          variant.sizes.map((size) =>
            finalPrice(Number(size.priceMAD), size.discountPercent),
          ),
        );

        if (prices.length === 0) return null;

        const matchesRange =
          min === undefined && max === undefined
            ? true
            : prices.some((price) => price >= minAllowed && price <= maxAllowed);

        if (!matchesRange) return null;

        return {
          id: product.id,
          minPrice: Math.min(...prices),
        };
      })
      .filter((entry): entry is { id: string; minPrice: number } => entry !== null);

    total = candidateMetrics.length;

    if (sort === "price-asc" || sort === "price-desc") {
      const direction = sort === "price-asc" ? 1 : -1;
      candidateMetrics.sort(
        (a, b) => (a.minPrice - b.minPrice) * direction || a.id.localeCompare(b.id),
      );

      const pageIds = candidateMetrics
        .slice(skip, skip + PAGE_SIZE)
        .map((entry) => entry.id);

      if (pageIds.length === 0) {
        products = [];
      } else {
        const fetched = await prisma.product.findMany({
          where: { id: { in: pageIds } },
          include,
        });
        const byId = new Map(fetched.map((product) => [product.id, product]));
        products = pageIds
          .map((id) => byId.get(id))
          .filter((product): product is NonNullable<typeof product> => Boolean(product));
      }
    } else {
      const filteredIds = candidateMetrics.map((entry) => entry.id);

      if (filteredIds.length === 0) {
        products = [];
      } else {
        products = await prisma.product.findMany({
          where: {
            AND: [where, { id: { in: filteredIds } }],
          },
          include,
          orderBy,
          take: PAGE_SIZE,
          skip,
        });
      }
    }
  } else {
    [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include,
        orderBy,
        take: PAGE_SIZE,
        skip,
      }),
      prisma.product.count({ where }),
    ]);
  }

  const qLower = q.toLowerCase();
  const selectedColors = new Set(colors.map((color) => color.toLowerCase()));

  const data = products.map((product) => {
    const sortedVariants = [...product.variants].sort((a, b) => {
      const aMatch =
        (Boolean(q) &&
          (a.title.toLowerCase().includes(qLower) ||
            a.name.toLowerCase().includes(qLower))) ||
        selectedColors.has(a.color?.toLowerCase() ?? "");

      const bMatch =
        (Boolean(q) &&
          (b.title.toLowerCase().includes(qLower) ||
            b.name.toLowerCase().includes(qLower))) ||
        selectedColors.has(b.color?.toLowerCase() ?? "");

      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const { _count, ...productData } = product;

    return {
      ...productData,
      variants: sortedVariants.map((variant) => ({
        ...variant,
        sizes: variant.sizes.map((size) => ({
          ...size,
          priceMAD: Number(size.priceMAD),
        })),
      })),
      avgRating: product.rating,
      reviewCount: _count.reviews,
    };
  });

  return NextResponse.json(
    {
      data,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
    { headers: publicDatabaseCache(30) },
  );
}
