'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageCircle, TrendingUp, Award, Users, Filter } from 'lucide-react';
import ReviewStats from '@/components/reviews/ReviewStats';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewList from '@/components/reviews/ReviewList';

type Summary = { total: number; avg: number; buckets: { star: number; count: number; pct: number }[] };
type ListResp = { reviews: any[]; count: number };

export default function ReviewsSection({ productId, variants }: { productId: string; variants: any[] }) {
  const [sum, setSum] = useState<Summary>({ total: 0, avg: 0, buckets: [] });
  const [list, setList] = useState<ListResp>({ reviews: [], count: 0 });
  const [activeFilter, setActiveFilter] = useState<'all' | number>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchedRef = useRef<string | null>(null);
  const effectRunRef = useRef(false);

useEffect(() => {
  if (!productId) return;

  const controller = new AbortController();

  (async () => {
    setIsLoading(true);
    try {
      const [summaryRes, listRes] = await Promise.all([
        fetch(`/api/reviews/${productId}/summary`, {
          cache: 'no-store',
          signal: controller.signal,
        }),
        fetch(`/api/reviews/${productId}`, {
          cache: 'no-store',
          signal: controller.signal,
        }),
      ]);

      if (!summaryRes.ok || !listRes.ok) throw new Error('Fetch failed');

      const [summaryJson, listJson] = await Promise.all([
        summaryRes.json(),
        listRes.json(),
      ]);

      setSum(summaryJson);
      setList(listJson);
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error('[ReviewsSection] fetch error', err);
    } finally {
      setIsLoading(false);
    }
  })();

  return () => controller.abort();
}, [productId]);

  const filteredReviews = activeFilter === 'all' 
    ? list.reviews 
    : list.reviews.filter((review: any) => review.rating === activeFilter);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-20 bg-white"
      id="reviews"
    >
      <div className="container mx-auto px-4">
        {/* Elegant Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-sm font-light mb-6 border border-gray-200"
          >
            <MessageCircle className="w-4 h-4" />
            CUSTOMER REVIEWS
          </motion.div>
          <h2 className="text-5xl lg:text-6xl font-light text-black mb-6 tracking-tight">
            Customer Voices
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Discover authentic experiences from our valued customers
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          {/* Left Sidebar - Stats & Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4 space-y-8"
          >
            {/* Overall Rating Card */}
            <ReviewStats avg={sum.avg} total={sum.total} buckets={sum.buckets} />
            
            {/* Review Filters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-light text-gray-900 text-lg">Filter Reviews</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: 'All Reviews', value: 'all', count: list.reviews.length },
                  { label: '5 Stars', value: 5, count: sum.buckets.find(b => b.star === 5)?.count || 0 },
                  { label: '4 Stars', value: 4, count: sum.buckets.find(b => b.star === 4)?.count || 0 },
                  { label: '3 Stars', value: 3, count: sum.buckets.find(b => b.star === 3)?.count || 0 },
                  { label: '2 Stars', value: 2, count: sum.buckets.find(b => b.star === 2)?.count || 0 },
                  { label: '1 Star', value: 1, count: sum.buckets.find(b => b.star === 1)?.count || 0 },
                ].map((filter) => (
                  <motion.button
                    key={filter.value}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveFilter(filter.value as any)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 border ${
                      activeFilter === filter.value
                        ? 'bg-black text-white border-gray-700 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:shadow-md'
                    }`}
                  >
                    <span className="font-light">{filter.label}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-light ${
                      activeFilter === filter.value
                        ? 'bg-white text-black'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {filter.count}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 text-gray-900 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-gray-700" />
                <h3 className="font-light text-lg">Verified Reviews</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4 font-light leading-relaxed">
                Every review comes from verified purchases. Authenticity guaranteed.
              </p>
              <div className="flex items-center gap-6 text-xs font-light">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span>{sum.total}+ Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <span>98% Positive</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Form & Reviews */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 space-y-8"
          >
            {/* Review Form */}
            <ReviewForm productId={productId} variants={variants} />

            {/* Reviews List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-light text-black">
                    Customer Experiences
                  </h3>
                  <p className="text-gray-600 font-light mt-1">
                    {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
                
                {activeFilter !== 'all' && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setActiveFilter('all')}
                    className="px-4 py-2 text-sm bg-gray-100 rounded-xl font-light border border-gray-300 hover:border-gray-400 transition-all duration-300"
                  >
                    Clear Filter
                  </motion.button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid gap-6"
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse"
                      >
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                          <div className="flex-1 space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/6" />
                            <div className="h-3 bg-gray-200 rounded w-full" />
                            <div className="h-3 bg-gray-200 rounded w-2/3" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : filteredReviews.length > 0 ? (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <ReviewList items={filteredReviews} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-300">
                      <MessageCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-light text-black mb-3">
                      No Reviews Found
                    </h4>
                    <p className="text-gray-600 font-light max-w-md mx-auto leading-relaxed">
                      {activeFilter === 'all' 
                        ? "Be the first to share your experience with this product" 
                        : `No ${activeFilter}-star reviews match your filter.`}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}