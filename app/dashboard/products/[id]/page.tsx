import { prisma } from "@/lib/db";
import { ProductForm } from "../product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }){
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
     categories: { include: { category: true } },
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


  function buildCategoryTree(flatCategories: any[]) {
  const map: Record<string, any> = {};
  const roots: any[] = [];

  flatCategories.forEach(cat => (map[cat.id] = { ...cat, children: [] }));

  flatCategories.forEach(cat => {
    if (cat.parentId && map[cat.parentId]) {
      map[cat.parentId].children.push(map[cat.id]);
    } else {
      roots.push(map[cat.id]);
    }
  });

  return roots;
}
const categoriesFlat = await prisma.category.findMany({ orderBy: { name: 'asc' } });

const categories = buildCategoryTree(categoriesFlat);


  return (
    <div className="container py-8">
      <ProductForm product={product as any} categories={categories as any} />
    </div>
  );
}
