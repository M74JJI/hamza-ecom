'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { VariantUpsertSchema, VariantStockAdjustSchema } from '@/lib/z-variants';
import { adjustStock, setStock } from '@/lib/inventory';

// ✅ Create or update a variant
export async function upsertVariantAction(input: any) {
  const parsed = VariantUpsertSchema.safeParse(input);
if (!parsed.success) return { error: "Invalid input" };
const v = parsed.data;

if (v.id) {
  await prisma.variant.update({
    where: { id: v.id },
    data: {
      title: v.title,
      name: v.name,
      color: v.color,
      shortDescription: v.shortDescription,
      contentHtml: v.contentHtml,
      freeDelivery: v.freeDelivery,
      isActive: v.isActive,
      sortOrder: v.sortOrder ?? 0,
    },
  });
} else {
await prisma.variant.create({
  data: {
    productId: v.productId,
    title: v.title,
    name: v.name,
    color: v.color,
    variantStyleImg: v.variantStyleImg, // ✅ now included
    shortDescription: v.shortDescription,
    contentHtml: v.contentHtml,
    freeDelivery: v.freeDelivery,
    isActive: v.isActive,
    sortOrder: v.sortOrder ?? 0,
  },
});
}


  revalidatePath(`/dashboard/products/${v.productId}/variants`);
  return { ok: true };
}

// ✅ Delete a variant
export async function deleteVariantAction({ id }: { id: string }) {
  const variant = await prisma.variant.delete({
    where: { id },
  });
  revalidatePath(`/dashboard/products/${variant.productId}/variants`);
  return { ok: true };
}

// ✅ Adjust stock for a VariantSize (not Variant)
export async function adjustVariantStockAction({
  id,
  delta,
}: {
  id: string;
  delta: number;
}) {
  const size = await prisma.variantSize.update({
    where: { id },
    data: {
      stockQty: { increment: delta },
    },
    include: { variant: true },
  });

  revalidatePath(`/dashboard/products/${size.variant.productId}/variants`);
  return { ok: true, stockQty: size.stockQty };
}
