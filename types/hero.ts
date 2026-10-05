// types/hero.ts
import type { Prisma } from "@/generated/prisma/client";

// Keep the query shape as plain data so this module is safe to import from
// client components while retaining Prisma's generated payload inference.
export const heroInclude = {
  highlights: true,
  categories: {
    include: {
      category: true,
    },
  },
  reviews: true,
  variants: {
    where: { isActive: true, images: { some: {} } },
    orderBy: { sortOrder: "asc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 6 },
      sizes: { orderBy: { priceMAD: "asc" } },
    },
  },
} satisfies Prisma.ProductInclude;

export type HeroProduct = Prisma.ProductGetPayload<{
  include: typeof heroInclude;
}>;
