import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductViewClient from "./ProductViewClient";
import { Decimal } from "@prisma/client/runtime/library";

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      categories: { include: { category: true } },
      variants: {
        orderBy: { sortOrder: "asc" },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          sizes: { orderBy: { size: "asc" } },
        },
      },
    },
  });

  if (!product || product.status !== "PUBLISHED") notFound();

  const serialized = JSON.parse(
    JSON.stringify(product, (key, value) =>
      value instanceof Decimal ? Number(value) : value
    )
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-500/10 rotate-45" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-yellow-500/10 -rotate-12" />
        <div className="absolute top-40 right-40 w-64 h-3 bg-black/5 rotate-45 rounded-full" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <ProductViewClient product={serialized} />
      </div>
    </main>
  );
}