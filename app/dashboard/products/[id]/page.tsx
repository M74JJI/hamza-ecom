import { prisma } from "@/lib/db";
import { ProductForm } from "../product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }){
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      categories: true,
      details: true,
      variants: {
        orderBy: { sortOrder: 'asc' },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          sizes:  { orderBy: { size: 'asc' } },
        }
      }
    }
  });

  if(!product) return <div className="container py-12">Product not found.</div>;

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="container py-8">
      <ProductForm product={product as any} categories={categories as any} />
    </div>
  );
}
