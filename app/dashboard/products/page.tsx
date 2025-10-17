import { prisma } from "@/lib/db";
import { ProductsClient } from "./product-client";

export default async function ProductsPage() {
  const productsRaw = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { categories: { include: { category: true } } },
  });

  // Serialize to make it safe for client components
  const products = productsRaw.map((p) => ({
    id: p.id,
    slug: p.slug,
    status: p.status,
    isFeaturedInHero: p.isFeaturedInHero,
    createdAt: p.createdAt.toISOString(), // ✅ Dates must be strings
    categories: p.categories.map((c) => ({
      categoryId: c.categoryId,
      category: { name: c.category.name },
    })),
  }));

  return <ProductsClient products={products} />;
}
