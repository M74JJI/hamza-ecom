import { prisma } from "@/lib/db";
import { ProductForm } from "../product-form";

export default async function NewProductPage(){
  const categories = await prisma.category.findMany({
  where: { parentId: null }, // only top-level parents
  include: {
    children: {
      include: {
        children: {
          include: {
            children: true, // you can nest as deep as you want
          },
        },
      },
    },
  },
  orderBy: { name: 'asc' },
});
  return <ProductForm categories={categories} />;
}
