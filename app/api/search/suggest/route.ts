import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  if(!q) return NextResponse.json({ suggestions: [] });
  const take = 6;

  const vars = await prisma.variant.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
      ],
      isActive: true,
      product: { status: 'PUBLISHED' as any }
    },
    include: { product: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 }, sizes: true },
    take
  });

  const suggestions = vars.map(v => ({
    productSlug: v.product.slug,
    variantId: v.id,
    title: v.title,
    name: v.name,
    thumb: v.variantStyleImg || v.images[0]?.url || null,
    price: v.sizes.length ? Number(v.sizes[0].priceMAD) : null
  }));

  return NextResponse.json({ suggestions });
}
