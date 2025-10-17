import { z } from "zod";

export const AddressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  city: z.string().min(2),
  streetAddress: z.string().min(3)
});

export const ProductSchema = z.object({
  title: z.string().min(2),
  shortDescription: z.string().min(4),
  contentHtml: z.string().optional(),
  status: z.enum(['DRAFT','PUBLISHED']),
  categories: z.array(z.string()).optional()
});

export const VariantSchema = z.object({
  sku: z.string().min(1),
  attributes: z.object({
    color: z.union([z.string(), z.array(z.string())]).optional(),
    size: z.string().optional()
  }),
  priceCents: z.number().int().nonnegative(),
  stockQty: z.number().int().nonnegative(),
  isActive: z.boolean().default(true)
});
