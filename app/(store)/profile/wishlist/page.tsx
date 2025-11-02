// app/(store)/profile/wishlist/page.tsx
import ProfileNav from '../_components/ProfileNav';
import { SectionCard } from '../_components/SectionCard';
import { WishlistGrid } from '../_components/WishlistGrid';
import { AnimatedBackground } from '../_components/AnimatedBackground';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { Heart, ShoppingBag, Star, TrendingUp, Zap } from 'lucide-react';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist",
};


export default async function WishlistPage() {
  const { user } = await requireUser();

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        select: { 
          id: true, 
          slug: true, 
          brand: true, 
          rating: true,
        },
      },
      variant: {
        select: {
          id: true,
          title: true,
          variantStyleImg: true,
          images:{
            take:1
          },
          sizes: { 
            select: { 
              priceMAD: true, 
              discountPercent: true 
            }, 
            take: 1 
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });


    const ordersCount= await prisma.order.count({ where: { userId: user.id } })


  // Calculate wishlist stats
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => {
    const basePrice = item.variant?.sizes?.[0]?.priceMAD ?? 0;
    const discount = item.variant?.sizes?.[0]?.discountPercent ?? 0;
    const price = discount ? (basePrice * (100 - discount)) / 100 : basePrice;
    return sum + price;
  }, 0);
  const discountedItems = items.filter(item => 
    (item.variant?.sizes?.[0]?.discountPercent ?? 0) > 0
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800">Your Wishlist</h1>
            <p className="text-gray-600 font-medium">Save items you love for later</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          <ProfileNav ordersCount={ordersCount} userSince={Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}/>
    
          
          <div className="space-y-6 lg:space-y-8">
            {/* Wishlist Stats */}
            <SectionCard 
              title="Wishlist Overview" 
              subtitle="Your saved items at a glance"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-2xl p-4 border border-pink-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white fill-current" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-800">{totalItems}</div>
                      <div className="text-sm text-gray-600 font-medium">Saved Items</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-800">{totalValue.toFixed(0)}</div>
                      <div className="text-sm text-gray-600 font-medium">Total Value (MAD)</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl p-4 border border-yellow-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-800">{discountedItems}</div>
                      <div className="text-sm text-gray-600 font-medium">On Sale</div>
                    </div>
                  </div>
                </div>
              </div>

              <WishlistGrid items={items} />
            </SectionCard>

            {/* Quick Actions */}
            {items.length > 0 && (
              <SectionCard 
                title="Quick Actions" 
                subtitle="Manage your wishlist efficiently"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">Move All to Cart</h3>
                        <p className="text-gray-600 text-sm">Add all items to your shopping cart</p>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                      Add All to Cart
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">Share Wishlist</h3>
                        <p className="text-gray-600 text-sm">Share your favorites with friends</p>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">
                      Share List
                    </button>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Recommendations */}
            <SectionCard 
              title="You Might Also Like" 
              subtitle="Based on your wishlist items"
            >
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Discover More</h3>
                <p className="text-gray-600 mb-6">
                  Browse our collection to find more items you'll love
                </p>
                <button className="px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                  Explore Products
                </button>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}