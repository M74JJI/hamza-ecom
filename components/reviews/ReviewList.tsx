'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Calendar, CheckCircle, Package } from 'lucide-react';
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
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-600 rounded-xl flex items-center justify-center text-white font-light text-lg">
                      {review.user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-light text-black text-lg">
                        {review.user?.name || 'Anonymous'}
                      </h4>
                      {review.isVerified && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-light border border-gray-300">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm font-light">
                      <Calendar className="w-4 h-4" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <ReviewStars value={review.rating} size={18} />
                  <div className="text-sm text-gray-600 font-light mt-1">
                    {review.rating}.0 out of 5
                  </div>
                </div>
              </div>

              {/* Product Info */}
              {(review.chosenVariant || review.chosenSize) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6 border border-gray-200"
                >
                  {review.chosenVariant?.variantStyleImg && (
                    <Image 
                      src={review.chosenVariant.variantStyleImg} 
                      alt="" 
                      width={48} 
                      height={48} 
                      className="rounded-lg object-cover border border-gray-300"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 text-sm font-light">
                      {review.chosenVariant?.title && (
                        <span className="text-black">
                          {review.chosenVariant.title}
                        </span>
                      )}
                      {review.chosenSize && (
                        <span className="text-gray-600">
                          Size: <strong className="text-black">{review.chosenSize}</strong>
                        </span>
                      )}
                      {typeof review.quantity === 'number' && (
                        <span className="text-gray-600">
                          Qty: <strong className="text-black">{review.quantity}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                  <Package className="w-4 h-4 text-gray-500" />
                </motion.div>
              )}

              {/* Review Content */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-700 leading-relaxed font-light text-lg mb-6"
              >
                {review.comment}
              </motion.p>

              {/* Helpful Metrics */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 pt-6 border-t border-gray-200"
              >
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white hover:bg-gray-50 rounded-lg transition-colors text-sm font-light border border-gray-300 hover:border-gray-400">
                  <span>👍</span>
                  Helpful ({review.helpfulCount || 0})
                </button>
                
                {review.isRecommended && (
                  <span className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-light border border-gray-300">
                    ✅ Recommended
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