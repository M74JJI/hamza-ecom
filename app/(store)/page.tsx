// Home Page - Premium Enhanced
import HeroPro from "@/components/landing/HeroPro";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import FeaturedCategories from "@/components/landing/FeaturedCategories";
import Trust from "@/components/landing/Trust";
import { TopSellers } from "@/components/landing/TopSellers";
import { prisma } from "@/lib/db";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "HAMZA Store",
};

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
        reviews:true
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


  return (
    <main className="min-h-screen">
      <div className="relative space-y-0">
        <HeroPro products={heroProducts as any}/>
        <FeaturedCategories/>
        <TopSellers products={topProducts as any}/>
      </div>
    </main>
  );
}