// types/hero.ts
import { Prisma } from '@prisma/client';

// Describe the "include" shape once, then reuse it for both typing and the query
export const heroInclude = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: {
    highlights:true,
    categories:{
        include:{
            category:true
        }
    },
    reviews:true,
    variants: {
      where: { isActive: true, images: { some: {} } },
      orderBy: { sortOrder: 'asc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 6 },
        sizes:  { orderBy: { priceMAD: 'asc' } },
      },
    },
  },
});

// ✅ This is the type you want:
export type HeroProduct = Prisma.ProductGetPayload<typeof heroInclude>;
