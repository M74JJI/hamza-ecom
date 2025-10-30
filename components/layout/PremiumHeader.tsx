'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { motion, AnimatePresence, LazyMotion, domMax } from 'framer-motion';

import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Heart,
  Phone,
  Clock,
  Star,
  Truck,
  Shield,
  Zap,
  Crown,
  Sparkles,
  CreditCard,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle,
  Package,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { signOutAction } from '@/app/(store)/(auth)/actions';
import { useCart } from '@/hooks/useCart';
import { usePresence } from '@/hooks/usePresence';

import navigationData from '@/data/nav.json';

//-------------------------------

type FeaturedItem = {
  name: string;
  href: string;
  image?: string;
  price?: string;
  originalPrice?: string;
  salePrice?: string;
  discount?: string;
  rating?: number;
  reviews?: number;
  badges?: string[];
  badge?: string;
};

type FeaturedSection = {
  title: string;
  subtitle?: string;
  timer?: string;
  items?: FeaturedItem[];
};

type QuickLink = {
  name: string;
  href: string;
  count?: number | string;
};

type CategoryItem = {
  name: string;
  href: string;
  popular?: boolean;
  trending?: boolean;
  discount?: string;
  highlight?: boolean;
  count?: number | string;
  badge?: string;
};

type CategoryColumn = {
  title: string;
  featured?: {
    name: string;
    href: string;
    image?: string;
    badge?: string;
    count?: number | string;
  };
  items: CategoryItem[];
};

type MegaMenu = {
  type: 'featured' | 'category' | 'sale';
  featured?: FeaturedSection;
  quickLinks?: QuickLink[];
  columns?: CategoryColumn[];
};

type NavigationItem = {
  name: string;
  href: string;
  highlight?: boolean;
  badge?: { text: string; color: string };
  megaMenu?: MegaMenu;
};

// ---------- helpers ----------
const slideIn = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 30, scale: 0.98 },
  transition: {
    type: "spring" as const,
    damping: 30,
    stiffness: 400,
    mass: 0.8,
  },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full pointer-events-none"
        initial={{
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
          y: Math.random() * 100,
          scale: Math.random() * 0.5 + 0.5,
        }}
        animate={{ y: [null, -20, 0], opacity: [0, 1, 0] }}
        transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
      />
    ))}
  </div>
);

