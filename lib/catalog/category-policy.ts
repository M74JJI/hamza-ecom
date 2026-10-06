export type CategoryParentNode = {
  id: string;
  parentId: string | null;
};

export function wouldCreateCategoryCycle(
  categories: CategoryParentNode[],
  categoryId: string,
  proposedParentId: string | null | undefined,
) {
  if (!proposedParentId) return false;
  if (proposedParentId === categoryId) return true;

  const parentById = new Map(
    categories.map((category) => [category.id, category.parentId] as const),
  );

  const visited = new Set<string>();
  let current: string | null | undefined = proposedParentId;

  while (current) {
    if (current === categoryId) return true;
    if (visited.has(current)) {
      // Existing malformed cycle: reject attaching into it.
      return true;
    }

    visited.add(current);
    current = parentById.get(current);
  }

  return false;
}
