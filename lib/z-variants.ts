import { z } from "zod";

export const VariantUpsertSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1),
  title: z.string().min(1),
  name: z.string().min(1),
  color: z.string().optional(),
  variantStyleImg: z.string().min(1), // ✅ required image
  shortDescription: z.string().optional(),
  contentHtml: z.string().optional(),
  freeDelivery: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().optional(),
});

export const VariantStockAdjustSchema = z.object({
  id: z.string().min(1),
  delta: z.number().int()
});
