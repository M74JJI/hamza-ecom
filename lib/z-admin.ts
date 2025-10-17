import { z } from "zod";

export const CategoryUpsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  parentId: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().or(z.literal("").transform(()=>undefined)),
  isActiveInHeader: z.boolean().optional()
});


export const VariantSizeSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1),
  sku: z.string().min(1),
  priceMAD: z.number().positive(),
  discountPercent: z.number().int().optional(),
  stockQty: z.number().int().nonnegative(),
  isActive: z.boolean().default(true),
});

export const VariantSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  name: z.string().min(1),
  color: z.string().optional(),
  variantStyleImg: z.string().url(), // required
  shortDescription: z.string().optional(),
  contentHtml: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  images: z.array(z.string().url()).max(6),
  sizes: z.array(VariantSizeSchema),
});

export const ProductUpsertSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  categoryIds: z.array(z.string()).optional(),
  details: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ).optional(),
  variants: z.array(VariantSchema).nonempty("At least one variant required"),
});
