import { prisma } from "@/lib/db";
import { CategoriesClient } from "./CategoriesClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const cats = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
    include: { parent: true },
  });

  return <CategoriesClient categories={cats} />;
}
