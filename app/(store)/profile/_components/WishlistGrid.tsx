// app/(store)/profile/_components/WishlistGrid.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useTransition } from 'react';
import { moveWishlistToCart, removeWishlistItem } from '../_actions/wishlist.actions';
import { ShoppingCart, X, Heart, Star, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function WishlistGrid({ items }: { items: any[] }) {
  const [pending, start] = useTransition();

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10 text-pink-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Your Wishlist is Empty</h3>
        <p className="text-gray-600 mb-6">
          Start saving items you love to see them here
        </p>
        <Link href="/products">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <AnimatePresence>
        {items.map((w, index) => {
          const product = w.product;
          const variant = w.variant;
      const primaryImage =
  Array.isArray(variant?.images) && variant.images.length > 0
    ? variant.images[0]?.url
    : variant?.variantStyleImg || '';

          const size = variant?.sizes?.[0];
          const basePrice = size?.priceMAD ?? 0;
          const discount = size?.discountPercent ?? 0;
          const price = discount ? (basePrice * (100 - discount)) / 100 : basePrice;

          return (
            <motion.div
              key={`${w.productId}-${w.variantId}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              layout
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-2xl rounded-2xl border-2 border-gray-300 p-4 hover:shadow-xl transition-all group"
            >
              {/* Product Image */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
                {primaryImage ? (
                  <Image
                    src={primaryImage}
                    alt={variant?.title ?? 'Product'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-sm text-gray-400">
                    No image
                  </div>
                )}
                
                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                    -{discount}%
                  </div>
                )}
                
                {/* Remove Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    start(async () => {
                      await removeWishlistItem(w.productId, w.variantId);
                    })
                  }
                  disabled={pending}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4 text-gray-700" />
                </motion.button>
                
                {/* Rating */}
                {product.rating && (
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current text-yellow-400" />
                    {product.rating.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <Link 
                  href={`/products/${product.slug}`}
                  className="block group"
                >
                  <h3 className="font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.brand}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                    {variant?.title}
                  </p>
                </Link>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-lg font-black text-gray-800">
                      {price.toFixed(2)} MAD
                    </div>
                    {discount > 0 && (
                      <div className="text-sm text-gray-500 line-through">
                        {basePrice.toFixed(2)} MAD
                      </div>
                    )}
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-bold">
                      <Zap className="w-4 h-4" />
                      Save {discount}%
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      start(async () => {
                        await removeWishlistItem(w.productId, w.variantId);
                      })
                    }
                    disabled={pending}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 disabled:bg-gray-400 transition-colors text-sm"
                  >
                    <X className="w-3 h-3" />
                    Remove
                  </motion.button>
                  
                  <Link 
                    href={`/products/${product.slug}`}
                    onClick={() =>
                      start(async () => {
                        await moveWishlistToCart(w.productId, w.variantId);
                      })
                    }
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors text-sm"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Add to Cart
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}