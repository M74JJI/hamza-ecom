'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Sparkles, Tag, Zap, ShoppingBag, Star, Award, Clock, Truck, Check, Plus, Minus, Shield, RotateCcw, Gem, Crown, Eye, Share2, Bookmark } from 'lucide-react';
import ZoomImageWrapper from './ZoomImageWrapper';
import QtyPicker from '@/components/product/QtyPicker';
import AddToCartButton from '@/components/product/AddToCartButton';
import { useCart } from '@/hooks/useCart';
import ReviewsSection from './ReviewsSection';
import { useTransition } from 'react';
import { isInWishlist, addWishlistItem, removeWishlistItem } from '../../profile/_actions/wishlist.actions';
import Link from 'next/link';

function formatMAD(n: number) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0
  }).format(n);
}

function applyDiscount(val: number, pct?: number | null) {
  if (!pct || pct <= 0) return val;
  return Math.max(0, Number((val * (100 - pct) / 100).toFixed(2)));
}

function StarRating({ rating, reviewCount, size = "md" }: { rating: number; reviewCount: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.div
            key={star}
            whileHover={{ scale: 1.2, y: -1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Star
              className={`${sizeClasses[size]} transition-all duration-300 ${
                star <= rating
                  ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                  : star - 0.5 <= rating
                  ? 'text-amber-400 fill-amber-400 opacity-70'
                  : 'text-gray-300'
              }`}
            />
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className={`${size === 'lg' ? 'text-base' : 'text-sm'} font-semibold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent`}>
          {rating.toFixed(1)}
        </span>
        <div className="w-px h-3 bg-gray-300"></div>
        <span className={`${size === 'lg' ? 'text-sm' : 'text-xs'} text-gray-600 font-medium`}>
          {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </span>
      </div>
    </div>
  );
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 400 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], ["12deg", "-12deg"]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], ["-12deg", "12deg"]), springConfig);

  const handleMouseMove = (event: React.MouseEvent) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - left) / width - 0.5;
    const y = (event.clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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


const orderedSizes = (variant.sizes || []).slice().sort((a: any, b: any) => {
  const order = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  
  const aVal = a.size?.toString().toUpperCase();
  const bVal = b.size?.toString().toUpperCase();

  // both are known textual sizes (S, M, L, etc.)
  const aIndex = order.indexOf(aVal);
  const bIndex = order.indexOf(bVal);
  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;

  // if one is known and other isn't, prioritize known sizes
  if (aIndex !== -1) return -1;
  if (bIndex !== -1) return 1;

  // numeric sizes (like 36, 38)
  const aNum = parseFloat(aVal);
  const bNum = parseFloat(bVal);
  if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;

  // fallback alphabetical
  return aVal.localeCompare(bVal, undefined, { numeric: true });
});


  const luxuryFeatures = [
    { icon: Crown, text: "Luxury Collection", description: "Exclusive designer pieces", color: "from-amber-500 to-yellow-500" },
    { icon: Gem, text: "Premium Materials", description: "Finest quality craftsmanship", color: "from-blue-500 to-cyan-500" },
    { icon: Shield, text: "Authenticity Guarantee", description: "Official luxury retailer", color: "from-emerald-500 to-green-500" },
  ];

  useEffect(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, []);

  function getCategoryPath(category: any): any[] {
    const path: any[] = [];
    let current = category;
    while (current) {
      path.unshift(current);
      current = current.parent;
    }
    return path;
  }

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

  useEffect(() => {
    async function checkWishlist() {
      const variant = product.variants?.[variantIdx];
      if (!variant?.id) return;

      try {
        const res = await isInWishlist(product.id, variant.id);
        setIsWishlisted(res);
      } catch (error) {
        console.error('Failed to fetch wishlist status', error);
      }
    }
    

    checkWishlist();
  }, [variantIdx, product.id]);

  // Mock rating data
  const productRating = product.rating;
  const reviewCount = product._count.reviews;

  return (
 <div className="max-w-[1600px] mx-auto">
  {/* Luxury Breadcrumb - Mobile Responsive */}
  <motion.nav
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-8 sm:mb-16 px-4 sm:px-8"
  >
    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 font-light overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      <motion.span 
        whileHover={{ scale: 1.05, x: 2 }}
        className="hover:text-black cursor-pointer transition-all duration-300 px-2 sm:px-3 py-1 rounded-lg hover:bg-gray-50 whitespace-nowrap"
      >
        Home
      </motion.span>
      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />

      {product.categories?.[0]?.category && (
        <>
          {getCategoryPath(product.categories[0].category).map((cat, idx, arr) => (
            <span key={cat.id} className="flex items-center gap-2 sm:gap-3">
              <motion.span 
                whileHover={{ scale: 1.05, x: 2 }}
                className="hover:text-black cursor-pointer transition-all duration-300 px-2 sm:px-3 py-1 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                {cat.name}
              </motion.span>
              {idx < arr.length - 1 && <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />}
            </span>
          ))}
        </>
      )}

      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
      <span className="text-black font-semibold bg-gray-50 px-2 sm:px-3 py-1 rounded-lg whitespace-nowrap text-xs sm:text-sm">
        {variant.title}
      </span>
    </div>
  </motion.nav>

  {/* Luxury Product Layout - Stack on mobile */}
  <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-32 mb-16 sm:mb-32 px-4 sm:px-8">
    {/* Luxury Image Gallery */}
    <div className="space-y-6 sm:space-y-8">
      {/* Main Image with Luxury Parallax */}
      <motion.div
        ref={imageContainerRef}
        style={{
          rotateX,
          rotateY,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-white rounded-2xl sm:rounded-[2rem] overflow-hidden group border border-gray-200/80 shadow-xl sm:shadow-3xl"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHoveringImage(true)}
        onMouseLeave={() => setIsHoveringImage(false)}
      >
        {gallery.length > 0 ? (
          <>
            <div className={`transition-opacity duration-700 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <ZoomImageWrapper 
                src={gallery[activeImageIdx].url} 
                alt={variant.title || product.slug}
                onLoad={() => setIsImageLoaded(true)}
              />
            </div>

            {/* Luxury Loading Skeleton */}
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-12 sm:w-16 sm:h-16 border-[3px] border-gray-300 border-t-black rounded-full mb-3 sm:mb-4 mx-auto"
                  />
                  <p className="text-gray-400 font-light text-sm sm:text-lg">Loading luxury experience...</p>
                </motion.div>
              </div>
            )}

            {/* Luxury Navigation - Hidden on mobile */}
            {gallery.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.15, backgroundColor: "rgba(0,0,0,0.95)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevImage}
                  className="hidden sm:flex absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-black/90 backdrop-blur-xl rounded-xl sm:rounded-2xl items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 border border-white/20 shadow-lg sm:shadow-3xl"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15, backgroundColor: "rgba(0,0,0,0.95)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextImage}
                  className="hidden sm:flex absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-black/90 backdrop-blur-xl rounded-xl sm:rounded-2xl items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 border border-white/20 shadow-lg sm:shadow-3xl"
                >
                  <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </motion.button>
              </>
            )}

            {/* Luxury Action Buttons */}
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 flex flex-col gap-3 sm:gap-4 z-20">
              {/* Premium Wishlist Button */}
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleWishlist}
                disabled={pending}
                className={`w-10 h-10 sm:w-14 sm:h-14 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-lg sm:shadow-3xl ${
                  isWishlisted
                    ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white border-red-500/50 shadow-red-500/30'
                    : 'bg-white/95 text-gray-600 border-white/60 hover:bg-white hover:border-gray-300 shadow-white/20'
                }`}
              >
                <motion.div
                  animate={isWishlisted ? { scale: [1, 1.4, 1], rotate: [0, 5, -5, 0] } : { scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Heart className={`w-4 h-4 sm:w-6 sm:h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                </motion.div>
              </motion.button>

              {/* Share Button */}
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 sm:w-14 sm:h-14 bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/60 text-gray-600 hover:text-black hover:bg-white hover:border-gray-300 transition-all duration-500 shadow-lg sm:shadow-3xl"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>

            {/* Luxury Discount Badge */}
            {hasDiscount && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
                className="absolute top-4 sm:top-8 left-4 sm:left-8 px-3 py-1.5 sm:px-5 sm:py-2.5 bg-gradient-to-r from-black to-gray-900 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold backdrop-blur-xl border border-white/20 shadow-lg sm:shadow-3xl z-20"
              >
                <Tag className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2 mb-0.5" />
                -{selectedSize.discountPercent}% OFF
              </motion.div>
            )}

            {/* Luxury Image Counter */}
            {gallery.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 px-3 py-1.5 sm:px-5 sm:py-2.5 bg-black/90 backdrop-blur-xl rounded-xl sm:rounded-2xl text-white text-xs sm:text-sm font-medium border border-white/20 shadow-lg sm:shadow-3xl z-20 flex items-center gap-2 sm:gap-3"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{activeImageIdx + 1} / {gallery.length}</span>
              </motion.div>
            )}
          </>
        ) : (
          <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 rounded-2xl sm:rounded-[2rem]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-gray-400"
            >
              <Zap className="w-12 h-12 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-6 opacity-50" />
              <p className="text-sm sm:text-lg font-light">Luxury Image Coming Soon</p>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Luxury Thumbnail Gallery - Scrollable on mobile */}
      {gallery.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 sm:mx-0 px-4 sm:px-0"
        >
          {gallery.map((img: any, index: number) => (
            <motion.button
              key={img.id || index}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveImageIdx(index)}
              className={`flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-500 relative group bg-white shadow-lg sm:shadow-2xl ${
                activeImageIdx === index
                  ? 'border-black shadow-xl sm:shadow-3xl scale-105 ring-2 sm:ring-2 ring-black ring-opacity-20'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="w-full h-full flex items-center justify-center bg-white">
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115"
                  loading="eager"
                />
              </div>
              
              {activeImageIdx === index && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 border-2 border-black rounded-xl sm:rounded-2xl shadow-inner"
                />
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl sm:rounded-2xl" />
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>

    {/* Luxury Product Info - Remove sticky on mobile */}
    <div className="space-y-8 sm:space-y-10">
      <div className="space-y-8 sm:space-y-10 sm:sticky sm:top-28">
        {/* Luxury Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Luxury Collection Badge */}
          {product.categories?.[0] && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold border border-gray-200 shadow-lg sm:shadow-2xl"
            >
              <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
              {product.categories[0].category?.name} Collection
            </motion.span>
          )}
          
          {/* Luxury Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl lg:text-3xl font-light text-black leading-tight tracking-tight bg-gradient-to-br from-black to-gray-700 bg-clip-text text-transparent"
          >
            {variant.title || product.slug}
          </motion.h1>

          {/* Luxury Star Rating */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-3 sm:gap-4 flex-wrap"
          >
            <StarRating rating={productRating} reviewCount={reviewCount}  />
            <Link href='#reviews'
              className="text-xs sm:text-sm text-gray-500 hover:text-black underline transition-colors duration-300 font-medium"
            >
              View All Reviews
            </Link>
          </motion.div>
          
          {/* Luxury Description */}
          {variant.shortDescription && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed font-light max-w-2xl border-l-2 sm:border-l-4 border-gray-300 pl-4 sm:pl-6 py-1 sm:py-2"
            >
              {variant.shortDescription}
            </motion.p>
          )}
        </motion.div>

        {/* Luxury Price Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {selectedSize ? (
            <div className="flex items-baseline gap-4 sm:gap-6 flex-wrap">
              {/* Final Price */}
              <div className="relative">
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-light text-black relative"
                >
                  {formatMAD(final!)}
                </motion.span>
              </div>

              {selectedSize.discountPercent && selectedSize.discountPercent > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-baseline gap-3 sm:gap-4 flex-wrap"
                >
                  {/* Original Price */}
                  <div className="relative">
                    <span className="text-lg sm:text-xl lg:text-2xl text-gray-400 line-through font-light">
                      {formatMAD(base!)}
                    </span>
                    {/* Strike-through Decoration */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 to-red-500 transform -rotate-3" />
                  </div>

                  {/* Discount Badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                    className="relative group"
                  >
                    {/* Main Badge */}
                    <div className="relative overflow-hidden">
                      <div className="px-3 py-2 sm:px-4 sm:py-2.5 lg:px-5 lg:py-3 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 text-white rounded-xl sm:rounded-2xl font-semibold shadow-lg sm:shadow-2xl shadow-green-500/25 border border-green-400/50 backdrop-blur-sm">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {/* Sparkle Icon */}
                          <motion.div
                            animate={{ rotate: [0, 15, 0], scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                          </motion.div>
                          <span className="text-xs sm:text-sm">Save {formatMAD(base! - final!)}</span>
                          {/* Percentage Badge */}
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-white/20 rounded-full text-xs font-bold border border-white/30"
                          >
                            {selectedSize.discountPercent}% OFF
                          </motion.span>
                        </div>
                      </div>
                      
                      {/* Shine Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-light text-black bg-gradient-to-br from-black to-gray-700 bg-clip-text text-transparent"
            >
              {prices.min != null && prices.max != null ? (
                prices.min === prices.max ? (
                  formatMAD(prices.min)
                ) : (
                  <div className="flex items-baseline gap-2 sm:gap-4">
                    <span>{formatMAD(prices.min)}</span>
                    <span className="text-gray-500 text-lg sm:text-xl">-</span>
                    <span>{formatMAD(prices.max)}</span>
                  </div>
                )
              ) : (
                <span className="text-gray-500 text-sm sm:text-xl">Select size to reveal price</span>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Premium Style Selection - Image Only */}
        {variants.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-widest">Available Styles</h3>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 sm:mx-0 px-4 sm:px-0">
              {variants.map((v: any, idx: number) => {
                const thumb = v.variantStyleImg || v.images?.[0]?.url;
                return (
                  <motion.button
                    key={v.id || idx}
                    whileHover={{ scale: 1.08, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setVariantIdx(idx); setActiveImageIdx(0); setIsImageLoaded(false); }}
                    className={`flex-shrink-0 relative rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-500 shadow-lg sm:shadow-2xl group ${
                      idx === variantIdx
                        ? 'border-blue-500 shadow-xl sm:shadow-3xl scale-105 ring-2 sm:ring-4 ring-blue-500/20'
                        : 'border-gray-200 hover:border-gray-400 hover:shadow-xl sm:hover:shadow-3xl'
                    }`}
                  >
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white flex items-center justify-center">
                      {thumb ? (
                        <img 
                          src={thumb} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          alt={v.name} 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                      )}
                    </div>
                    
                    {/* Selected indicator */}
                    {idx === variantIdx && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 sm:top-2 right-1 sm:right-2 w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full border border-white shadow-lg flex items-center justify-center"
                      >
                        <Check className="w-1 h-1 sm:w-1.5 sm:h-1.5 text-white" />
                      </motion.div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Premium Size Selection - Scrollable on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-widest">Select Your Size</h3>
            <motion.button
              whileHover={{ scale: 1.05, x: 2 }}
              className="text-xs text-gray-500 hover:text-black underline transition-colors duration-300 font-semibold"
            >
              Size Guide & Fit
            </motion.button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
            {(orderedSizes || []).map((s: any, i: number) => {
              const disabled = s.stockQty <= 0;
              const isLowStock = !disabled && s.stockQty < 10;
              return (
                <motion.button
                  key={s.id || i}
                  whileHover={{ scale: disabled ? 1 : 1.08, y: disabled ? 0 : -3 }}
                  whileTap={{ scale: disabled ? 1 : 0.95 }}
                  onClick={() => setSelectedSizeIdx(i)}
                  disabled={disabled}
                  className={`relative p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-center transition-all duration-500 shadow-md sm:shadow-lg group ${
                    selectedSizeIdx === i
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-blue-500 shadow-lg sm:shadow-2xl scale-105'
                      : disabled
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg sm:hover:shadow-xl'
                  }`}
                >
                  <span className={`text-xs sm:text-sm font-semibold ${
                    selectedSizeIdx === i ? 'text-white' : disabled ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {s.size}
                  </span>
                  
                  {/* Low stock indicator */}
                  {isLowStock && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full border border-white shadow-md"
                    />
                  )}

                  {/* Selected checkmark */}
                  {selectedSizeIdx === i && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full border border-blue-500 shadow-md flex items-center justify-center"
                    >
                      <Check className="w-1 h-1 sm:w-1.5 sm:h-1.5 text-blue-500" />
                    </motion.div>
                  )}

                  {/* Hover effect */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg sm:rounded-xl ${
                    selectedSizeIdx === i ? 'bg-white' : 'bg-black'
                  }`} />
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Luxury Add to Cart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6 sm:space-y-8 pt-6 sm:pt-8"
        >
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
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
              className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm flex-wrap"
            >
              {alreadyQty > 0 && (
                <span className="flex items-center gap-2 bg-green-50 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-green-200 shadow-md sm:shadow-lg">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"
                  />
                  <span className="font-semibold text-green-700">In cart: {alreadyQty}</span>
                </span>
              )}
              <span className="flex items-center gap-2 bg-blue-50 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-blue-200 shadow-md sm:shadow-lg">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full" />
                <span className="font-semibold text-blue-700">Available: {maxStock}</span>
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Luxury Features Grid - Stack on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 py-8 sm:py-10 border-t border-gray-200"
        >
          {luxuryFeatures.map((feature, index) => (
            <motion.div
              key={feature.text}
              whileHover={{ y: -4, scale: 1.03 }}
              className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-gray-300 transition-all duration-500 shadow-lg sm:shadow-2xl hover:shadow-xl sm:hover:shadow-3xl group"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-2xl group-hover:scale-110 transition-transform duration-500 flex-shrink-0`}>
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-xs sm:text-sm mb-1 sm:mb-2 truncate">{feature.text}</div>
                <div className="text-xs text-gray-600 leading-relaxed line-clamp-2">{feature.description}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  </div>

  {/* Luxury Full Width Content Section */}
  {variant.contentHtml && (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="mb-16 sm:mb-32 px-4 sm:px-8"
    >
      <div className="max-w-5xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-light text-black mb-8 sm:mb-16 text-center bg-gradient-to-br from-black to-gray-700 bg-clip-text text-transparent"
        >
          Luxury Product Details
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
          className="prose dark:prose-invert max-w-none prose-sm sm:prose-base"
          dangerouslySetInnerHTML={{ __html: variant.contentHtml || '' }}
        />
      </div>
    </motion.section>
  )}

  {/* Luxury Reviews Section */}
  <motion.section
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1 }}
    className="px-4 sm:px-8"
  >
    <div className="mx-auto">
      <ReviewsSection
        productId={product.id}
        variants={product.variants.map((v: any) => ({
          id: v.id,
          title: v.title,
          name: v.name,
          sizes: v.sizes.map((s: any) => ({ id: s.id, size: s.size, sku: s.sku }))
        }))}
      />
    </div>
  </motion.section>
</div>
  );
}

