// ProductViewClient.tsx - Improved Layout with Better Images
'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shield, Truck, RotateCcw, Heart, Sparkles, Tag, Crown, Zap, ShoppingBag, Star, Award, Clock } from 'lucide-react';
import ZoomImageWrapper from './ZoomImageWrapper';
import QtyPicker from '@/components/product/QtyPicker';
import AddToCartButton from '@/components/product/AddToCartButton';
import { useCart } from '@/hooks/useCart';
import ReviewsSection from './ReviewsSection';
import { useTransition } from 'react';
import { addWishlistItem, removeWishlistItem } from '../../profile/_actions/wishlist.actions';

function formatMAD(n: number) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2
  }).format(n);
}

function applyDiscount(val: number, pct?: number | null) {
  if (!pct || pct <= 0) return val;
  return Math.max(0, Number((val * (100 - pct) / 100).toFixed(2)));
}

export default function ProductViewClient({ product }: { product: any }) {
  const { add, inCartQty } = useCart();
  const [variantIdx, setVariantIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(-1);
  const [qty, setQty] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [pending, start] = useTransition();
  

  // Auto-select size if only one size exists
  useEffect(() => {
    const currentVariant = product.variants?.[variantIdx];
    if (currentVariant?.sizes?.length === 1) {
      setSelectedSizeIdx(0);
    } else {
      setSelectedSizeIdx(-1);
    }
  }, [variantIdx, product.variants]);

async function toggleWishlist() {
  const variant = product.variants?.[variantIdx];
  if (!variant || !variant.id) return alert('Select a variant first');

  start(async () => {
    try {
      if (isWishlisted) {
        await removeWishlistItem(product.id, variant.id);
        setIsWishlisted(false);
      } else {
        await addWishlistItem(product.id, variant.id);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update wishlist');
    }
  });
}
  
  const [isImageLoading, setIsImageLoading] = useState(true);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const variants = product.variants || [];
  const variant = variants[variantIdx] || {};
  const gallery = (variant.images || []).sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const prices = useMemo(() => {
    const arr = (variant.sizes || []).map((s: any) => applyDiscount(Number(s.priceMAD), s.discountPercent));
    if (!arr.length) return { min: null as number | null, max: null as number | null };
    return { min: Math.min(...arr), max: Math.max(...arr) };
  }, [variant]);

  const selectedSize = selectedSizeIdx >= 0 ? variant.sizes[selectedSizeIdx] : null;
  const base = selectedSize ? Number(selectedSize.priceMAD) : null;
  const final = selectedSize ? applyDiscount(base!, selectedSize.discountPercent) : null;
  const maxStock = selectedSize ? Number(selectedSize.stockQty || 0) : 0;
  const selectedSizeId = selectedSize?.id as string | undefined;
  const alreadyQty = selectedSizeId ? inCartQty(selectedSizeId) : 0;
  const maxAddable = Math.max(0, (maxStock || 0) - (alreadyQty || 0));

  // Brand features matching hero theme
  const brandFeatures = [
    { icon: Truck, text: "Free Shipping", description: "Over 500 MAD" },
    { icon: Clock, text: "24/7 Support", description: "Always here to help" },
    { icon: Award, text: "Premium Quality", description: "Handpicked materials" }
  ];

  // Auto-rotate images with hover control
  useEffect(() => {
    if (gallery.length <= 1) return;
    
    const startAutoPlay = () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        if (!isHoveringImage) {
          setActiveImageIdx((prev) => (prev + 1) % gallery.length);
        }
      }, 5000);
    };

    startAutoPlay();
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [gallery.length, isHoveringImage]);

  function handleAdd() {
    if (!selectedSize || maxAddable <= 0) return;
    const addQty = Math.max(1, Math.min(qty, maxAddable));
    const item = {
      productId: product.id,
      productSlug: product.slug,
      variantId: variant.id,
      variantTitle: variant.title,
      variantName: variant.name,
      variantStyleImg: variant.variantStyleImg || (variant.images?.[0]?.url ?? null),
      variantImage: (variant.images?.[0]?.url ?? null),
      variantSizeId: selectedSize.id,
      sizeLabel: selectedSize.size,
      sku: selectedSize.sku,
      unitPriceMAD: Number(base),
      discountPercent: selectedSize.discountPercent ?? null,
      finalUnitPriceMAD: Number(final),
      maxStock: Number(selectedSize.stockQty),
      qty: addQty,
    };
    add(item);
    const rest = maxAddable - addQty;
    setQty(rest > 0 ? 1 : 1);
  }

  const nextImage = () => {
    setActiveImageIdx((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = () => {
    setActiveImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const hasDiscount = selectedSize?.discountPercent && selectedSize.discountPercent > 0;

  return (
    <div className="max-w-[1350px] mx-auto">
      {/* Premium Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="hover:text-black transition-colors cursor-pointer">Home</span>
          <ChevronRight className="w-4 h-4" />
          {product.categories?.map((pc: any, index: number) => (
            <span key={pc.category?.id} className="flex items-center gap-2">
              <span className="hover:text-black transition-colors cursor-pointer">
                {pc.category?.name}
              </span>
              {index < product.categories.length - 1 && <ChevronRight className="w-4 h-4" />}
            </span>
          ))}
          <ChevronRight className="w-4 h-4" />
          <span className="text-black font-black">{variant.title || product.slug}</span>
        </div>
      </motion.nav>

      {/* Main Product Section - Two Columns */}
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery Column */}
        <div className="space-y-6">
          {/* Main Image Container */}
          <motion.div
            ref={imageContainerRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative bg-white rounded-3xl shadow-2xl shadow-black/10 border-4 border-black overflow-hidden group min-h-[600px] flex items-center justify-center"
            onMouseEnter={() => setIsHoveringImage(true)}
            onMouseLeave={() => setIsHoveringImage(false)}
          >
            {gallery.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImageIdx}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="w-full h-full flex items-center justify-center "
                    onLoadStart={() => setIsImageLoading(true)}
                    onLoad={() => setIsImageLoading(false)}
                  >
                    <ZoomImageWrapper src={gallery[activeImageIdx].url} alt={variant.title || product.slug} />
                  </motion.div>
                </AnimatePresence>

                {/* Loading Overlay */}
                <AnimatePresence>
                  {isImageLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/10 flex items-center justify-center z-10"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Arrows */}
                {gallery.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.95)" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl shadow-black/40 border-2 border-yellow-500 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.95)" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl shadow-black/40 border-2 border-yellow-500 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </motion.button>
                  </>
                )}

                {/* Image Counter */}
                {gallery.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-4 left-4 px-3 py-2 bg-black/70 backdrop-blur-sm rounded-2xl text-white text-sm font-bold border border-yellow-500/30 z-20"
                  >
                    {activeImageIdx + 1} / {gallery.length}
                  </motion.div>
                )}

                {/* Wishlist Button */}
         <motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={toggleWishlist}
  disabled={pending}
  className={`absolute top-4 right-4 w-12 h-12 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl border-2 transition-all duration-500 z-20 ${
    isWishlisted
      ? 'bg-red-500 text-white border-red-600 shadow-red-500/40'
      : 'bg-black/80 text-white border-yellow-500 hover:bg-black shadow-black/40'
  }`}
>
  <motion.div
    animate={isWishlisted ? { scale: [1, 1.2, 1] } : { scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
  </motion.div>
</motion.button>


                {/* Premium Badge */}
                {hasDiscount && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                    className="absolute bottom-4 left-4 px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-2xl font-black shadow-lg shadow-red-500/40 border-2 border-white flex items-center gap-2 z-20"
                  >
                    <Tag className="w-4 h-4" />
                    SALE
                  </motion.div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-300 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No Image Available</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Thumbnail Strip */}
          {gallery.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              onMouseEnter={() => setIsHoveringImage(true)}
              onMouseLeave={() => setIsHoveringImage(false)}
            >
              {gallery.map((img: any, index: number) => (
                <motion.button
                  key={img.id || index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveImageIdx(index)}
                  className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-3 transition-all duration-300 relative group ${
                    activeImageIdx === index
                      ? 'border-yellow-500 scale-105 shadow-lg shadow-yellow-500/30'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {/* High-quality thumbnail with object-contain */}
                  <div className="w-full h-full flex items-center justify-center bg-white ">
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-fill transition-transform duration-300 group-hover:scale-110 p-1 rounded-lg"
                      loading="eager"
                    />
                  </div>
                  
                  {/* Active indicator */}
                  {activeImageIdx === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-3 h-3 bg-yellow-500 rounded-full ring-2 ring-white"
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Product Info Column */}
        <div className="space-y-8">
          {/* Header Section with Smaller Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Categories */}
            <div className="flex items-center gap-3 flex-wrap">
              {product.categories?.map((pc: any, index: number) => (
                <motion.span
                  key={pc.category?.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="px-4 py-2 bg-black text-white rounded-2xl text-sm font-black border-2 border-yellow-500 shadow-lg"
                >
                  {pc.category?.name}
                </motion.span>
              ))}
            </div>
            
            {/* Smaller, More Reasonable Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl lg:text-4xl font-black text-black leading-tight"
            >
              {variant.title || product.slug}
            </motion.h1>
            
            {/* Description */}
            {variant.shortDescription && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-gray-800 leading-relaxed font-medium"
              >
                {variant.shortDescription}
              </motion.p>
            )}
          </motion.div>

          {/* Price Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {selectedSize ? (
              <div className="flex items-center gap-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-black text-black">
                    {formatMAD(final!)}
                  </span>
                  {selectedSize.discountPercent && selectedSize.discountPercent > 0 && (
                    <>
                      <span className="text-xl text-gray-600 line-through">
                        {formatMAD(base!)}
                      </span>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-2xl text-sm font-black border-2 border-white shadow-lg flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        -{selectedSize.discountPercent}% OFF
                      </motion.span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-black text-black"
              >
                {prices.min != null && prices.max != null ? (
                  prices.min === prices.max ? (
                    formatMAD(prices.min)
                  ) : (
                    <div className="flex items-baseline gap-3">
                      <span>{formatMAD(prices.min)}</span>
                      <span className="text-gray-500">-</span>
                      <span>{formatMAD(prices.max)}</span>
                    </div>
                  )
                ) : (
                  <span className="text-gray-600 text-lg">Select size to see price</span>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Style Selection */}
          {variants.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-black flex items-center gap-3">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Select Style
                </h3>
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-bold">
                  {variantIdx + 1} of {variants.length}
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {variants.map((v: any, idx: number) => {
                  const thumb = v.variantStyleImg || v.images?.[0]?.url;
                  return (
                    <motion.button
                      key={v.id || idx}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setVariantIdx(idx); setActiveImageIdx(0); }}
                      className={`flex flex-col items-center p-4 rounded-3xl border-3 transition-all duration-300 min-w-[120px] ${
                        idx === variantIdx
                          ? 'border-yellow-500 bg-yellow-50 shadow-lg shadow-yellow-500/20'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden mb-3 shadow-md border-2 border-gray-300 bg-white flex items-center justify-center">
                        {thumb ? (
                          <img 
                            src={thumb} 
                            className="w-full h-full object-contain transition-transform duration-300 hover:scale-110 p-1" 
                            alt={v.name} 
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <span className={`text-sm font-black ${
                        idx === variantIdx 
                          ? 'text-black' 
                          : 'text-gray-700'
                      }`}>
                        {v.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Size Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-black">Select Size</h3>
              <button className="text-sm text-black hover:text-gray-700 underline font-bold transition-colors">
                Size Guide
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {(variant.sizes || []).map((s: any, i: number) => {
                const disabled = s.stockQty <= 0;
                return (
                  <motion.button
                    key={s.id || i}
                    whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -2 }}
                    whileTap={{ scale: disabled ? 1 : 0.95 }}
                    onClick={() => setSelectedSizeIdx(i)}
                    disabled={disabled}
                    className={`p-4 rounded-2xl border-3 text-center transition-all duration-300 relative overflow-hidden ${
                      selectedSizeIdx === i
                        ? 'border-yellow-500 bg-black text-white shadow-2xl shadow-yellow-500/30'
                        : disabled
                        ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 bg-white hover:border-yellow-400 hover:shadow-lg'
                    }`}
                  >
                    <span className={`text-sm font-black ${
                      selectedSizeIdx === i ? 'text-white' : 'text-black'
                    }`}>
                      {s.size}
                    </span>
                    
                    {/* Stock Indicator */}
                    {!disabled && s.stockQty < 10 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-black border border-white">
                        {s.stockQty}
                      </div>
                    )}
                    
                    {/* Disabled Overlay */}
                    {disabled && (
                      <>
                        <div className="absolute inset-0 bg-gray-400/20 rounded-2xl" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-gray-400 rotate-45" />
                        </div>
                      </>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Add to Cart Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <QtyPicker
                value={qty}
                setValue={(n) => {
                  const clamped = Math.max(1, Math.min(n, Math.max(1, maxAddable || 1)));
                  setQty(clamped);
                }}
                max={Math.max(1, maxAddable || 1)}
              />
              <AddToCartButton onClick={handleAdd} disabled={!selectedSize || maxAddable <= 0} alreadyQty={alreadyQty} />
            </div>

            {selectedSize && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-6 text-sm text-gray-700 bg-gray-100 rounded-2xl p-4 border border-gray-300"
              >
                {alreadyQty > 0 && (
                  <span className="flex items-center gap-2 font-bold">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    In cart: <strong className="text-black">{alreadyQty}</strong>
                  </span>
                )}
                <span className="flex items-center gap-2 font-bold">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Available: <strong className="text-black">{maxStock}</strong>
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Brand Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-8 border-t border-gray-300"
          >
            {brandFeatures.map((feature, index) => (
              <motion.div
                key={feature.text}
                whileHover={{ scale: 1.02, y: -2 }}
                className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-300 shadow-lg"
              >
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center border-2 border-black">
                  <feature.icon className="w-4 h-4 text-black" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-sm">{feature.text}</div>
                  <div className="text-xs text-gray-600">{feature.description}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Full Width Content Section */}
      {variant.contentHtml && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <div className="bg-white rounded-3xl shadow-2xl border-4 border-black p-8 lg:p-12">
            <h2 className="text-2xl lg:text-3xl font-black text-black mb-8 text-center">
              Product Details
            </h2>
            <div 
              className="prose prose-lg max-w-none prose-headings:font-black prose-a:text-black prose-strong:text-black prose-img:rounded-2xl prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: variant.contentHtml }}
            />
          </div>
        </motion.section>
      )}

      {/* Reviews Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-3xl shadow-2xl border-4 border-black p-8 lg:p-12"
      >
        <ReviewsSection
          productId={product.id}
          variants={product.variants.map((v: any) => ({
            id: v.id,
            title: v.title,
            name: v.name,
            sizes: v.sizes.map((s: any) => ({ id: s.id, size: s.size, sku: s.sku }))
          }))}
        />
      </motion.section>
    </div>
  );
}