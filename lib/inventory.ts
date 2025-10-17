import { prisma } from "@/lib/db";

/**
 * Adjusts stock for a VariantSize (atomic, never goes below 0)
 */
export async function adjustStock(variantSizeId: string, delta: number) {
  return await prisma.$transaction(async (db) => {
    const size = await db.variantSize.findUnique({ where: { id: variantSizeId } });
    if (!size) throw new Error("Variant size not found");

    const next = Math.max(0, size.stockQty + delta);

    return await db.variantSize.update({
      where: { id: variantSizeId },
      data: { stockQty: next },
    });
  });
}

/**
 * Sets stock quantity for a VariantSize (clamped to >= 0)
 */
export async function setStock(variantSizeId: string, value: number) {
  const next = Math.max(0, value);
  return prisma.variantSize.update({
    where: { id: variantSizeId },
    data: { stockQty: next },
  });
}
