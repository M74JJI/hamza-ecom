import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // 🧾 Query params
  const q = searchParams.get("q")?.trim() || "";
  const categories = searchParams.getAll("category").filter(Boolean);
  const brands = searchParams.getAll("brand").filter(Boolean);
  const colors = searchParams.getAll("color").filter(Boolean);
  const sizes = searchParams.getAll("size").filter(Boolean);
  const min = Number(searchParams.get("min")) || 0;
  const max = Number(searchParams.get("max")) || 100000;
  const rating = Number(searchParams.get("rating")) || 0;
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page")) || 1;
  const take = 12;
  const skip = (page - 1) * take;

  // 🧩 Build filters
  const andFilters: any[] = [];

  // 🔹 Text search
  if (q) {
    andFilters.push({
      OR: [
        { brand: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { variants: { some: { title: { contains: q, mode: "insensitive" } } } },
        { variants: { some: { name: { contains: q, mode: "insensitive" } } } },
        {
          categories: {
            some: { category: { name: { contains: q, mode: "insensitive" } } },
          },
        },
      ],
    });
  }

  // 🔹 Category filter (multi-select)
if (categories.length > 0) {
andFilters.push({
  categories: {
    some: {
      categoryId: { in: categories }, // strictly the selected IDs
    },
  },
});
  }

  // 🔹 Brand filter
  if (brands.length > 0) {
    andFilters.push({ brand: { in: brands } });
  }

  // 🔹 Color filter
  if (colors.length > 0) {
    andFilters.push({
      variants: { some: { color: { in: colors, mode: "insensitive" } } },
    });
  }

  // 🔹 Size filter
  if (sizes.length > 0) {
    andFilters.push({
      variants: { some: { sizes: { some: { size: { in: sizes } } } } },
    });
  }

  // 🔹 Price range
  if (min > 0 || max < 100000) {
    andFilters.push({
      variants: {
        some: {
          sizes: {
            some: {
              priceMAD: { gte: min, lte: max },
            },
          },
        },
      },
    });
  }

  // 🔹 Rating filter
  if (rating > 0) {
    andFilters.push({ rating: { gte: rating } });
  }

  // ✅ Final where clause
  const where =
    andFilters.length > 0
      ? { status: "PUBLISHED", AND: andFilters }
      : { status: "PUBLISHED" };

  // 🔹 Sorting (Prisma-safe)
  let orderBy: any = { createdAt: "desc" };
  switch (sort) {
    case "rating":
      orderBy = { rating: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    // price sorts handled in JS after fetch
  }

  // 🧭 Fetch matching products
  let products = await prisma.product.findMany({
    where,
    include: {
      variants: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          sizes: {
            where: { isActive: true },
            orderBy: { priceMAD: "asc" },
          },
        },
      },
      categories: { include: { category: true } },
      reviews: { select: { rating: true } },
    },
    orderBy,
    take,
    skip,
  });

  // 🧮 Total count
  const total = await prisma.product.count({ where });

  // 🧠 Client-side sorting by price
  if (sort === "price-asc" || sort === "price-desc") {
    const dir = sort === "price-asc" ? 1 : -1;
    products = products.sort((a, b) => {
      const minA = Math.min(
        ...a.variants.flatMap((v) => v.sizes.map((s) => s.priceMAD))
      );
      const minB = Math.min(
        ...b.variants.flatMap((v) => v.sizes.map((s) => s.priceMAD))
      );
      return (minA - minB) * dir;
    });
  }

  // 🧠 Process results
  const qLower = q.toLowerCase();
  const data = products.map((p) => {
    const sortedVariants = [...p.variants].sort((a, b) => {
      const aMatch =
        (q &&
          (a.title.toLowerCase().includes(qLower) ||
            a.name.toLowerCase().includes(qLower))) ||
        (colors.length && colors.includes(a.color?.toLowerCase() || ""));
      const bMatch =
        (q &&
          (b.title.toLowerCase().includes(qLower) ||
            b.name.toLowerCase().includes(qLower))) ||
        (colors.length && colors.includes(b.color?.toLowerCase() || ""));

      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
        : 0;

    return { ...p, variants: sortedVariants, avgRating };
  });

  return NextResponse.json({ data, total });
}

