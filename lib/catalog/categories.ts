import { prisma } from "@/lib/db";

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

export function expandCategoryIds(
  categories: Pick<CatalogCategory, "id" | "parentId">[],
  selectedIds: string[],
) {
  if (selectedIds.length === 0) return [];

  const childrenByParent = new Map<string, string[]>();
  const knownIds = new Set(categories.map((category) => category.id));

  for (const category of categories) {
    if (!category.parentId) continue;
    const children = childrenByParent.get(category.parentId) ?? [];
    children.push(category.id);
    childrenByParent.set(category.parentId, children);
  }

  const expanded = new Set<string>();

  const visit = (id: string) => {
    if (expanded.has(id) || !knownIds.has(id)) return;
    expanded.add(id);
    for (const childId of childrenByParent.get(id) ?? []) {
      visit(childId);
    }
  };

  for (const id of selectedIds) visit(id);
  return Array.from(expanded);
}
