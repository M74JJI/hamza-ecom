import { z } from "zod";

export const CreateReviewSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional().nullable(),
  variantSizeId: z.string().cuid().optional().nullable(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(2000).optional().nullable(),
  quantity: z.number().int().min(1).max(999).optional().nullable(),
});

export const SearchQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  sort: z.enum(["relevance","new","price_asc","price_desc"]).optional(),
  page: z.coerce.number().min(1).optional()
});
