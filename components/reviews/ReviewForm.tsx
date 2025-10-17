// ReviewForm.tsx - Updated with Hero Theme
'use client';
import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Sparkles, Image, Smile, Award, Crown, Zap } from 'lucide-react';

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
      setMsg('🎉 REVIEW SUBMITTED SUCCESSFULLY!');
      setComment(''); setQty(1); setRating(5);
      setIsExpanded(false);
    });
  }

  const displayRating = hoverRating || rating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl border-4 border-black overflow-hidden"
    >
      {/* Header */}
      <motion.div
        className="bg-black p-6 text-white border-b-4 border-yellow-500"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center border-2 border-white">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-black">SHARE YOUR EXPERIENCE</h3>
            <p className="text-yellow-400 text-sm font-bold">Help other customers make better choices</p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={submit} className="p-6 space-y-6">
        {/* Rating Section */}
        <motion.div
          initial={false}
          animate={isExpanded ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-4">
            {/* Star Rating */}
            <div className="text-center">
              <label className="block text-sm font-black text-black mb-4">
                HOW WOULD YOU RATE THIS PRODUCT?
              </label>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="relative"
                  >
                    <motion.div
                      animate={{
                        scale: displayRating >= star ? [1, 1.2, 1] : 1,
                        rotate: displayRating >= star ? [0, 10, -10, 0] : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Star
                        className={`w-12 h-12 transition-all duration-300 ${
                          displayRating >= star
                            ? 'fill-yellow-500 text-yellow-500 drop-shadow-lg'
                            : 'fill-gray-300 text-gray-300'
                        }`}
                      />
                    </motion.div>
                    
                    {/* Sparkle effect when selected */}
                    <AnimatePresence>
                      {rating === star && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute inset-0"
                        >
                          <Sparkles className="w-12 h-12 text-yellow-300 fill-current" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
              
              {/* Rating Labels */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayRating}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-lg font-black text-black"
                >
                  {displayRating === 5 && 'EXCELLENT! 🌟'}
                  {displayRating === 4 && 'VERY GOOD! 👍'}
                  {displayRating === 3 && 'GOOD! 😊'}
                  {displayRating === 2 && 'FAIR 👎'}
                  {displayRating === 1 && 'POOR ❌'}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-3 gap-4"
            >
              {/* Variant Selection */}
              <div className="space-y-2">
                <label className="text-sm font-black text-black">
                  PRODUCT VARIANT
                </label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  className="w-full bg-gray-100 border-2 border-gray-300 rounded-2xl px-4 py-3 text-black font-bold focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                  value={variantId}
                  onChange={e => setVariantId(e.target.value)}
                >
                  <option value="">Select variant</option>
                  {variants.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                  ))}
                </motion.select>
              </div>

              {/* Size Input */}
              <div className="space-y-2">
                <label className="text-sm font-black text-black">
                  SIZE
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  className="w-full bg-gray-100 border-2 border-gray-300 rounded-2xl px-4 py-3 text-black font-bold focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                  value={size}
                  onChange={e => setSize(e.target.value)}
                  placeholder="e.g., M, L, XL"
                />
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <label className="text-sm font-black text-black">
                  QUANTITY
                </label>
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  className="flex items-center bg-gray-100 border-2 border-gray-300 rounded-2xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-3 text-gray-600 hover:text-black font-bold transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    className="flex-1 bg-transparent text-center text-black font-bold py-3 focus:outline-none"
                    value={qty}
                    onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button
                    type="button"
                    onClick={() => setQty(qty + 1)}
                    className="px-4 py-3 text-gray-600 hover:text-black font-bold transition-colors"
                  >
                    +
                  </button>
                </motion.div>
              </div>
            </motion.div>

            {/* Comment Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-black text-black">
                SHARE YOUR EXPERIENCE
              </label>
              <motion.div
                whileFocus={{ scale: 1.01 }}
                className="relative"
              >
                <textarea
                  className="w-full min-h-32 bg-gray-100 border-2 border-gray-300 rounded-2xl px-4 py-4 text-black font-bold focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none transition-all duration-300"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="What did you love about this product? How does it fit? Any issues?"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2 text-gray-400">
                  <button type="button" className="p-1 hover:text-black transition-colors">
                    <Smile className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1 hover:text-black transition-colors">
                    <Image className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Character Counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: comment.length > 0 ? 1 : 0 }}
              className="text-right"
            >
              <span className={`text-sm font-bold ${
                comment.length > 500 ? 'text-red-500' : 'text-gray-600'
              }`}>
                {comment.length}/500
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-300">
          {!isExpanded ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsExpanded(true)}
              className="px-6 py-3 bg-black text-white rounded-2xl font-black border-2 border-yellow-500 shadow-lg hover:bg-gray-900 transition-all duration-300 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              WRITE A REVIEW
            </motion.button>
          ) : (
            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsExpanded(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:border-black transition-all duration-300"
              >
                CANCEL
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={pending || !comment.trim()}
                whileHover={{ scale: pending ? 1 : 1.02 }}
                whileTap={{ scale: pending ? 1 : 0.98 }}
                className="px-8 py-3 bg-black text-white rounded-2xl font-black border-2 border-yellow-500 shadow-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
              >
                {pending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    SUBMITTING...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    SUBMIT REVIEW
                  </>
                )}
              </motion.button>
            </div>
          )}

          {/* Review Benefits */}
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-right text-sm text-gray-700 font-bold"
            >
              <div>✓ HELP OTHER SHOPPERS</div>
              <div>✓ EARN LOYALTY POINTS</div>
            </motion.div>
          )}
        </div>

        {/* Messages */}
        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-2xl text-center font-black border-2 ${
                msg.includes('🎉') 
                  ? 'bg-green-100 text-green-700 border-green-500'
                  : 'bg-red-100 text-red-700 border-red-500'
              }`}
            >
              {msg}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Floating decoration */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-4 right-4 opacity-10"
      >
        <Sparkles className="w-16 h-16 text-yellow-500" />
      </motion.div>
    </motion.div>
  );
}