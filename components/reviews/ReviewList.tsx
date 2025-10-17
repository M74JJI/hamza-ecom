// ReviewList.tsx - Updated with Hero Theme
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Calendar, CheckCircle, Package, Crown } from 'lucide-react';
import ReviewStars from './ReviewStars';

export default function ReviewList({ items }: { items: any[] }) {
  if (items.length === 0) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      <div className="space-y-6">
        {items.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-3xl shadow-2xl border-4 border-black overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-black text-lg border-2 border-white">
                      {review.user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-black">
                        {review.user?.name || 'Anonymous'}
                      </h4>
                      {review.isVerified && (
                        <span className="px-2 py-1 bg-yellow-500 text-black text-xs rounded-2xl font-black border border-black">
                          VERIFIED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-sm font-bold">
                      <Calendar className="w-3 h-3" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <ReviewStars value={review.rating} size={20} />
                  <div className="text-xs text-gray-700 font-black mt-1">
                    {review.rating}.0 OUT OF 5
                  </div>
                </div>
              </div>

              {/* Product Info */}
              {(review.chosenVariant || review.chosenSize) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-4 p-4 bg-gray-100 rounded-2xl mb-4 border-2 border-gray-300"
                >
                  {review.chosenVariant?.variantStyleImg && (
                    <Image 
                      src={review.chosenVariant.variantStyleImg} 
                      alt="" 
                      width={48} 
                      height={48} 
                      className="rounded-xl object-cover border-2 border-black"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 text-sm font-bold">
                      {review.chosenVariant?.title && (
                        <span className="text-black">
                          {review.chosenVariant.title}
                        </span>
                      )}
                      {review.chosenSize && (
                        <span className="text-gray-700">
                          SIZE: <strong className="text-black">{review.chosenSize}</strong>
                        </span>
                      )}
                      {typeof review.quantity === 'number' && (
                        <span className="text-gray-700">
                          QTY: <strong className="text-black">{review.quantity}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                  <Package className="w-4 h-4 text-black" />
                </motion.div>
              )}

              {/* Review Content */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-800 leading-relaxed text-lg font-medium"
              >
                {review.comment}
              </motion.p>

              {/* Helpful Metrics */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-300"
              >
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-2xl transition-colors text-sm font-black border-2 border-gray-300 hover:border-black">
                  <span>👍</span>
                  HELPFUL ({review.helpfulCount || 0})
                </button>
                
                {review.isRecommended && (
                  <span className="px-3 py-1 bg-yellow-500 text-black rounded-2xl text-sm font-black border-2 border-black">
                    ✅ RECOMMENDED
                  </span>
                )}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}