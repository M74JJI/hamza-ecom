import { prisma } from "@/lib/db";
import { expandCategoryIds } from "@/lib/catalog/category-tree";

export { expandCategoryIds } from "@/lib/catalog/category-tree";

export type CatalogCategory = {
  id: string;
  name: string;
  parentId: string | null;
  slug: string;
};

export async function getCatalogCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      parentId: true,
      slug: true,
    },
    orderBy: { name: "asc" },
  });
}
