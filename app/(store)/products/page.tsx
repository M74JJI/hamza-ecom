import { prisma } from "@/lib/db";
import Link from "next/link";
import { normalizeFilters } from "@/lib/catalog-utils";

export const dynamic = "force-dynamic";

function applyDiscountMAD(val: number, pct?: number | null) {
  if (!pct || pct <= 0) return Number(val.toFixed(2));
  return Number((val * (100 - pct) / 100).toFixed(2));
}

export default async function Products(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const filters = normalizeFilters(searchParams);
  const where: any = { status: "PUBLISHED" as const };

  // Search & category filters at the Product level
  if (filters.q) {
    where.OR = [
      { slug: { contains: filters.q, mode: "insensitive" } },
      // Product title/desc fields live at Variant in your schema, so we keep this minimal here.
      // We'll further narrow at render time for color/size.
    ];
  }
  if (filters.categoryId) {
    where.categories = { some: { categoryId: filters.categoryId } };
  }

  // Fetch products + categories in one shot (no duplicate declarations)
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        // IMPORTANT: Product has NO images. Variants do.
        variants: {
          include: {
            images: { orderBy: { sortOrder: "asc" } }, // VariantImage[]
            sizes: true, // VariantSize[] with priceMAD, discountPercent, stockQty
          },
          orderBy: { sortOrder: "asc" },
        },
        categories: { include: { category: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Additional narrowing by color/size (schema-aware)
  const filtered = products
    .map((p) => {
      // If no color/size filter, keep product
      if (!filters.color && !filters.size) return p;

      const colorWanted = filters.color?.toLowerCase();
      const sizeWanted = filters.size?.toLowerCase();

      const matches = p.variants.some((v: any) => {
        // color is a simple string on Variant
        const colorOk = !colorWanted
          ? true
          : (v.color || "").toLowerCase() === colorWanted;

        // size is on VariantSize.size (string)
        const sizeOk = !sizeWanted
          ? true
          : v.sizes?.some(
              (s: any) => (s.size || "").toLowerCase() === sizeWanted
            );

        return colorOk && sizeOk;
      });

      return matches ? p : null;
    })
    .filter(Boolean) as typeof products;

  // Compute a thumbnail (from variant images) + min price per product
  const cards = filtered.map((p) => {
    // pick first variant with any image or fallback to variantStyleImg
    const firstVariantWithImage = p.variants.find(
      (v: any) => v.images?.length > 0 || v.variantStyleImg
    );
    const thumb =
      firstVariantWithImage?.images?.[0]?.url ||
      firstVariantWithImage?.variantStyleImg ||
      null;

    // min price across all sizes with discount
    const allPrices: number[] = [];
    p.variants.forEach((v: any) => {
      (v.sizes || []).forEach((s: any) => {
        const base = Number(s.priceMAD);
        const final = applyDiscountMAD(base, s.discountPercent ?? null);
        allPrices.push(final);
      });
    });
    const minPrice =
      allPrices.length > 0 ? Math.min(...allPrices) : (undefined as number | undefined);

    return {
      id: p.id,
      slug: p.slug,
      title: p.slug, // You don't have Product.title; using slug as display. Change if you add a title field.
      categories: p.categories.map((pc: any) => pc.category?.name).filter(Boolean),
      thumb,
      minPrice,
    };
  });

  return (
    <section className="container py-10 space-y-6">
      {/* Filters */}
      <form className="rounded-xl border border-white/10 p-4 bg-white/5 grid md:grid-cols-4 gap-3">
        <input
          name="q"
          defaultValue={filters.q || ""}
          placeholder="Search..."
          className="rounded bg-white/10 px-3 py-2"
        />
        <select
          name="category"
          defaultValue={filters.categoryId || ""}
          className="rounded bg-white/10 px-3 py-2"
        >
          <option value="">All categories</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          name="color"
          defaultValue={filters.color || ""}
          placeholder="Color"
          className="rounded bg-white/10 px-3 py-2"
        />
        <input
          name="size"
          defaultValue={filters.size || ""}
          placeholder="Size"
          className="rounded bg-white/10 px-3 py-2"
        />
        <button className="md:col-span-4 px-4 py-2 rounded-xl bg-white text-black">
          Apply
        </button>
      </form>

      <h1 className="text-3xl font-semibold">Products</h1>

      {/* Product grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="group block border border-white/10 rounded-lg overflow-hidden"
          >
            <div className="aspect-square bg-white/5 relative">
              {p.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.thumb}
                  alt={p.title}
                  className="absolute inset-0 w-full h-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-50">
                  No image
                </div>
              )}
            </div>
            <div className="p-4 space-y-1">
              <div className="text-sm opacity-70">
                {p.categories.join(", ")}
              </div>
              <h3 className="font-medium">{p.title}</h3>
              <div className="text-sm opacity-80">
                {typeof p.minPrice === "number"
                  ? `${p.minPrice.toFixed(2)} MAD`
                  : "—"}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
