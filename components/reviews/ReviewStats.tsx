'use client';
import { motion } from 'framer-motion';
import { Star, TrendingUp } from 'lucide-react';
import ReviewStars from './ReviewStars';

export default function ReviewStats({ avg, total, buckets }: { avg: number; total: number; buckets: { star: number; count: number; pct: number }[] }) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'from-emerald-500 to-emerald-600';
    if (rating >= 4.0) return 'from-blue-500 to-blue-600';
    if (rating >= 3.0) return 'from-amber-500 to-amber-600';
    return 'from-rose-500 to-rose-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-8 border border-gray-200"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-light text-black mb-6">Customer Rating</h3>
        
        {/* Main Rating Circle */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className={`w-32 h-32 rounded-full bg-gradient-to-br ${getRatingColor(avg)} flex items-center justify-center shadow-lg`}
          >
            <div className="text-center text-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-light mb-1"
              >
                {avg.toFixed(1)}
              </motion.div>
              <ReviewStars value={avg} size={18} />
            </div>
          </motion.div>
        </div>

        <div className="text-gray-600 font-light">
          Based on <span className="text-black font-normal">{total}</span> verified reviews
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-6">
        <h4 className="font-light text-black text-center text-sm uppercase tracking-wider">Rating Breakdown</h4>
        <div className="space-y-4">
          {buckets.slice().reverse().map((bucket, index) => (
            <motion.div
              key={bucket.star}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2 w-14">
                <span className="text-sm font-light text-black">{bucket.star}</span>
                <Star className="w-4 h-4 fill-gray-400 text-gray-400" />
              </div>
              
              <div className="flex-1">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bucket.pct}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-gray-800 to-gray-600 rounded-full"
                  />
                </div>
              </div>
              
              <div className="w-12 text-right">
                <span className="text-sm font-light text-black">
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
          className="mt-6 p-4 bg-gray-50 rounded-xl text-center border border-gray-200"
        >
          <div className="flex items-center justify-center gap-3 text-gray-700 font-light">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">
              {Math.round((buckets.filter(b => b.star >= 4).reduce((sum, b) => sum + b.count, 0) / total) * 100)}%
              of customers recommend this product
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}