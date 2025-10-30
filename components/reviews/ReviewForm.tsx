'use client';
import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Image, Smile, Plus, Minus, ChevronDown } from 'lucide-react';

export default function ReviewForm({ productId, variants }: { productId: string; variants: any[] }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [variantId, setVariantId] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(undefined);
    start(async () => {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment, chosenVariantId: variantId || null, chosenSize: size || null, quantity: qty || null })
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data?.error || 'Failed to submit review'); return; }
      setMsg('Thank you for your review!');
      setComment(''); setQty(1); setRating(5);
      setIsExpanded(false);
    });
  }

  const displayRating = hoverRating || rating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
    >
      {/* Minimal Header */}
      <div className="p-8 border-b border-gray-200">
        <h3 className="text-2xl font-light text-black mb-2">Share Your Experience</h3>
        <p className="text-gray-600 font-light">Your review helps others make informed decisions</p>
      </div>

      <form onSubmit={submit} className="p-8 space-y-8">
        {/* Rating Section */}
        <motion.div
          initial={false}
          animate={isExpanded ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-8">
            {/* Star Rating */}
            <div className="text-center">
              <label className="block text-sm font-light text-black mb-6">
                How would you rate this product?
              </label>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="relative"
                  >
                    <Star
                      className={`w-10 h-10 transition-all duration-200 ${
                        displayRating >= star
                          ? 'fill-gray-800 text-gray-800'
                          : 'fill-gray-200 text-gray-300'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              
              {/* Rating Labels */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayRating}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-lg font-light text-gray-700"
                >
                  {displayRating === 5 && 'Excellent'}
                  {displayRating === 4 && 'Very Good'}
                  {displayRating === 3 && 'Good'}
                  {displayRating === 2 && 'Fair'}
                  {displayRating === 1 && 'Poor'}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {/* Variant Selection - Premium Custom Select */}
              <div className="space-y-3">
                <label className="text-sm font-light text-black">
                  Product Variant
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 font-light cursor-pointer pr-10"
                    value={variantId}
                    onChange={e => setVariantId(e.target.value)}
                  >
                    <option value="">Select variant</option>
                    {variants.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.title}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Size Input */}
              <div className="space-y-3">
                <label className="text-sm font-light text-black">
                  Size
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 font-light placeholder-gray-400"
                  value={size}
                  onChange={e => setSize(e.target.value)}
                  placeholder="M, L, XL"
                />
              </div>

              {/* Quantity Input - Premium Stepper */}
              <div className="space-y-3">
                <label className="text-sm font-light text-black">
                  Quantity
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="flex items-center justify-center w-12 h-12 text-gray-600 hover:text-black hover:bg-gray-50 transition-all duration-200 border-r border-gray-300"
                    disabled={qty <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  
                  <div className="flex-1 text-center">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      className="w-full bg-transparent text-center text-black py-3 focus:outline-none font-light text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={qty}
                      onChange={e => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 1 && value <= 99) {
                          setQty(value);
                        }
                      }}
                    />
                  </div>
                  
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQty(Math.min(99, qty + 1))}
                    className="flex items-center justify-center w-12 h-12 text-gray-600 hover:text-black hover:bg-gray-50 transition-all duration-200 border-l border-gray-300"
                    disabled={qty >= 99}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Comment Textarea */}
            <div className="space-y-3">
              <label className="text-sm font-light text-black">
                Share your experience
              </label>
              <div className="relative">
                <textarea
                  className="w-full min-h-32 bg-white border border-gray-300 rounded-lg px-4 py-4 text-black focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-none transition-all duration-200 font-light placeholder-gray-400 leading-relaxed"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="What did you love about this product? How does it fit? Any issues?"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-1">
                  <button 
                    type="button" 
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded hover:bg-gray-100"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <button 
                    type="button" 
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded hover:bg-gray-100"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Character Counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: comment.length > 0 ? 1 : 0 }}
              className="text-right"
            >
              <span className={`text-sm font-light ${
                comment.length > 500 ? 'text-rose-500' : 'text-gray-500'
              }`}>
                {comment.length}/500
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          {!isExpanded ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsExpanded(true)}
              className="px-8 py-3.5 bg-black text-white rounded-lg font-light hover:bg-gray-800 transition-all duration-200 flex items-center gap-3 shadow-sm"
            >
              <Star className="w-4 h-4" />
              Write a Review
            </motion.button>
          ) : (
            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsExpanded(false)}
                className="px-6 py-3.5 border border-gray-300 text-gray-700 rounded-lg font-light hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={pending || !comment.trim()}
                whileHover={{ scale: pending ? 1 : 1.02, y: pending ? 0 : -1 }}
                whileTap={{ scale: pending ? 1 : 0.98 }}
                className="px-8 py-3.5 bg-black text-white rounded-lg font-light hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3 shadow-sm"
              >
                {pending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>

        {/* Messages */}
        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`p-4 rounded-lg text-center font-light border ${
                msg.includes('Thank you') 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {msg}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}