// app/(store)/profile/page.tsx
import ProfileNav from './_components/ProfileNav';
import { SectionCard } from './_components/SectionCard';
import { StatCard } from './_components/StatCard';
import { AnimatedBackground } from './_components/AnimatedBackground';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { 
  Calendar, 
  ShoppingBag, 
  Heart, 
  Star, 
  Package,
  ArrowRight,
  User,
  MapPin,
  MessageSquare,
  Shield,
  LogOut,
  Award,
  Truck,
  Clock
} from 'lucide-react';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};



export default async function ProfileOverview(){
  const { user } = await requireUser();

  const [ordersCount, wishlistCount, reviewsCount, lastOrder] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.wishlistItem.count({ where: { userId: user.id } }),
    prisma.review.count({ where: { userId: user.id } }),
    prisma.order.findFirst({ 
      where: { userId: user.id }, 
      orderBy: { createdAt: 'desc' }, 
      include: { items: { include: { variantSize: { include: { variant: true } } } } } 
    }),
  ]);

  const statCards = [
    { 
      label: "Member since", 
      value: new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      icon: Calendar,
      color: "text-blue-600"
    },
    { 
      label: "Orders", 
      value: ordersCount,
      icon: ShoppingBag,
      color: "text-green-600"
    },
    { 
      label: "Wishlist", 
      value: wishlistCount,
      icon: Heart,
      color: "text-red-600"
    },
    { 
      label: "Reviews", 
      value: reviewsCount,
      icon: Star,
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800">Welcome back, {user.name?.split(' ')[0]}!</h1>
            <p className="text-gray-600 font-medium">Manage your account and track your orders</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          <ProfileNav />
          
          <div className="space-y-6 lg:space-y-8">
            {/* Account Stats */}
            <SectionCard 
              title="Account Overview" 
              subtitle="Your profile statistics at a glance"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                  <div key={stat.label}>
                    <StatCard 
                      label={stat.label} 
                      value={stat.value}
                      icon={stat.icon}
                      color={stat.color}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Last Order */}
            <SectionCard 
              title="Recent Order" 
              subtitle="Your most recent purchase"
            >
              {lastOrder ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-blue-600" />
                      <div className="font-bold text-gray-800">Order #{lastOrder.id.slice(0,8).toUpperCase()}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      <div className="text-gray-600">Date</div>
                      <div className="font-medium text-gray-800">
                        {new Date(lastOrder.createdAt).toLocaleDateString()}
                      </div>
                      
                      <div className="text-gray-600">Items</div>
                      <div className="font-medium text-gray-800">
                        {lastOrder.items.length} product{lastOrder.items.length > 1 ? 's' : ''}
                      </div>
                      
                      <div className="text-gray-600">Status</div>
                      <div className="font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          lastOrder.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          lastOrder.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                          lastOrder.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lastOrder.status}
                        </span>
                      </div>
                      
                      <div className="text-gray-600">Total</div>
                      <div className="font-bold text-gray-800">
                        {lastOrder.items.reduce((total, item) => total + (Number(item.unitPriceMAD) * item.quantity), 0).toFixed(2)} MAD
                      </div>
                    </div>
                  </div>
                  
                  <Link href={`/profile/orders/${lastOrder.id}`}>
                    <div className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg cursor-pointer">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-4">No orders yet</p>
                  <Link href="/products">
                    <div className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors cursor-pointer inline-block">
                      Start Shopping
                    </div>
                  </Link>
                </div>
              )}
            </SectionCard>

            {/* Quick Actions */}
            <SectionCard 
              title="Quick Actions" 
              subtitle="Manage your account settings"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { href: "/profile/orders", label: "Orders", icon: ShoppingBag, color: "bg-blue-600" },
                  { href: "/profile/addresses", label: "Addresses", icon: MapPin, color: "bg-green-600" },
                  { href: "/profile/wishlist", label: "Wishlist", icon: Heart, color: "bg-red-600" },
                  { href: "/profile/reviews", label: "Reviews", icon: MessageSquare, color: "bg-yellow-600" },
                  { href: "/profile/security", label: "Security", icon: Shield, color: "bg-purple-600" },
                  { href: "/profile/sessions", label: "Sessions", icon: LogOut, color: "bg-gray-600" },
                ].map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                      <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <link.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="font-semibold text-gray-800 text-sm">{link.label}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </SectionCard>

            {/* Trust Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Shield, value: "Secure", label: "ACCOUNT", color: "text-blue-600" },
                { icon: Award, value: "Premium", label: "QUALITY", color: "text-yellow-600" },
                { icon: Clock, value: "24/7", label: "SUPPORT", color: "text-purple-600" },
                { icon: Truck, value: "Fast", label: "DELIVERY", color: "text-green-600" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-300 shadow-lg"
                >
                  <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                  <div className="text-xl font-black text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-xs font-medium text-gray-700">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}