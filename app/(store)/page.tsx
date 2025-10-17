// Home Page - Premium Enhanced
import HeroPro from "@/components/landing/HeroPro";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import FeaturedCategories from "@/components/landing/FeaturedCategories";
import Trust from "@/components/landing/Trust";
import { TopSellers } from "@/components/landing/TopSellers";
import { prisma } from "@/lib/db";

export default async function PremiumHome(){

const heroProducts = await prisma.product.findMany({
  where: {
    status: "PUBLISHED",
    isFeaturedInHero: true,
  },
  include: {
    highlights: true,
    variants: {
      where: { 
        isActive: true,
        images: { some: {} },
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 6 },
        sizes: { orderBy: { priceMAD: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
    },
    categories: {
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    },
  },
  take: 4,
  orderBy: { createdAt: 'desc' },
});


  const topProducts = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        variants: {
          some: {
            isActive: true,
            sizes: {
              some: {
                stockQty: { gt: 0 },
                isActive: true
              }
            }
          }
        }
      },
      include: {
        variants: {
          where: { 
            isActive: true,
            images: {
              some: {} // Ensure variant has at least one image
            }
          },
          include: {
            images: { 
              orderBy: { sortOrder: 'asc' },
              take: 3 // Limit images to improve performance
            },
            sizes: { 
              where: { isActive: true },
              orderBy: { priceMAD: 'asc' } // Get cheapest size first
            },
            reviews: { 
              select: { 
                id: true, 
                rating: true, 
                createdAt: true 
              } 
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      take: 10,
      orderBy: {
        createdAt: 'desc' // Show newest products first, you can change this to sales data
      }
    });

    // Filter out products that have no active variants with images
    const validProducts = topProducts.filter(product => 
      product.variants.length > 0 && 
      product.variants.some(variant => variant.images.length > 0)
    );

    if (validProducts.length === 0) {
      console.log('No valid products found for TopSellers section');
      return null;
    }

    // Transform the data to ensure proper serialization
const serializedProducts = validProducts.map(product => ({
  ...product,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
  variants: product.variants.map(variant => ({
    ...variant,
    color: variant.color ?? '', // ✅ added for safety
    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt.toISOString(),
    sizes: variant.sizes.map(size => ({
      ...size,
      priceMAD: size.priceMAD.toString(),
    })),
    images: variant.images.map(image => ({
      ...image,
      createdAt: image.createdAt.toISOString(),
    })),
    reviews: variant.reviews.map(review => ({
      ...review,
      createdAt: review.createdAt.toISOString(),
    })),
  })),
  categories: product.categories.map(pc => ({
    category: { ...pc.category },
  })),
}));

  return (
    <main className="min-h-screen">
      <div className="relative space-y-0">
        <HeroPro products={heroProducts as any}/>
        <FeaturedCategories/>
        <TopSellers products={serializedProducts}/>
      </div>
    </main>
  );
}