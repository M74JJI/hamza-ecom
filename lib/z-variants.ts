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
  sortOrder: z.number().int().min(0).optional(),
});

export const VariantStockAdjustSchema = z.object({
  id: z.string().min(1),
  delta: z.number().int().min(-1_000_000).max(1_000_000).refine((value) => value !== 0, {
    message: "Stock adjustment cannot be zero",
  })
});
