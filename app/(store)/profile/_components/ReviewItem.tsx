// app/(store)/profile/_components/ReviewItem.tsx
'use client';
import { useState, useTransition } from 'react';
import { updateReview, deleteReview } from '../_actions/review.actions';
import { Star, Save, Trash2, Edit3, Calendar, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function ReviewItem({ review }: { review: any }){
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ 
    rating: review.rating, 
    comment: review.comment 
  });

  function StarRow({ interactive = false }: { interactive?: boolean }) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          interactive ? (
            <motion.button
              key={n}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setForm({...form, rating: n})}
              className={`transition-colors ${
                n <= form.rating 
                  ? 'text-yellow-500' 
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            >
              <Star className="w-6 h-6 fill-current" />
            </motion.button>
          ) : (
            <Star
              key={n}
              className={`w-5 h-5 ${
                n <= review.rating 
                  ? 'text-yellow-500 fill-current' 
                  : 'text-gray-300'
              }`}
            />
          )
        ))}
      </div>
    );
  }

  const timeAgo = (date: string) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white/80 backdrop-blur-2xl rounded-2xl border-2 border-gray-300 p-6 hover:shadow-xl transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        {/* Review Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <Link 
                  href={`/products/${review.product?.slug}`}
                  className="font-bold text-gray-800 text-lg hover:text-blue-600 transition-colors"
                >
                  {review.product?.title || review.product?.brand || 'Product'}
                </Link>
                <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                  <Calendar className="w-4 h-4" />
                  {timeAgo(review.createdAt)}
                </div>
              </div>
            </div>
            
            {/* Edit Button */}
            {!editing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </motion.button>
            )}
          </div>

          {/* Rating and Comment */}
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Your Rating
                  </label>
                  <StarRow interactive={true} />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Your Review
                  </label>
                  <textarea 
                    value={form.comment} 
                    onChange={e => setForm({...form, comment: e.currentTarget.value})}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                    rows={4}
                    placeholder="Share your experience with this product..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => start(async () => { 
                      await updateReview(review.id, form); 
                      setEditing(false); 
                    })}
                    disabled={pending}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {pending ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="viewing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <StarRow interactive={false} />
                
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>

                {/* Delete Button */}
                <div className="flex justify-end pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => start(async () => { await deleteReview(review.id); })}
                    disabled={pending}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {pending ? 'Deleting...' : 'Delete Review'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}