const ShimmerLoader = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 ${className}`} />
);

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const fmtMAD = (n: number) => {
  if (!isFinite(n)) return '0 MAD';
  return `${n.toFixed(2)} MAD`;
};

// =====================
// CART ITEM PRICING (variant + size discount aware)
// =====================
const toNumber = (val: any): number => {
  if (val == null) return 0;
  if (typeof val === 'number' && isFinite(val)) return val;
  if (typeof val === 'string') {
    // strip thousands separators and currency words (MAD)
    const m = val.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : 0;
  }
  return 0;
};

const norm = (v: any) => (v == null ? '' : String(v).trim().toLowerCase());

const getItemId = (it: any): string | undefined =>
  it.id ?? it.variantId ?? it.sku ?? it.cartKey ?? it.productId ?? undefined;

const getItemTitle = (it: any): string =>
  it.name ?? it.title ?? it.titleSnapshot ?? it.productName ?? it.variantName ?? 'Item';

const getItemImage = (it: any): string | null =>
  it.image ??
  it.imageUrl ??
  it.variantImage ??                // ✅ new
  it.variantImageUrl ??             // ✅ new
  it.thumbnailUrl ??
  it.images?.[0]?.url ??
  it.variant?.imageUrl ??           // ✅ new
  it.variant?.thumbnailUrl ??       // ✅ new
  it.variant?.images?.[0]?.url ??
  it.product?.imageUrl ??           // ✅ new
  it.product?.thumbnailUrl ??       // ✅ new
  it.product?.images?.[0]?.url ??
  null;

const getItemQtySafe = (it: any): number => {
  const q = Number(it.qty ?? it.quantity ?? 1);
  return Number.isFinite(q) && q > 0 ? q : 1;
};

// Try to find the size node (the selected variant option) where discount may live.
const findSizeNode = (it: any): any | null => {
  const wanted =
    norm(it.sizeId) ||
    norm(it.size?.id) ||
    norm(it.sizeCode) ||
    norm(it.sizeValue) ||
    norm(it.size);

  const pools: any[] = []
    .concat(
      Array.isArray(it.sizeOptions) ? it.sizeOptions : [],
      Array.isArray(it.sizes) ? it.sizes : [],
      Array.isArray(it.variant?.sizes) ? it.variant.sizes : [],
      Array.isArray(it.variant?.sizeOptions) ? it.variant.sizeOptions : [],
      Array.isArray(it.product?.sizes) ? it.product.sizes : []
    )
    .filter(Boolean);

  if (pools.length === 0) return null;

  // best-effort matching by common keys
  const matchKeys = ['id', 'code', 'value', 'label', 'name'];
  for (const s of pools) {
    for (const k of matchKeys) {
      if (wanted && norm(s?.[k]) === wanted) return s;
    }
  }

  // fallback: if item.size is like "M" and node has "M"
  for (const s of pools) {
    if (wanted && Object.values(s ?? {}).some((v) => norm(v) === wanted)) return s;
  }

  return null;
};

// Compute base and final price considering variant+size overrides and discounts
const getUnitPricing = (it: any): { unit: number; original: number } => {
  const sizeNode = findSizeNode(it);

  // Extract base price priority (size > variant > item)
  const baseFromSize = toNumber(sizeNode?.priceMAD ?? sizeNode?.price ?? sizeNode?.basePriceMAD ?? sizeNode?.basePrice);
  const baseFromVariant = toNumber(it.variant?.priceMAD ?? it.variant?.price ?? it.variantPriceMAD ?? it.variantPrice);
  const baseFromItem = toNumber(it.unitPriceMAD ?? it.priceMAD ?? it.unitPrice ?? it.price);
  let base = baseFromSize || baseFromVariant || baseFromItem;

  // Direct sale/final price if provided explicitly
  const directSale =
    toNumber(sizeNode?.salePriceMAD ?? sizeNode?.finalPriceMAD ?? sizeNode?.salePrice ?? sizeNode?.finalPrice) ||
    toNumber(it.sizeSalePriceMAD ?? it.finalPriceMAD ?? it.salePriceMAD ?? it.finalPrice ?? it.salePrice);

  // Discount % or amount (prefer size node, then item-level)
  const discountPercentRaw =
    sizeNode?.discountPercent ??
    sizeNode?.discount_rate ??
    sizeNode?.discount ??
    it.sizeDiscountPercent ??
    it.discountPercent ??
    it.discount;

  const discountAmountRaw =
    sizeNode?.discountMAD ??
    sizeNode?.discountAmount ??
    sizeNode?.discount_value ??
    it.sizeDiscountMAD ??
    it.discountMAD ??
    it.discountAmount;

  const parsePercent = (v: any): number | null => {
    if (v == null) return null;
    if (typeof v === 'number' && isFinite(v)) return v;
    if (typeof v === 'string') {
      const m = v.match(/-?\d+(\.\d+)?/);
      return m ? parseFloat(m[0]) : null;
    }
    return null;
  };

  const pct = parsePercent(discountPercentRaw);
  const amt = discountAmountRaw != null ? toNumber(discountAmountRaw) : null;

  // Compute final
  let final = 0;

  if (directSale) {
    final = directSale;
    // If base is missing but we have a direct sale and a percent amount, reconstruct base if possible
    if (!base && pct) base = final / (1 - pct / 100);
    if (!base) base = final; // ensure original exists
  } else if (pct) {
    final = Math.max(0, base * (1 - pct / 100));
  } else if (amt) {
    final = Math.max(0, base - amt);
  } else {
    final = base;
  }

  // Guard rails
  if (!base && final) base = final;
  if (!final && base) final = base;

  return { unit: final || 0, original: base || final || 0 };
};

export default function UltimateEcommerceHeader({ user }: { user?: any }) {
  // ---------- local UI state ----------
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState<string | null>(null);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeSearchCategory, setActiveSearchCategory] = useState('all');
  const [notificationCount] = useState(3);
  const [darkMode, setDarkMode] = useState(false);
  const [loadingStates, setLoadingStates] = useState({ search: false, cart: false });

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---------- refs ----------
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const live = usePresence('global'); 

  // ---------- CATEGORIES (SWR once, no polling) ----------
  const { data: catData } = useSWR<{ items: Array<{ id: string; name: string; slug: string; imageUrl?: string }> }>(
    '/api/categories/header',
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const headerCats = catData?.items ?? [];

  // ---------- CART ----------
  const { cart, count: cartCount, remove } = useCart();
  const cartItems = cart.items;

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum: number, it: any) => {
      const { unit } = getUnitPricing(it); // unit already includes size-level discount if any
      const qty = getItemQtySafe(it);
      return sum + unit * qty;
    }, 0);
  }, [cartItems]);

  // AI-powered search suggestions
  const searchSuggestions = useMemo(() => ({
    popular: ["Running Shoes", "Summer Dresses", "Smart Watch", "Backpack", "Designer Jeans", "Sports Bra"],
    trending: ["Wireless Earbuds", "Yoga Mat", "Sunglasses", "Water Bottle", "Fitness Tracker"],
    recentlyViewed: ["Casual Sneakers", "Leather Jacket", "Formal Shirt"]
  }), []);

  // ---------- Navigation (unchanged UI data) ----------
  const navigation: NavigationItem[] = useMemo(
    () => navigationData.navigation as NavigationItem[],
    []
  );

  // ---------- Search config ----------
  const searchCategories = [
    { id: 'all', name: 'All Categories', count: '10K+' },
    { id: 'men', name: "Men's Fashion", count: '2.3K' },
    { id: 'women', name: "Women's Fashion", count: '3.1K' },
    { id: 'electronics', name: 'Electronics', count: '1.2K' },
    { id: 'accessories', name: 'Accessories', count: '1.8K' },
  ];

  // ---------- effects ----------
  useEffect(() => {
    const updateScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targets = [
        { ref: userMenuRef, state: setUserMenuOpen },
        { ref: searchRef, state: setSearchOpen },
        { ref: megaMenuRef, state: () => setMegaMenuOpen(null) },
        { ref: cartRef, state: setCartPreviewOpen },
      ];
      targets.forEach(({ ref, state }) => {
        if (ref.current && !ref.current.contains(event.target as Node)) state(false as any);
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return;
      const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem('hajzen-recent-searches', JSON.stringify(updated));
    },
    [recentSearches]
  );

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      setLoadingStates((p) => ({ ...p, search: true }));
      await new Promise((r) => setTimeout(r, 800));
      saveSearch(searchQuery);
      router.push(`/browse?q=${encodeURIComponent(searchQuery)}&category=${activeSearchCategory}`);
      setSearchOpen(false);
      setLoadingStates((p) => ({ ...p, search: false }));
    },
    [searchQuery, activeSearchCategory, router, saveSearch]
  );

  // ---------- UI ----------
  return (
    <LazyMotion features={domMax}>
      {/* Announcement */}
      <div className="relative bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white text-sm overflow-hidden border-b border-white/10">
        <FloatingParticles />
        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center space-x-8">
              <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400 }}>
                <div className="relative">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <motion.div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full pointer-events-none" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                </div>
                <span className="font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">FLASH SALE: 60% OFF</span>
              </motion.div>

              <motion.div className="hidden lg:flex items-center space-x-3 bg-black/30 px-3 py-1.5 rounded-full border border-white/10" whileHover={{ scale: 1.05 }}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse pointer-events-none" />
                  <span className="text-xs font-medium">LIVE</span>
                </div>
                {typeof live === 'number' ? (
                  <span className="text-xs font-bold font-mono">{live.toLocaleString()}</span>
                ) : (
                  <span className="text-xs font-mono opacity-60">—</span>
                )}
                <span className="text-xs text-white/70">shopping now</span>
              </motion.div>
            </div>

            <motion.div className="hidden xl:flex items-center space-x-3 bg-gradient-to-r from-red-600 to-pink-600 px-4 py-1.5 rounded-full shadow-lg" initial={{ scale: 0.9, y: -5 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono text-sm font-bold">23:59:45</span>
              <span className="text-xs font-medium">LEFT</span>
            </motion.div>

            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center space-x-4">
                <div className="flex items-center space-x-1.5 text-xs text-white/80">
                  <Shield className="w-3.5 h-3.5 text-green-400" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-white/80">
                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Free Shipping</span>
                </div>
              </div>

              <motion.div className="hidden xl:flex items-center space-x-2 text-xs hover:text-white/90 transition-colors cursor-pointer group" whileHover={{ x: 2 }}>
                <Phone className="w-3.5 h-3.5" />
                <span>+212 600-000000</span>
                <motion.div className="w-1 h-1 bg-green-400 rounded-full pointer-events-none" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              </motion.div>
            </div>
          </div>
        </div>
        <motion.div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 pointer-events-none" initial={{ width: '100%' }} animate={{ width: '25%' }} transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} />
      </div>

      {/* Header */}
      <motion.header
        ref={headerRef}
        className={`sticky top-0 z-50 transition-all duration-700 ${
          isScrolled ? 'bg-white/90 backdrop-blur-2xl shadow-2xl border-b border-gray-200/60' : 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-100/50'
        }`}
        style={{
          background: isScrolled ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.92) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
          backdropFilter: isScrolled ? 'blur(20px)' : 'blur(16px)',
        }}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-24">
            {/* Logo */}
            <motion.div className="flex-shrink-0">
              <Link href="/">
                <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98, y: 0 }} className="flex items-center space-x-3 cursor-pointer group relative">
                  <motion.div className="relative" whileHover={{ rotateY: 180 }} transition={{ duration: 0.6 }}>
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-gray-900/10 group-hover:ring-gray-900/20 transition-all duration-500">
                      <span className="text-white font-bold text-xl">H</span>
                    </div>
                    <motion.div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg pointer-events-none" whileHover={{ scale: 1.3, rotate: 180 }} transition={{ type: 'spring', stiffness: 400 }}>
                      <Crown className="w-2.5 h-2.5 text-white" />
                    </motion.div>
                    <motion.div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 blur-md pointer-events-none" transition={{ duration: 0.3 }} />
                  </motion.div>
                  <div className="hidden sm:block">
                    <motion.span className="text-3xl font-black bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent tracking-tighter" whileHover={{ backgroundPosition: '100%', transition: { duration: 0.8 } }} style={{ backgroundSize: '200% 100%' }}>
                      HAMZA
                    </motion.span>
                    <motion.p className="text-xs text-gray-500 -mt-1 font-semibold flex items-center space-x-1.5" initial={{ opacity: 0.8 }} whileHover={{ opacity: 1, x: 2 }}>
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span>PREMIUM STORE</span>
                    </motion.p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>

            {/* Desktop nav - positioned right after logo */}
            <nav className="hidden xl:flex items-center space-x-1 ml-8" ref={megaMenuRef}>
              {navigation.map((item) => (
                <div key={item.name} className="relative" onMouseEnter={() => setMegaMenuOpen(item.name)} onMouseLeave={() => setMegaMenuOpen(null)}>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }} className="relative">
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-2.5 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-400 relative group ${
                        item.highlight ? 'text-red-600 hover:bg-red-50/80 hover:shadow-lg' : 'text-gray-700 hover:text-gray-900 hover:bg-white/80 hover:shadow-lg'
                      } ${pathname.startsWith(item.href) ? 'bg-white/60 shadow-md text-gray-900' : ''}`}
                    >
                      <span className="relative z-10">{item.name}</span>
                      {item.badge && (
                        <motion.span className={`px-2.5 py-1 text-white text-xs rounded-full font-bold ${item.badge.color} shadow-lg relative z-10`} whileHover={{ scale: 1.1, y: -1 }} transition={{ type: 'spring', stiffness: 500 }}>
                          {item.badge.text}
                        </motion.span>
                      )}
                      {item.megaMenu && (
                        <motion.div animate={{ rotate: megaMenuOpen === item.name ? 180 : 0 }} transition={{ duration: 0.4, ease: 'easeInOut' }} className="relative z-10">
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      )}
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-white/50 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none" transition={{ duration: 0.3 }} />
                    </Link>
                    {pathname.startsWith(item.href) && (
                      <motion.div className="absolute bottom-2 left-1/2 w-4/5 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform -translate-x-1/2 pointer-events-none" layoutId="activeIndicator" transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
                    )}
                  </motion.div>

                  {/* Ultimate Mega Menu with Enhanced Design */}
                  <AnimatePresence>
                    {item.megaMenu && megaMenuOpen === item.name && (
                      <motion.div
                        {...slideIn}
                        className="absolute left-0 top-full w-[1000px] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden transform -translate-x-1/2"
                        style={{ originY: 0 }}
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-[0.02] bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pointer-events-none" />
                        
                        {/* Enhanced Featured Section */}
                        {item.megaMenu.featured && (
                          <div className="relative bg-gradient-to-br from-gray-50/80 to-white/80 border-b border-gray-200/50 p-10">
                            <div className="flex items-center justify-between mb-8">
                              <div>
                                <h3 className="font-bold text-gray-900 text-2xl flex items-center space-x-3">
                                  <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    <Zap className="w-6 h-6 text-yellow-500" />
                                  </motion.div>
                                  <span>{item.megaMenu.featured.title}</span>
                                </h3>
                                {item.megaMenu.featured.subtitle && (
                                  <p className="text-gray-600 text-base mt-2">{item.megaMenu.featured.subtitle}</p>
                                )}
                              </div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                  href={item.href}
                                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                                >
                                  <span>Explore All</span>
                                  <ArrowRight className="w-4 h-4" />
                                </Link>
                              </motion.div>
                            </div>
                            
                            {/* Enhanced Product Grid */}
                            <div className="grid grid-cols-3 gap-8">
                              {item.megaMenu.featured.items?.map((featuredItem, index) => (
                                <motion.div
                                  key={index}
                                  whileHover={{ y: -8, scale: 1.02 }}
                                  transition={{ type: "spring", stiffness: 300 }}
                                  className="relative group"
                                >
                                  <Link
                                    href={featuredItem.href}
                                    className="block bg-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:border-gray-300/50"
                                  >
                                    {featuredItem.image && (
                                      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden mb-4">
                                        <img
                                          src={featuredItem.image}
                                          alt={featuredItem.name}
                                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                        {/* Enhanced Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                        
                                        {/* Enhanced Badges */}
                                        {featuredItem.badges && (
                                          <div className="absolute top-3 left-3 flex space-x-2">
                                            {featuredItem.badges.map((badge, badgeIndex) => (
                                              <motion.span
                                                key={badgeIndex}
                                                className="px-3 py-1.5 bg-gray-900/90 text-white text-xs rounded-full font-bold backdrop-blur-sm pointer-events-none"
                                                whileHover={{ scale: 1.1 }}
                                              >
                                                {badge}
                                              </motion.span>
                                            ))}
                                          </div>
                                        )}
                                        
                                        {/* Enhanced Quick Actions */}
                                        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                          <motion.button
                                            className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
                                            whileHover={{ scale: 1.1, y: -1 }}
                                          >
                                            <Heart className="w-4 h-4 text-gray-700" />
                                          </motion.button>
                                          <motion.button
                                            className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
                                            whileHover={{ scale: 1.1, y: -1 }}
                                          >
                                            <Eye className="w-4 h-4 text-gray-700" />
                                          </motion.button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Enhanced Content */}
                                    <div className="space-y-3">
                                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-lg leading-tight line-clamp-2">
                                        {featuredItem.name}
                                      </p>
                                      
                                      {/* Enhanced Rating */}
                                      {featuredItem.rating && (
                                        <div className="flex items-center space-x-3">
                                          <div className="flex items-center space-x-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-bold text-gray-900">{featuredItem.rating}</span>
                                          </div>
                                          {featuredItem.reviews && (
                                            <span className="text-sm text-gray-500">({featuredItem.reviews} reviews)</span>
                                          )}
                                        </div>
                                      )}
                                      
                                      {/* Enhanced Pricing */}
                                      <div className="flex items-center space-x-3">
                                        {featuredItem.salePrice ? (
                                          <>
                                            <span className="font-bold text-gray-900 text-lg">{featuredItem.salePrice}</span>
                                            <span className="text-sm text-gray-500 line-through">{featuredItem.originalPrice}</span>
                                            {featuredItem.discount && (
                                              <span className="px-2.5 py-1 bg-red-100 text-red-600 text-sm rounded-full font-bold">
                                                {featuredItem.discount}
                                              </span>
                                            )}
                                          </>
                                        ) : (
                                          <span className="font-bold text-gray-900 text-lg">{featuredItem.price}</span>
                                        )}
                                      </div>
                                    </div>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Menu Content */}
                        <div className="p-8">
                          {item.megaMenu.type === 'category' && item.megaMenu.columns ? (
                            <div className="grid grid-cols-3 gap-8">
                              {item.megaMenu.columns.map((column, colIndex) => (
                                <motion.div
                                  key={colIndex}
                                  variants={stagger}
                                  initial="initial"
                                  animate="animate"
                                >
                                  <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide flex items-center justify-between">
                                    <span>{column.title}</span>
                                    {column.featured && (
                                      <Link
                                        href={column.featured.href}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-normal normal-case"
                                      >
                                        {column.featured.name}
                                      </Link>
                                    )}
                                  </h4>
                                  
                                  {/* Featured Item */}
                                  {column.featured && column.featured.image && (
                                    <Link
                                      href={column.featured.href}
                                      className="block mb-4 group"
                                    >
                                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
                                        <img
                                          src={column.featured.image}
                                          alt={column.featured.name}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                      </div>
                                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                                        {column.featured.name}
                                      </p>
                                      {column.featured.badge && (
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                                          {column.featured.badge}
                                        </span>
                                      )}
                                    </Link>
                                  )}

                                  <div className="space-y-3">
                                    {column.items.map((subItem, itemIndex) => (
                                      <motion.div
                                        key={itemIndex}
                                        variants={{
                                          initial: { opacity: 0, x: -10 },
                                          animate: { opacity: 1, x: 0 }
                                        }}
                                      >
                                        <Link
                                          href={subItem.href}
                                          className={`flex items-center justify-between group text-sm transition-all duration-200 p-2 rounded-lg z-50 ${
                                            subItem.highlight
                                              ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100'
                                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                          }`}
                                        >
                                          <span className="flex items-center space-x-2">
                                            <span>{subItem.name}</span>
                                            {subItem.popular && (
                                              <motion.span
                                                className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium pointer-events-none"
                                                whileHover={{ scale: 1.1 }}
                                              >
                                                Popular
                                              </motion.span>
                                            )}
                                            {subItem.trending && (
                                              <motion.span
                                                className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium pointer-events-none"
                                                whileHover={{ scale: 1.1 }}
                                              >
                                                Trending
                                              </motion.span>
                                            )}
                                          </span>
                                          
                                          <div className="flex items-center space-x-2">
                                            {subItem.count && (
                                              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                {subItem.count}
                                              </span>
                                            )}
                                            {subItem.discount && (
                                              <span className="text-xs text-red-600 bg-red-100 px-1.5 py-0.5 rounded font-bold">
                                                {subItem.discount}
                                              </span>
                                            )}
                                            {subItem.highlight && (
                                              <ArrowRight className="w-3 h-3" />
                                            )}
                                          </div>
                                        </Link>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : item.megaMenu.quickLinks ? (
                            <div className="grid grid-cols-3 gap-6">
                              {item.megaMenu.quickLinks.map((link, index) => (
                                <Link
                                  key={index}
                                  href={link.href}
                                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 group"
                                >
                                  <span className="font-medium text-gray-900">{link.name}</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                                      {link.count} items
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Search Bar - takes all available space */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative" ref={searchRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSearchOpen(!searchOpen);
                    setTimeout(() => searchInputRef.current?.focus(), 150);
                  }}
                  className="flex items-center space-x-3 w-full px-6 py-3.5 rounded-2xl text-gray-600 hover:bg-white/80 transition-all duration-400 border border-gray-200/60 hover:border-gray-300/60 hover:shadow-lg group backdrop-blur-sm"
                >
                  <Search className="w-5 h-5 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-500 flex-1 text-left">Search luxury items...</span>
                  <kbd className="hidden lg:inline-flex items-center px-2 py-1 text-xs border border-gray-300/60 rounded-lg bg-white/50 text-gray-500 flex-shrink-0">⌘K</kbd>
                </motion.button>

                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      {...slideIn}
                      className="absolute left-0 top-16 w-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden z-50"
                    >
                      {/* Enhanced Search Header */}
                      <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-white/80">
                        <form onSubmit={handleSearch} className="relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Discover premium products, brands, and collections..."
                            className="w-full pl-12 pr-32 py-4 text-black border border-gray-300/60 rounded-2xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 text-lg font-medium bg-white/50 backdrop-blur-sm"
                            autoFocus
                          />
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loadingStates.search}
                            className="absolute right-2 top-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                          >
                            {loadingStates.search ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full pointer-events-none"
                              />
                            ) : (
                              'Search'
                            )}
                          </motion.button>
                        </form>

                        {/* Enhanced Search Categories */}
                        <div className="flex space-x-3 mt-4 overflow-x-auto">
                          {searchCategories.map((category) => (
                            <motion.button
                              key={category.id}
                              onClick={() => setActiveSearchCategory(category.id)}
                              whileHover={{ scale: 1.05, y: -1 }}
                              whileTap={{ scale: 0.95 }}
                              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 backdrop-blur-sm ${
                                activeSearchCategory === category.id
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                  : 'bg-white/60 text-gray-700 hover:bg-white/80 hover:shadow-md border border-gray-200/60'
                              }`}
                            >
                              <span>{category.name}</span>
                              <span className={`px-2 py-1 rounded-lg text-xs ${
                                activeSearchCategory === category.id
                                  ? 'bg-white/20 text-white/90'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {category.count}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Enhanced Search Content */}
                      <div className="max-h-96 overflow-y-auto">
                        {/* Loading State */}
                        {loadingStates.search && (
                          <div className="p-6 space-y-4">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="flex items-center space-x-4">
                                <ShimmerLoader className="w-16 h-16 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                  <ShimmerLoader className="h-4 rounded" />
                                  <ShimmerLoader className="h-3 rounded w-3/4" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Recent Searches */}
                        {recentSearches.length > 0 && !loadingStates.search && (
                          <div className="p-6 border-b border-gray-200/50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent Searches</div>
                              <button
                                onClick={() => {
                                  setRecentSearches([]);
                                  localStorage.removeItem('hajzen-recent-searches');
                                }}
                                className="text-xs text-gray-500 hover:text-gray-700"
                              >
                                Clear all
                              </button>
                            </div>
                            <div className="space-y-2">
                              {recentSearches.map((search, index) => (
                                <motion.button
                                  key={index}
                                  onClick={() => {
                                    setSearchQuery(search);
                                    handleSearch({ preventDefault: () => {} } as React.FormEvent);
                                  }}
                                  className="flex items-center justify-between w-full p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                                  whileHover={{ x: 4 }}
                                >
                                  <span className="flex items-center space-x-3">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>{search}</span>
                                  </span>
                                  <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    ↩
                                  </span>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Popular Searches */}
                        {!loadingStates.search && (
                          <div className="p-6 border-b border-gray-200/50">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Popular Now</div>
                            <div className="flex flex-wrap gap-2">
                              {searchSuggestions.popular.map((term, index) => (
                                <motion.button
                                  key={index}
                                  onClick={() => {
                                    setSearchQuery(term);
                                    handleSearch({ preventDefault: () => {} } as React.FormEvent);
                                  }}
                                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center space-x-2"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <TrendingUp className="w-3 h-3" />
                                  <span>{term}</span>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Trending Searches */}
                        {!loadingStates.search && (
                          <div className="p-6">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Trending</div>
                            <div className="space-y-2">
                              {searchSuggestions.trending.map((term, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setSearchQuery(term);
                                    handleSearch({ preventDefault: () => {} } as React.FormEvent);
                                  }}
                                  className="flex items-center space-x-3 w-full p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <Sparkles className="w-4 h-4 text-yellow-500" />
                                  <span>{term}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Actions (wishlist, user, cart, mobile) */}
            <div className="flex items-center space-x-3">
          

              {/* Wishlist */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/profile/wishlist"
                  aria-label="Wishlist"
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 hover:bg-white/80 transition-all duration-300 border border-transparent hover:border-gray-200/60 hover:shadow-lg group backdrop-blur-sm"
                >
                  <Heart className="h-5 w-5 transition-colors group-hover:text-pink-500 pointer-events-none" />
                  <motion.div
                    className="hidden absolute -top-2 -right-2 h-5 w-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-[10px] leading-none font-bold shadow-lg items-center justify-center pointer-events-none"
                    whileHover={{ scale: 1.2, rotate: 180 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  />
                </Link>
              </motion.div>

              {/* User Account */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-white/80 transition-all duration-400 border border-gray-200/60 hover:border-gray-300/60 hover:shadow-lg group backdrop-blur-sm relative"
                  >
                    {/* Enhanced Online Status */}
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white z-10 shadow-lg">
                      <motion.div
                        className="w-full h-full bg-green-400 rounded-full pointer-events-none"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    
                    {/* Enhanced Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg relative overflow-hidden group-hover:shadow-xl transition-all duration-500">
                      <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                      {/* Enhanced Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                    </div>
                    
                    <ChevronDown className={`w-4 h-4 transition-transform duration-400 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`} />
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        {...slideIn}
                        className="absolute right-0 top-16 w-96 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden"
                      >
                        {/* Enhanced User Profile Header */}
                        <div className="p-8 bg-gradient-to-br from-gray-50/80 to-white/80 border-b border-gray-200/50">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              {/* Enhanced Tier Badge */}
                              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                                <Crown className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-lg truncate">{user.name}</p>
                              <p className="text-sm text-gray-500 truncate">{user.email}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                                  {user.tier} Tier
                                </span>
                                <span className="text-xs text-gray-500">{user.points} points</span>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Progress Bar */}
                          <div className="mt-6">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Progress to {user.nextTier}</span>
                              <span className="font-semibold">{user.pointsNeeded} pts needed</span>
                            </div>
                            <div className="w-full bg-gray-200/60 rounded-full h-2.5 backdrop-blur-sm">
                              <motion.div
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2.5 rounded-full shadow-lg pointer-events-none"
                                initial={{ width: 0 }}
                                animate={{ width: `${(user.points / (user.points + user.pointsNeeded)) * 100}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="p-6 border-b border-gray-200/50">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="font-bold text-gray-900 text-lg">{user.orders}</div>
                              <div className="text-xs text-gray-500">Orders</div>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-lg">12</div>
                              <div className="text-xs text-gray-500">Wishlist</div>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-lg">4.8</div>
                              <div className="text-xs text-gray-500">Rating</div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Menu Items */}
                        <div className="p-2">
                          <Link
                            href="/profile"
                            className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            <span>My Profile</span>
                            <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          
                          <Link
                            href="/profile/orders"
                            className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Package className="w-4 h-4" />
                            <span>My Orders</span>
                            <span className="ml-auto px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                              {user.orders}
                            </span>
                          </Link>
                          
                          <Link
                            href="/profile/wishlist"
                            className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Heart className="w-4 h-4" />
                            <span>Wishlist</span>
                            <span className="ml-auto px-1.5 py-0.5 bg-pink-100 text-pink-600 text-xs rounded-full">
                              12
                            </span>
                          </Link>

                          {user.role === "ADMIN" && (
                            <Link
                              href="/dashboard"
                              className="flex items-center space-x-3 px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-colors group border-t border-gray-100 mt-2"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">A</span>
                              </div>
                              <span>Admin Dashboard</span>
                              <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          )}
                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-gray-100 p-2">
                          <form action={signOutAction}>
                            <button
                              type="submit"
                              className="flex items-center space-x-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full group"
                            >
                              <span>Sign Out</span>
                              <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Enhanced Auth Buttons */
                <div className="hidden md:flex items-center space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/signin"
                      className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all duration-400 hover:bg-white/80 hover:shadow-lg border border-gray-200/60 hover:border-gray-300/60"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/signup"
                      className="px-6 py-2.5 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl text-sm font-semibold hover:shadow-2xl transition-all duration-400 hover:from-gray-800 hover:to-gray-600 flex items-center space-x-2 shadow-lg"
                    >
                      <User className="w-4 h-4" />
                      <span>Sign Up</span>
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Cart */}
              <div className="relative" ref={cartRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setCartPreviewOpen(true)}
                  onMouseLeave={() => setCartPreviewOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-white/80 transition-all duration-400 border border-gray-200/60 hover:border-gray-300/60 hover:shadow-lg group backdrop-blur-sm relative"
                >
                  <ShoppingBag className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
                  <motion.div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs flex items-center justify-center font-bold shadow-lg pointer-events-none" whileHover={{ scale: 1.3, rotate: 180 }} transition={{ type: 'spring', stiffness: 500 }}>
                    {cartCount}
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {cartPreviewOpen && (
                    <motion.div
                      {...slideIn}
                      className="absolute right-0 top-16 w-96 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden"
                      onMouseEnter={() => setCartPreviewOpen(true)}
                      onMouseLeave={() => setCartPreviewOpen(false)}
                    >
                      {/* Cart header */}
                      <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-white/80">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-900 text-xl">Shopping Cart</h3>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500 font-medium">
                              {cartCount} {cartCount === 1 ? 'item' : 'items'}
                            </span>
                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="text-lg font-bold text-gray-900">{fmtMAD(cartTotal)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cart items */}
                      <div className="max-h-80 overflow-y-auto">
                        {cartItems.length === 0 && <div className="p-6 text-sm text-gray-500">Your cart is empty.</div>}

                        {cartItems.map((item: any, i: number) => {
                          const keyId =
                            item.variantSizeId ??
                            (item.variantId && (item.sizeId || item.size?.id) ? `${item.variantId}:${item.sizeId ?? item.size?.id}` : undefined) ??
                            getItemId(item) ??
                            String(i);

                          const qty = getItemQtySafe(item);
                          const title = getItemTitle(item);
                          const img = getItemImage(item);
                          const { unit, original } = getUnitPricing(item);
                          const isDiscounted = original > unit;

                          return (
                            <motion.div
                              key={keyId}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-4 border-b border-gray-200/50 hover:bg-white/50 transition-colors duration-300 group"
                            >
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-gray-900 text-base">{fmtMAD(unit)}</span>
                                  {isDiscounted && <span className="text-sm text-gray-500 line-through">{fmtMAD(original)}</span>}
                                </div>

                                <div className="flex items-center space-x-3">
                                  {isDiscounted && (
                                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                                      -{Math.round(((original - unit) / (original || 1)) * 100)}%
                                    </span>
                                  )}

                                  {/* ✅ Remove by variantSizeId */}
                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (item.variantSizeId) remove(item.variantSizeId);
                                    }}
                                    className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-lg hover:bg-red-50"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label="Remove from cart"
                                    title="Remove"
                                  >
                                    <X className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      <div className="p-6 bg-gradient-to-br from-gray-50/80 to-white/80 border-t border-gray-200/50">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-medium">Subtotal:</span>
                            <span className="font-bold text-gray-900 text-xl">{fmtMAD(cartTotal)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Shipping:</span>
                            <span className="text-green-600 font-semibold">FREE</span>
                          </div>
                          <div className="flex space-x-3">
                            <Link href="/cart" className="flex-1 text-center py-4 border-2 border-gray-300/60 text-gray-700 rounded-xl font-semibold hover:bg-white hover:shadow-lg transition-all duration-300" onClick={() => setCartPreviewOpen(false)}>
                              View Cart
                            </Link>
                            <Link href="/checkout" className="flex-1 text-center py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:from-blue-700 hover:to-purple-700" onClick={() => setCartPreviewOpen(false)}>
                              Checkout
                            </Link>
                          </div>
                          <div className="flex items-center justify-center space-x-6 pt-4 border-t border-gray-200/50">
                            <Shield className="w-5 h-5 text-green-600" />
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <Truck className="w-5 h-5 text-orange-600" />
                            <span className="text-sm text-gray-500 font-medium">Secure & Trusted</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu button */}
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setMobileMenuOpen(true)} className="xl:hidden p-3 rounded-2xl text-gray-600 hover:bg-white/80 transition-all duration-400 border border-gray-200/60 hover:border-gray-300/60 hover:shadow-lg relative backdrop-blur-sm">
                <Menu className="w-5 h-5" />
                {notificationCount > 0 && (
                  <motion.div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white shadow-lg pointer-events-none" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] xl:hidden pointer-events-auto"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-lg pointer-events-auto"
                onClick={() => setMobileMenuOpen(false)}
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 35, stiffness: 400 }}
                className="
                  absolute right-0 top-0 h-screen w-full max-w-md
                  bg-white/95 backdrop-blur-2xl shadow-2xl border-l border-gray-200/50 z-[9999]
                  flex flex-col overflow-hidden pointer-events-auto
                "
              >
                <div className="flex items-center justify-between p-8 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-white/80 sticky top-0 z-10">
                  <Link
                    href="/"
                    className="flex items-center space-x-4"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">H</span>
                    </div>
                    <div>
                      <span className="text-2xl font-black text-gray-900">HAMZA</span>
                      <p className="text-sm text-gray-500 -mt-1 font-semibold">
                        PREMIUM STORE
                      </p>
                    </div>
                  </Link>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-2xl hover:bg-white/80 transition-colors border border-gray-200/60"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </motion.button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {/* User Section */}
                  <div className="p-8 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-white/80">
                    {user ? (
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center space-x-3 mt-2">
                            <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                              {user.tier} Member
                            </span>
                            <span className="text-xs text-gray-500">{user.points} points</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-600 text-lg font-medium">Welcome to HAJZEN</p>
                        <div className="flex space-x-3">
                          <Link
                            href="/signin"
                            className="flex-1 text-center py-3 border-2 border-gray-300/60 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/signup"
                            className="flex-1 text-center py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl font-medium hover:from-gray-800 hover:to-gray-600 transition-all duration-300 shadow-lg"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Create Account
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Search */}
                  <div className="p-6 border-b border-gray-200/50">
                    <form onSubmit={handleSearch} className="relative">
                      <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products, brands, categories..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium bg-white/50 backdrop-blur-sm"
                      />
                      <motion.button
                        type="submit"
                        whileTap={{ scale: 0.95 }}
                        className="absolute right-2 top-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Go
                      </motion.button>
                    </form>
                  </div>

                  {/* Navigation */}
                  <nav className="p-6 space-y-1">
                    {navigation.map((item) => (
                      <div
                        key={item.name}
                        className="border-b border-gray-100/50 last:border-b-0 pb-6 last:pb-0"
                      >
                        <Link
                          href={item.href}
                          className={`flex items-center justify-between py-4 text-lg font-bold transition-colors ${
                            item.highlight ? "text-red-600" : "text-gray-900"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="flex items-center space-x-3">
                            <span>{item.name}</span>
                            {item.badge && (
                              <span
                                className={`px-2 py-1 text-white text-xs rounded-full font-bold ${item.badge.color}`}
                              >
                                {item.badge.text}
                              </span>
                            )}
                          </span>
                          <ArrowRight className="w-5 h-5" />
                        </Link>

                        {item.megaMenu && (
                          <div className="ml-4 space-y-4 border-l-2 border-gray-200/50 pl-4 mt-4">
                            {item.megaMenu.featured && (
                              <div className="mb-4">
                                <p className="font-semibold text-gray-900 text-sm mb-3">
                                  {item.megaMenu.featured.title}
                                </p>
                                <div className="space-y-3">
                                  {item.megaMenu.featured.items
                                    ?.slice(0, 2)
                                    .map((featuredItem, index) => (
                                      <Link
                                        key={index}
                                        href={featuredItem.href}
                                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100/50"
                                        onClick={() => setMobileMenuOpen(false)}
                                      >
                                        {featuredItem.image && (
                                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                              src={featuredItem.image}
                                              alt={featuredItem.name}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-gray-900 text-sm leading-tight">
                                            {featuredItem.name}
                                          </p>
                                          <div className="flex items-center space-x-2 mt-1">
                                            {featuredItem.salePrice ? (
                                              <>
                                                <span className="font-bold text-gray-900 text-sm">
                                                  {featuredItem.salePrice}
                                                </span>
                                                <span className="text-xs text-gray-500 line-through">
                                                  {featuredItem.originalPrice}
                                                </span>
                                              </>
                                            ) : (
                                              <span className="font-bold text-gray-900 text-sm">
                                                {featuredItem.price}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </Link>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>

                  <div className="p-6 border-t border-gray-200/50 bg-gray-50/50">
                  </div>

                  <div className="p-6 border-t border-gray-200/50 bg-white/80">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>© {new Date().getFullYear()} HAJZEN</span>
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3 text-green-600" />
                        <span>Secure</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </LazyMotion>
  );
}