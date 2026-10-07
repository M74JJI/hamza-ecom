'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  MessageSquare,
  Shield,
  ShoppingBag,
  User,
} from 'lucide-react';

const links = [
  { href: '/profile', label: 'Overview', icon: User, description: 'Account summary' },
  { href: '/profile/orders', label: 'Orders', icon: ShoppingBag, description: 'Your purchases' },
  { href: '/profile/addresses', label: 'Addresses', icon: MapPin, description: 'Delivery locations' },
  { href: '/profile/wishlist', label: 'Wishlist', icon: Heart, description: 'Saved products' },
  { href: '/profile/reviews', label: 'Reviews', icon: MessageSquare, description: 'Your feedback' },
  { href: '/profile/security', label: 'Security', icon: Shield, description: 'Account protection' },
  { href: '/profile/sessions', label: 'Sessions', icon: LogOut, description: 'Active logins' },
] as const;

export default function ProfileNav({
  ordersCount,
  userSince,
}: {
  ordersCount: number;
  userSince: number;
}) {
  const pathname = usePathname();
  const createdText = userSince === 0
    ? 'today'
    : userSince === 1
      ? 'yesterday'
      : `${userSince} days ago`;

  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-24 h-fit overflow-hidden rounded-2xl border-2 border-gray-300 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl lg:rounded-3xl"
    >
      <div className="relative z-10 mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-black to-gray-800 shadow-lg">
          <User className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-800">Account</h2>
          <p className="text-sm font-medium text-gray-600">Manage your real account data</p>
        </div>
      </div>

      <ul className="relative z-10 space-y-2">
        {links.map(({ href, label, icon: Icon, description }) => {
          const active = pathname === href || (href !== '/profile' && pathname?.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center justify-between rounded-2xl border-2 p-4 transition ${
                  active
                    ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white/50 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-4">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    active ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-gray-800">{label}</span>
                    <span className="block text-sm text-gray-500">{description}</span>
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 border-t border-gray-200 pt-6 text-center">
        <div>
          <div className="text-2xl font-black text-gray-800">{ordersCount}</div>
          <div className="text-xs font-medium text-gray-600">ORDERS</div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500">Joined</div>
          <div className="mt-1 rounded-lg bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-800">{createdText}</div>
        </div>
      </div>
    </motion.nav>
  );
}
