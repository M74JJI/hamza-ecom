"use server";

import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/db";
import { CategoryUpsertSchema } from "@/lib/z-admin";
import { revalidatePath } from "next/cache";
import { wouldCreateCategoryCycle } from "@/lib/catalog/category-policy";

export async function upsertCategoryAction(input: unknown) {
  await requireAdmin();

  const parsed = CategoryUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const { id, name, slug, parentId, imageUrl, isActiveInHeader } = parsed.data;
  const normalizedParentId = parentId?.trim() || null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.$transaction(
        async (tx) => {
          if (normalizedParentId) {
            const parent = await tx.category.findUnique({
              where: { id: normalizedParentId },
              select: { id: true },
            });

            if (!parent) {
              throw new Error("CATEGORY_PARENT_NOT_FOUND");
            }
          }

          if (id) {
            const existing = await tx.category.findUnique({
              where: { id },
              select: { id: true },
            });

            if (!existing) {
              throw new Error("CATEGORY_NOT_FOUND");
            }

            const categories = await tx.category.findMany({
              select: {
                id: true,
                parentId: true,
              },
            });

            if (
              wouldCreateCategoryCycle(
                categories,
                existing.id,
                normalizedParentId,
              )
            ) {
              throw new Error("CATEGORY_CYCLE");
            }

            await tx.category.update({
              where: { id: existing.id },
              data: {
                name,
                slug,
                parentId: normalizedParentId,
                imageUrl: imageUrl ?? null,
                isActiveInHeader: !!isActiveInHeader,
              },
            });
          } else {
            await tx.category.create({
              data: {
                name,
                slug,
                parentId: normalizedParentId,
                imageUrl: imageUrl ?? null,
                isActiveInHeader: !!isActiveInHeader,
              },
            });
          }
        },
        {
          isolationLevel: "Serializable",
        },
      );

      revalidatePath("/dashboard/categories");
      revalidatePath("/products");
      return { ok: true };
    } catch (error: any) {
      if (error?.code === "P2034" && attempt < 2) {
        continue;
      }

      if (error?.message === "CATEGORY_PARENT_NOT_FOUND") {
        return { error: "Selected parent category does not exist." };
      }

      if (error?.message === "CATEGORY_NOT_FOUND") {
        return { error: "Category not found." };
      }

      if (error?.message === "CATEGORY_CYCLE") {
        return {
          error:
            "Invalid parent category. A category cannot be its own parent or be moved under one of its descendants.",
        };
      }

      if (error?.code === "P2002") {
        return { error: "Slug already exists. Please choose another." };
      }

      if (error?.code === "P2034") {
        return { error: "Category was modified concurrently. Please retry." };
      }

      return { error: "Failed to save category." };
    }
  }

  return { error: "Unable to save category after multiple concurrent retries." };
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  if (!id) return { error: "Missing category id." };

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      _count: {
        select: {
          children: true,
          products: true,
        },
      },
    },
  });

  if (!category) {
    return { error: "Category not found." };
  }

  if (category._count.children > 0 || category._count.products > 0) {
    return {
      error:
        "Cannot delete this category because it is referenced by child categories or products. Remove or reassign them first.",
    };
  }

  try {
    await prisma.category.delete({ where: { id: category.id } });
  } catch (error: any) {
    if (error?.code === "P2003") {
      return {
        error:
          "Cannot delete this category because it is referenced. Remove or reassign dependencies first.",
      };
    }

    return { error: "Failed to delete category." };
  }

  revalidatePath("/dashboard/categories");
  revalidatePath("/products");
  return { ok: true };
}
