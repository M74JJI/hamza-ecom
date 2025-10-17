import { prisma } from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";

export default async function FeaturedProducts(){
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    include: {
      categories: { include: { category: true } },
      variants: {
        include: { images: { orderBy: { sortOrder: 'asc' } }, sizes: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 8
  });

  if (products.length === 0) return null;

  return (
    <section className="container py-12">
      <h2 className="text-2xl font-semibold mb-6">Featured Products</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(p => (
          <ProductCard key={p.id} product={p} randomizePreview />
        ))}
      </div>
    </section>
  );
}
