// ReviewStats.tsx - Updated with Hero Theme
'use client';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Award, Crown } from 'lucide-react';
import ReviewStars from './ReviewStars';

export default function ReviewStats({ avg, total, buckets }: { avg: number; total: number; buckets: { star: number; count: number; pct: number }[] }) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'from-green-500 to-emerald-600';
    if (rating >= 4.0) return 'from-yellow-500 to-orange-500';
    if (rating >= 3.0) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="w-6 h-6 text-yellow-500" />
          <h3 className="text-2xl font-black text-black">CUSTOMER RATING</h3>
        </div>
        
        {/* Main Rating Circle */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className={`w-32 h-32 rounded-full bg-gradient-to-br ${getRatingColor(avg)} flex items-center justify-center shadow-2xl border-4 border-white`}
          >
            <div className="text-center text-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-black"
              >
                {avg.toFixed(1)}
              </motion.div>
              <ReviewStars value={avg} size={20} />
            </div>
          </motion.div>
        </div>

        <div className="text-gray-700 font-bold">
          <span className="text-black">{total}</span> VERIFIED REVIEWS
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-4">
        <h4 className="font-black text-black text-center">RATING BREAKDOWN</h4>
        <div className="space-y-3">
          {buckets.slice().reverse().map((bucket, index) => (
            <motion.div
              key={bucket.star}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm font-black text-black">{bucket.star}</span>
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              </div>
              
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bucket.pct}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full"
                  />
                </div>
              </div>
              
              <div className="w-10 text-right">
                <span className="text-sm font-black text-black">
                  {bucket.count}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendation Rate */}
      {avg >= 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 p-4 bg-yellow-100 rounded-2xl text-center border-2 border-yellow-500"
        >
          <div className="flex items-center justify-center gap-2 text-black font-black">
            <TrendingUp className="w-4 h-4" />
            <span>
              {Math.round((buckets.filter(b => b.star >= 4).reduce((sum, b) => sum + b.count, 0) / total) * 100)}%
            </span>
            <span className="text-sm">RECOMMEND THIS PRODUCT</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}