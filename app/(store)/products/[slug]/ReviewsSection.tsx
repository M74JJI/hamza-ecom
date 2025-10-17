// ReviewsSection.tsx - Updated with Hero Theme
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageCircle, TrendingUp, Award, Users, Filter, Crown, Sparkles } from 'lucide-react';
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
    if (effectRunRef.current) return;
    effectRunRef.current = true;
    if (fetchedRef.current === productId) return;
    fetchedRef.current = productId;

    const controller = new AbortController();
    let cancelled = false;

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

        if (!cancelled) {
          setSum(summaryJson);
          setList(listJson);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error('[ReviewsSection] fetch error', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [productId]);

  const filteredReviews = activeFilter === 'all' 
    ? list.reviews 
    : list.reviews.filter((review: any) => review.rating === activeFilter);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mt-20 py-16 bg-gradient-to-b from-amber-50 to-orange-50"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-2xl text-sm font-black border-2 border-yellow-500 shadow-lg mb-4">
            <MessageCircle className="w-4 h-4" />
            CUSTOMER REVIEWS
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-black mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-800 max-w-2xl mx-auto font-medium">
            Discover why thousands of customers love our premium products
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* Left Sidebar - Stats & Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Overall Rating Card */}
            <ReviewStats avg={sum.avg} total={sum.total} buckets={sum.buckets} />
            
            {/* Review Filters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-black"
            >
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-black" />
                <h3 className="font-black text-black text-lg">FILTER REVIEWS</h3>
              </div>
              
              <div className="space-y-2">
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveFilter(filter.value as any)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 border-2 ${
                      activeFilter === filter.value
                        ? 'bg-black text-white border-yellow-500 shadow-lg shadow-yellow-500/30'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="font-bold">{filter.label}</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-black ${
                      activeFilter === filter.value
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-200 text-gray-600'
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
              className="bg-gradient-to-r from-yellow-500 to-red-500 rounded-3xl p-6 text-white shadow-2xl border-4 border-black"
            >
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6" />
                <h3 className="font-black text-lg">VERIFIED REVIEWS</h3>
              </div>
              <p className="text-yellow-100 text-sm mb-4 font-medium">
                Every review is from a verified purchase. We never fake customer feedback.
              </p>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{sum.total}+ VERIFIED</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>98% POSITIVE</span>
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
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-black">
                  CUSTOMER REVIEWS
                  <span className="ml-2 text-gray-600 text-lg">
                    ({filteredReviews.length})
                  </span>
                </h3>
                
                {activeFilter !== 'all' && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setActiveFilter('all')}
                    className="px-4 py-2 text-sm bg-gray-200 rounded-2xl font-bold border-2 border-gray-300 hover:border-black transition-all duration-300"
                  >
                    CLEAR FILTER
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
                        className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-black animate-pulse"
                      >
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-2xl" />
                          <div className="flex-1 space-y-3">
                            <div className="h-4 bg-gray-300 rounded w-1/4" />
                            <div className="h-3 bg-gray-300 rounded w-1/6" />
                            <div className="h-3 bg-gray-300 rounded w-full" />
                            <div className="h-3 bg-gray-300 rounded w-2/3" />
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
                    className="text-center py-12"
                  >
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-2xl flex items-center justify-center border-4 border-black">
                      <MessageCircle className="w-10 h-10 text-gray-600" />
                    </div>
                    <h4 className="text-xl font-black text-black mb-2">
                      NO REVIEWS FOUND
                    </h4>
                    <p className="text-gray-700 font-medium">
                      {activeFilter === 'all' 
                        ? "Be the first to review this product!" 
                        : `No ${activeFilter}-star reviews found.`}
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