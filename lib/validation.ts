import { boolean, z } from "zod";

export const VariantSizeSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1),
  sku: z.string().min(1),
  priceMAD: z.number().nonnegative(),
  discountPercent: z.number().int().min(0).max(100).optional(),
  stockQty: z.number().int().nonnegative(),
  isActive: z.boolean().optional(),
});

export const VariantSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  name: z.string().min(1),
  color: z.string().optional(),
  variantStyleImg: z.string().url(),
  shortDescription: z.string().optional(),
  contentHtml: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  images: z.array(z.object({
    id: z.string().optional(),
    url: z.string().url(),
    sortOrder: z.number().optional(),
  })).max(6),
  sizes: z.array(VariantSizeSchema).min(1),
});

export const ProductUpsertSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  isFeaturedInHero:z.boolean().default(false),
  brand: z.string().min(1),
  categoryIds: z.array(z.string()).optional(),
  details: z.array(z.object({
    label: z.string().min(1),
    value: z.string().min(1),
  })).optional(),
  highlights: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).optional(),
  variants: z.array(VariantSchema).min(1),
});

export type ProductUpsertInput = z.infer<typeof ProductUpsertSchema>;
