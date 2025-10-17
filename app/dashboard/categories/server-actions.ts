"use server";

import { prisma } from "@/lib/db";
import { CategoryUpsertSchema } from "@/lib/z-admin";
import { revalidatePath } from "next/cache";

export async function upsertCategoryAction(input: unknown) {
  const parsed = CategoryUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input" };
  }
  const { id, name, slug, parentId, imageUrl, isActiveInHeader } = parsed.data;

  try {
    if (id) {
      await prisma.category.update({
        where: { id },
        data: {
          name,
          slug,
          parentId: parentId ?? null,
          imageUrl: imageUrl ?? null,
          isActiveInHeader: !!isActiveInHeader,
        },
      });
    } else {
      await prisma.category.create({
        data: {
          name,
          slug,
          parentId: parentId ?? null,
          imageUrl: imageUrl ?? null,
          isActiveInHeader: !!isActiveInHeader,
        },
      });
    }
  } catch (e: any) {
    // Unique slug guard, etc.
    if (e?.code === "P2002") {
      return { error: "Slug already exists. Please choose another." };
    }
    return { error: "Failed to save category." };
  }

  revalidatePath("/dashboard/categories");
  return { ok: true };
}

export async function deleteCategoryAction(id: string) {
  if (!id) return { error: "Missing category id." };
  try {
    await prisma.category.delete({ where: { id } });
  } catch (e: any) {
    // Foreign key constraint (children/products)
    if (e?.code === "P2003") {
      return {
        error:
          "Cannot delete this category because it is referenced (children or products). Remove/reassign them first.",
      };
    }
    return { error: "Failed to delete category." };
  }

  revalidatePath("/dashboard/categories");
  return { ok: true };
}
