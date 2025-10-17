'use client';

import { useEffect, useMemo, useState } from 'react';
import { getCart, updateQty, removeItem } from '@/lib/cart-cookie';
import { Cart, CartItem, subtotalMAD, lineTotalMAD } from '@/lib/cart-types';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Trash2, Plus, Minus, ChevronRight, Shield, 
  Truck, Clock, Award, Sparkles, Zap, Heart, Star, X, 
  Package, CreditCard, Lock, Gift, RotateCcw, CheckCircle,
  ShoppingCart, ArrowRight, ArrowLeft
} from 'lucide-react';

// Color scheme constants for consistency
const COLORS = {
  primary: {
    bg: 'bg-black',
    text: 'text-white',
    hover: 'hover:bg-gray-800',
    border: 'border-black'
  },
  secondary: {
    bg: 'bg-white',
    text: 'text-gray-800',
    hover: 'hover:bg-gray-50',
    border: 'border-gray-300'
  },
  accent: {
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    hover: 'hover:bg-blue-700',
    border: 'border-blue-600'
  }
} as const;

export default function CartPageClient() {
  const [cart, setCart] = useState<Cart>({ items: [], updatedAt: Date.now() });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCart(getCart());
    const onFocus = () => setCart(getCart());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const sub = useMemo(() => subtotalMAD(cart), [cart]);
  const itemCount = cart.items.reduce((total, item) => total + item.qty, 0);
  const selectedTotal = useMemo(() => {
    return cart.items
      .filter(item => selectedItems.has(item.variantSizeId))
      .reduce((total, item) => total + lineTotalMAD(item), 0);
  }, [cart.items, selectedItems]);

  function onQtyChange(id: string, q: number) {
    const c = updateQty(id, q);
    setCart(c);
  }

  function onRemove(id: string) {
    const c = removeItem(id);
    setCart(c);
  }

  function saveForLater(item: CartItem) {
    setSavedForLater(prev => [...prev, item]);
    onRemove(item.variantSizeId);
  }

  function moveToCart(item: CartItem) {
    const c = updateQty(item.variantSizeId, item.qty);
    setCart(c);
    setSavedForLater(prev => prev.filter(i => i.variantSizeId !== item.variantSizeId));
  }

  function toggleSelectItem(id: string) {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  }

  function selectAllItems() {
    if (selectedItems.size === cart.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart.items.map(item => item.variantSizeId)));
    }
  }

  function handleImageLoad(id: string) {
    setImageLoadStates(prev => ({ ...prev, [id]: true }));
  }

  // Enhanced Mobile Drawer with consistent styling
  const CartDrawer = () => (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 lg:hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
                <p className="text-sm text-gray-600">{itemCount} items · {sub.toFixed(2)} MAD</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDrawerOpen(false)}
                className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
            
            {/* Cart Items with proper scroll containment */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <AnimatePresence>
                  {cart.items.map((it, index) => (
                    <motion.div
                      key={it.variantSizeId}
                      layout
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border-b border-gray-100"
                    >
                      <div className="flex gap-4">
                        <div className="relative">
                          <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-gray-100">
                            <Image 
                              src={it.variantImage || it.variantStyleImg || '/placeholder.svg'} 
                              alt={it.variantTitle} 
                              fill 
                              className="object-cover"
                              onLoad={() => handleImageLoad(it.variantSizeId)}
                            />
                            {!imageLoadStates[it.variantSizeId] && (
                              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
                            )}
                          </div>
                          {it.discountPercent && (
                            <div className="absolute -top-2 -left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                              -{it.discountPercent}%
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0"> {/* Added min-w-0 for text truncation */}
                          <h4 className="font-semibold text-gray-800 line-clamp-2 truncate">{it.variantTitle}</h4>
                          <p className="text-sm text-gray-600 mt-1 truncate">{it.sizeLabel}</p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => onQtyChange(it.variantSizeId, it.qty - 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                                aria-label={`Decrease quantity of ${it.variantTitle}`}
                                disabled={it.qty <= 1}
                              >
                                <Minus className={`w-3 h-3 ${it.qty <= 1 ? 'text-gray-400' : 'text-gray-700'}`} />
                              </motion.button>
                              <span className="w-8 text-center font-medium text-gray-800">{it.qty}</span>
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => onQtyChange(it.variantSizeId, it.qty + 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                                aria-label={`Increase quantity of ${it.variantTitle}`}
                                disabled={it.qty >= it.maxStock}
                              >
                                <Plus className={`w-3 h-3 ${it.qty >= it.maxStock ? 'text-gray-400' : 'text-gray-700'}`} />
                              </motion.button>
                            </div>
                            
                            <div className="text-right min-w-20"> {/* Fixed width for price alignment */}
                              <div className="font-bold text-gray-800 text-sm">{(it.finalUnitPriceMAD * it.qty).toFixed(2)} MAD</div>
                              {it.discountPercent && (
                                <div className="text-xs text-gray-500 line-through">
                                  {(it.unitPriceMAD * it.qty).toFixed(2)} MAD
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-3 mt-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => saveForLater(it)}
                              className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-gray-400 transition-colors"
                              aria-label={`Save ${it.variantTitle} for later`}
                            >
                              Save
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => onRemove(it.variantSizeId)}
                              className="flex-1 text-center py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                              aria-label={`Remove ${it.variantTitle} from cart`}
                            >
                              Remove
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Footer with consistent button styles */}
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-gray-800">{sub.toFixed(2)} MAD</span>
                </div>
                
                <Link href="/checkout" onClick={() => setIsDrawerOpen(false)}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full ${COLORS.primary.bg} ${COLORS.primary.text} py-4 rounded-xl font-semibold text-lg ${COLORS.primary.hover} transition-colors flex items-center justify-center gap-3 shadow-lg`}
                  >
                    <Lock className="w-5 h-5" />
                    Secure Checkout
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                
                <Link href="/products" onClick={() => setIsDrawerOpen(false)}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full ${COLORS.secondary.bg} ${COLORS.secondary.text} border-2 ${COLORS.secondary.border} py-3 rounded-xl font-semibold hover:border-black transition-colors`}
                  >
                    Continue Shopping
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md w-full"
        >
          {/* Enhanced Animated Icon */}
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-32 h-32 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 border border-gray-200"
          >
            <ShoppingCart className="w-16 h-16 text-gray-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-light mb-6 text-gray-800"
          >
            Your cart is empty
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 mb-8 text-lg"
          >
            Discover our curated collection and find something special
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <Link href="/products" className="block">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full max-w-xs mx-auto ${COLORS.primary.bg} ${COLORS.primary.text} px-12 py-4 rounded-xl font-semibold text-lg ${COLORS.primary.hover} transition-colors shadow-lg flex items-center gap-3 justify-center`}
              >
                <Zap className="w-5 h-5" />
                Explore Collection
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              {['New Arrivals', 'Bestsellers', 'Sale'].map((category, index) => (
                <Link key={category} href={`/products?category=${category.toLowerCase()}`} className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200 shadow-sm text-center hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="text-sm font-medium text-gray-700 truncate">{category}</div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Enhanced Mobile Floating Cart Button */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-black to-gray-800 text-white rounded-2xl shadow-2xl z-40 lg:hidden flex items-center justify-center group"
        aria-label={`Open cart with ${itemCount} items`}
      >
        <ShoppingBag className="w-6 h-6" />
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-lg"
        >
          {itemCount}
        </motion.span>
        
        {/* Pulse Animation */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-yellow-400"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      <CartDrawer />

      {/* Enhanced Desktop Layout */}
      <div className="container mx-auto px-4 py-8 hidden lg:block">
        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-12"
        >
          <div className="flex items-center gap-4 md:gap-8 flex-wrap justify-center">
            {['Cart', 'Checkout'].map((step, index) => (
              <div key={step} className="flex items-center gap-2 md:gap-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-sm md:text-base ${
                    index === 0 
                      ? 'bg-black text-white shadow-lg' 
                      : 'bg-white text-gray-400 border border-gray-300'
                  }`}
                >
                  {index === 0 ? <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> : index + 1}
                </motion.div>
                <span className={`font-medium text-sm md:text-base ${index === 0 ? 'text-black' : 'text-gray-500'}`}>
                  {step}
                </span>
                {index < 3 && (
                  <div className="w-6 md:w-12 h-0.5 bg-gray-300" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8"
        >
          {/* Left Column - Enhanced Cart Items */}
          <div className="xl:col-span-8">
            {/* Enhanced Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <motion.h1
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-800 mb-2"
                >
                  Shopping Cart
                </motion.h1>
                <p className="text-gray-600 text-base sm:text-lg">
                  {itemCount} item{itemCount > 1 ? 's' : ''} in your collection
                </p>
              </div>
              
              <div className="flex items-center gap-4 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={selectAllItems}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
                >
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 rounded flex items-center justify-center ${
                    selectedItems.size === cart.items.length 
                      ? 'bg-black border-black text-white' 
                      : 'border-gray-400'
                  }`}>
                    {selectedItems.size === cart.items.length && <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3" />}
                  </div>
                  Select All ({selectedItems.size})
                </motion.button>
                
                <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium text-base sm:text-lg whitespace-nowrap">
                  Continue Shopping →
                </Link>
              </div>
            </div>

            {/* Enhanced Cart Items */}
            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence>
                {cart.items.map((it, index) => (
                  <motion.div
                    key={it.variantSizeId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, height: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex gap-4 sm:gap-6">
                      {/* Selection Checkbox */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleSelectItem(it.variantSizeId)}
                        className="flex items-start pt-2 flex-shrink-0"
                        aria-label={`Select ${it.variantTitle}`}
                      >
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 border-2 rounded-full flex items-center justify-center transition-all ${
                          selectedItems.has(it.variantSizeId)
                            ? 'bg-black border-black text-white'
                            : 'border-gray-300 group-hover:border-gray-400'
                        }`}>
                          {selectedItems.has(it.variantSizeId) && <CheckCircle className="w-3 h-3" />}
                        </div>
                      </motion.button>

                      {/* Enhanced Product Image */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-xl lg:rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-md"
                      >
                        <Image
                          src={it.variantImage || it.variantStyleImg || '/placeholder.svg'}
                          alt={it.variantTitle}
                          fill
                          className="object-cover"
                          onLoad={() => handleImageLoad(it.variantSizeId)}
                        />
                        {!imageLoadStates[it.variantSizeId] && (
                          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl lg:rounded-2xl" />
                        )}
                        {it.discountPercent && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg"
                          >
                            -{it.discountPercent}%
                          </motion.div>
                        )}
                        
                        {/* Quick Actions Overlay */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2"
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => saveForLater(it)}
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center"
                            aria-label={`Save ${it.variantTitle} for later`}
                          >
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                          </motion.button>
                          <Link href={`/products/${it.productSlug}`}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center"
                              aria-label={`View details of ${it.variantTitle}`}
                            >
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                            </motion.button>
                          </Link>
                        </motion.div>
                      </motion.div>

                      {/* Enhanced Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <Link 
                              href={`/products/${it.productSlug}`}
                              className="text-xl sm:text-2xl font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 break-words"
                            >
                              {it.variantTitle}
                            </Link>
                            <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-2">
                              Style: {it.variantName} · Size: {it.sizeLabel}
                            </p>
                            <p className="text-gray-500 text-xs sm:text-sm">SKU: {it.sku}</p>
                            
                            {/* Stock Indicator */}
                            <div className="flex items-center gap-2 mt-2 sm:mt-3">
                              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                                it.maxStock > 10 ? 'bg-green-500' : 
                                it.maxStock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                              <span className="text-xs sm:text-sm text-gray-600">
                                {it.maxStock > 10 ? 'In Stock' : 
                                 it.maxStock > 0 ? `Only ${it.maxStock} left` : 'Out of Stock'}
                              </span>
                            </div>
                          </div>

                          {/* Enhanced Price */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                              {(it.finalUnitPriceMAD * it.qty).toFixed(2)} MAD
                            </div>
                            {it.discountPercent && (
                              <div className="text-sm sm:text-base lg:text-lg text-gray-500 line-through">
                                {(it.unitPriceMAD * it.qty).toFixed(2)} MAD
                              </div>
                            )}
                            <div className="text-green-600 font-semibold text-xs sm:text-sm mt-1">
                              You save {((it.unitPriceMAD - it.finalUnitPriceMAD) * it.qty).toFixed(2)} MAD
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Quantity Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 sm:mt-6 gap-4">
                          <div className="flex items-center gap-4 sm:gap-6">
                            <div className="flex items-center border-2 border-gray-200 rounded-xl lg:rounded-2xl overflow-hidden shadow-sm">
                              <motion.button
                                whileHover={{ backgroundColor: "#f8fafc" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onQtyChange(it.variantSizeId, it.qty - 1)}
                                className="p-2 sm:p-3 hover:bg-gray-50 transition-colors"
                                aria-label={`Decrease quantity of ${it.variantTitle}`}
                                disabled={it.qty <= 1}
                              >
                                <Minus className={`w-4 h-4 sm:w-5 sm:h-5 ${it.qty <= 1 ? 'text-gray-400' : 'text-gray-700'}`} />
                              </motion.button>
                              
                              <input
                                className="w-12 sm:w-16 text-center bg-transparent outline-none font-semibold text-gray-800 text-sm sm:text-base lg:text-lg"
                                value={it.qty}
                                onChange={e => {
                                  const v = parseInt(e.target.value || '1', 10);
                                  onQtyChange(it.variantSizeId, Number.isNaN(v) ? 1 : Math.min(v, it.maxStock));
                                }}
                                aria-label={`Quantity of ${it.variantTitle}`}
                              />
                              
                              <motion.button
                                whileHover={{ backgroundColor: "#f8fafc" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onQtyChange(it.variantSizeId, it.qty + 1)}
                                className="p-2 sm:p-3 hover:bg-gray-50 transition-colors"
                                aria-label={`Increase quantity of ${it.variantTitle}`}
                                disabled={it.qty >= it.maxStock}
                              >
                                <Plus className={`w-4 h-4 sm:w-5 sm:h-5 ${it.qty >= it.maxStock ? 'text-gray-400' : 'text-gray-700'}`} />
                              </motion.button>
                            </div>
                            
                            <div className="text-gray-600 font-medium text-sm sm:text-base">
                              Max: {it.maxStock} available
                            </div>
                          </div>

                          {/* Enhanced Action Buttons */}
                          <div className="flex items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05, color: "#3b82f6" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => saveForLater(it)}
                              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium text-sm sm:text-base"
                              aria-label={`Save ${it.variantTitle} for later`}
                            >
                              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                              Save
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05, color: "#dc2626" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => onRemove(it.variantSizeId)}
                              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-medium text-sm sm:text-base"
                              aria-label={`Remove ${it.variantTitle} from cart`}
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              Remove
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Saved for Later Section */}
            {savedForLater.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 sm:mt-12"
              >
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                  Saved for Later ({savedForLater.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedForLater.map((item, index) => (
                    <motion.div
                      key={item.variantSizeId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl sm:rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.variantImage || item.variantStyleImg || '/placeholder.svg'}
                            alt={item.variantTitle}
                            fill
                            className="object-cover"
                            onLoad={() => handleImageLoad(item.variantSizeId)}
                          />
                          {!imageLoadStates[item.variantSizeId] && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 line-clamp-2 text-sm sm:text-base break-words">
                            {item.variantTitle}
                          </h4>
                          <div className="text-base sm:text-lg font-bold text-gray-800 mt-1">
                            {(item.finalUnitPriceMAD * item.qty).toFixed(2)} MAD
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => moveToCart(item)}
                            className="w-full mt-2 sm:mt-3 py-2 border-2 border-black text-black rounded-lg font-semibold hover:bg-black hover:text-white transition-colors text-xs sm:text-sm"
                          >
                            Move to Cart
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Enhanced Right Column - Summary & Features */}
          <div className="xl:col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* Enhanced Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Order Summary</h2>
                  <p className="text-blue-100 text-sm sm:text-base">Review your items and proceed to checkout</p>
                </div>
                
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>{sub.toFixed(2)} MAD</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>Tax</span>
                    <span>Included</span>
                  </div>
                  
                  {selectedItems.size > 0 && selectedItems.size !== cart.items.length && (
                    <div className="flex justify-between text-blue-600 text-sm sm:text-base">
                      <span>Selected items ({selectedItems.size})</span>
                      <span>{selectedTotal.toFixed(2)} MAD</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span>{sub.toFixed(2)} MAD</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Checkout Button */}
                <div className="p-4 sm:p-6 border-t border-gray-100">
                  <Link href="/checkout">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full ${COLORS.primary.bg} ${COLORS.primary.text} py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg ${COLORS.primary.hover} transition-all flex items-center justify-center gap-3 shadow-lg`}
                    >
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                  </Link>

                  {/* Security & Trust */}
                  <div className="flex items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-gray-500 text-xs sm:text-sm flex-wrap">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Secure SSL Encryption</span>
                    <span className="hidden sm:inline">·</span>
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Protected Payment</span>
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Trust Features */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 gap-3 sm:gap-4"
              >
                {[
                  { icon: Truck, label: "Free Shipping", desc: "Over 500 MAD", color: "text-blue-600" },
                  { icon: Package, label: "Easy Returns", desc: "30 Days", color: "text-green-600" },
                  { icon: Award, label: "2-Year Warranty", desc: "Guaranteed", color: "text-yellow-600" },
                  { icon: CreditCard, label: "Secure Payment", desc: "Protected", color: "text-purple-600" },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <feature.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${feature.color} mx-auto mb-2`} />
                    <div className="font-semibold text-gray-800 text-xs sm:text-sm">{feature.label}</div>
                    <div className="text-gray-600 text-xs">{feature.desc}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Enhanced Recommendations */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl lg:rounded-3xl p-4 sm:p-6 border border-blue-200"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Complete your look</h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  Customers who bought these items also loved
                </p>
                <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm flex items-center gap-2">
                  Discover Recommendations
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </motion.div>

              {/* Gift Message */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl lg:rounded-3xl p-4 sm:p-6 border border-green-200"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Add a gift message?</h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  Make it special with a personalized note
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 sm:py-3 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-600 hover:text-white transition-colors text-sm"
                >
                  Add Gift Options
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Progress Bar for Free Shipping */}
        {sub < 500 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-8 sm:mt-12 bg-white rounded-2xl lg:rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                <span className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">
                  You're almost there!
                </span>
              </div>
              <span className="text-gray-600 font-medium text-xs sm:text-sm">
                {(500 - sub).toFixed(2)} MAD to go
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-2 sm:mb-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((sub / 500) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 sm:h-3 rounded-full relative"
              >
                <motion.div
                  animate={{ x: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
            
            <p className="text-center text-gray-600 text-xs sm:text-sm">
              Add <span className="font-semibold text-green-600">{(500 - sub).toFixed(2)} MAD</span> more to get{' '}
              <span className="font-semibold">FREE shipping!</span>
            </p>
            
            <div className="flex justify-center mt-3 sm:mt-4">
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  Continue Shopping
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}