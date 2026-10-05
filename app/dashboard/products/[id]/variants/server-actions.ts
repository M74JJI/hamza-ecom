'use server';

import { requireAdmin } from "@/lib/require-admin";
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { VariantUpsertSchema } from '@/lib/z-variants';

// Create or update a variant
export async function upsertVariantAction(input: unknown) {
  await requireAdmin();

  const parsed = VariantUpsertSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };
  const variantInput = parsed.data;

  if (variantInput.id) {
    await prisma.variant.update({
      where: { id: variantInput.id },
      data: {
        title: variantInput.title,
        name: variantInput.name,
        color: variantInput.color,
        shortDescription: variantInput.shortDescription,
        contentHtml: variantInput.contentHtml,
        freeDelivery: variantInput.freeDelivery,
        isActive: variantInput.isActive,
        sortOrder: variantInput.sortOrder ?? 0,
      },
    });
  } else {
    await prisma.variant.create({
      data: {
        productId: variantInput.productId,
        title: variantInput.title,
        name: variantInput.name,
        color: variantInput.color,
        variantStyleImg: variantInput.variantStyleImg,
        shortDescription: variantInput.shortDescription,
        contentHtml: variantInput.contentHtml,
        freeDelivery: variantInput.freeDelivery,
        isActive: variantInput.isActive,
        sortOrder: variantInput.sortOrder ?? 0,
      },
    });
  }

  revalidatePath(`/dashboard/products/${variantInput.productId}/variants`);
  return { ok: true };
}

// Delete a variant
export async function deleteVariantAction({ id }: { id: string }) {
  await requireAdmin();

  const variant = await prisma.variant.delete({
    where: { id },
  });

  revalidatePath(`/dashboard/products/${variant.productId}/variants`);
  return { ok: true };
}

// Adjust stock for a VariantSize (not Variant)
export async function adjustVariantStockAction({
  id,
  delta,
}: {
  id: string;
  delta: number;
}) {
  await requireAdmin();

  if (!Number.isInteger(delta) || delta === 0) {
    return { error: "Invalid stock adjustment" };
  }

  const size = await prisma.variantSize.findUnique({
    where: { id },
    include: { variant: true },
  });
  if (!size) return { error: "Variant size not found" };

  const nextStock = size.stockQty + delta;
  if (nextStock < 0) {
    return { error: "Stock cannot be negative" };
  }

  const updated = await prisma.variantSize.update({
    where: { id },
    data: { stockQty: nextStock },
    include: { variant: true },
  });

  revalidatePath(`/dashboard/products/${updated.variant.productId}/variants`);
  return { ok: true, stockQty: updated.stockQty };
}
