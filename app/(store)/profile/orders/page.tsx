// app/(store)/profile/orders/page.tsx
import ProfileNav from '../_components/ProfileNav';
import { SectionCard } from '../_components/SectionCard';
import { OrdersTable } from '../_components/OrdersTable';
import { AnimatedBackground } from '../_components/AnimatedBackground';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { Package, ShoppingBag, ArrowRight, TrendingUp } from 'lucide-react';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
};


export default async function OrdersPage(){
  const { user } = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { items: true } } }
  });

  const rows = orders.map(o => ({
    id: o.id,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    total: Number(o.totalMAD ?? 0),
    itemsCount: o._count.items,
  }));

  // Calculate some stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalMAD ?? 0), 0);
  const recentOrders = orders.slice(0, 3).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800">Order History</h1>
            <p className="text-gray-600 font-medium">Track and manage your purchases</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          <ProfileNav />
          
          <div className="space-y-6 lg:space-y-8">
            {/* Order Stats */}
            <SectionCard 
              title="Order Overview" 
              subtitle="Your purchasing activity at a glance"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-800">{totalOrders}</div>
                      <div className="text-sm text-gray-600 font-medium">Total Orders</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-800">{totalSpent.toFixed(2)}</div>
                      <div className="text-sm text-gray-600 font-medium">Total Spent (MAD)</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-800">{recentOrders}</div>
                      <div className="text-sm text-gray-600 font-medium">Recent Orders</div>
                    </div>
                  </div>
                </div>
              </div>

              <OrdersTable rows={rows}/>
            </SectionCard>

            {/* Quick Actions */}
            <SectionCard 
              title="Need Help?" 
              subtitle="We're here to assist you"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Track Your Order</h3>
                      <p className="text-gray-600 text-sm">Get real-time updates on your delivery</p>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                    Track Package
                  </button>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Start Shopping</h3>
                      <p className="text-gray-600 text-sm">Discover new products and deals</p>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">
                    Browse Products
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}