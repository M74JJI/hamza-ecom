import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q || q.length < 2) {
    return Response.json({ suggestions: [] });
  }

  const prods = await prisma.product.findMany({
    where: {
      OR: [
        { brand: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { variants: { some: { title: { contains: q, mode: 'insensitive' } } } },
        {
          categories: {
            some: {
              category: { name: { contains: q, mode: 'insensitive' } },
            },
          },
        },
      ],
      status: 'PUBLISHED',
    },
    select: {
      id: true,
      slug: true,
      brand: true,
      variants: {
        select: { id: true, title: true, variantStyleImg: true },
        take: 1,
      },
      categories: {
        select: { category: { select: { name: true } } },
        take: 2,
      },
    },
    take: 8,
  });

  const suggestions = prods.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.variants[0]?.title || p.brand, // fallback to brand if no variant title
    image: p.variants[0]?.variantStyleImg || null,
    tags: p.categories.map((c) => c.category.name),
  }));

  return Response.json({ suggestions });
}
