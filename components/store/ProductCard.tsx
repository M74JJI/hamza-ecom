'use client';
import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, ShoppingCart, Zap, Shield, Eye, ChevronLeft, ChevronRight, Clock, Truck, Check, Sparkles, RotateCcw } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    brand: string;
    avgRating?: number;
    reviewCount?: number;
    variants: {
      id: string;
      name: string;
      title: string;
      color?: string | null;
      shortDescription?: string | null;
      variantStyleImg: string;
      images: { url: string }[];
      sizes: {
        priceMAD: number;
        discountPercent?: number;
        stockQty: number;
      }[];
    }[];
  };
  viewMode?: 'grid' | 'list';
}

// Fixed animation variants with proper TypeScript types
const floatingAnimation = {
  y: [0, -15, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut" as const,
  }
};

const floatingAnimationSlow = {
  y: [0, -20, 0],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut" as const,
  }
};

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const [variantIndex, setVariantIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isVariantHovered, setIsVariantHovered] = useState(false);
  const [hoveredVariantIndex, setHoveredVariantIndex] = useState<number | null>(null);
  
  const autoScrollRef = useRef<NodeJS.Timeout>(null);
  const variantHoverTimeoutRef = useRef<NodeJS.Timeout>(null);

  const variant = product.variants[variantIndex];
  const firstSize = variant.sizes[0];
  
  // Pricing calculations
  const originalPrice = firstSize?.priceMAD || 0;
  const discount = firstSize?.discountPercent || 0;
  const finalPrice = discount > 0 
    ? originalPrice * (1 - discount / 100)
    : originalPrice;

  const currentImages = variant?.images?.length > 0 ? variant.images : [{ url: variant.variantStyleImg }];
  const currentImage = currentImages[imageIndex]?.url || "https://images.unsplash.com/photo-1558769132-cb25c5d1c7c1?w=800";

  // Enhanced auto-scroll with pause on interaction
  useEffect(() => {
    if (isHovered && currentImages.length > 1 && !isVariantHovered) {
      autoScrollRef.current = setInterval(() => {
        setImageIndex((prev) => (prev + 1) % currentImages.length);
      }, 3000);
    } else {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isHovered, currentImages.length, isVariantHovered]);

  const nextImage = useCallback(() => {
    setImageIndex((prev) => (prev + 1) % currentImages.length);
    resetAutoScroll();
  }, [currentImages.length]);

  const prevImage = useCallback(() => {
    setImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
    resetAutoScroll();
  }, [currentImages.length]);

  const resetAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
  };

  // Enhanced variant hover with delay for smooth transitions
  const handleVariantHover = useCallback((index: number) => {
    setIsVariantHovered(true);
    setHoveredVariantIndex(index);
    
    if (variantHoverTimeoutRef.current) {
      clearTimeout(variantHoverTimeoutRef.current);
    }
    
    variantHoverTimeoutRef.current = setTimeout(() => {
      if (index !== variantIndex) {
        setVariantIndex(index);
        setImageIndex(0);
        setIsImageLoading(true);
      }
      setIsVariantHovered(false);
    }, 200);
  }, [variantIndex]);

  const handleVariantLeave = useCallback(() => {
    if (variantHoverTimeoutRef.current) {
      clearTimeout(variantHoverTimeoutRef.current);
    }
    setIsVariantHovered(false);
    setHoveredVariantIndex(null);
  }, []);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  // Animation variants with proper TypeScript types
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      }
    },
    hover: {
      y: -12,
      scale: 1.03,
      transition: { duration: 0.4, ease: "easeInOut" as const }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" as const }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4 }
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="bg-white/80 rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-500 group backdrop-blur-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Fixed Animated Background Elements */}
        <motion.div 
          animate={floatingAnimation}
          className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-xl"
        />
        <motion.div 
          animate={floatingAnimationSlow}
          className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-pink-200/20 to-orange-200/20 rounded-full blur-xl"
        />
        
        <div className="relative flex gap-8">
          {/* Enhanced Image Section */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative w-52 h-52 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 group/image"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${variant.id}-${imageIndex}`}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0"
              >
                <Image
                  src={currentImage}
                  alt={variant?.title || `${product.brand} product`}
                  fill
                  className="object-cover"
                  onLoad={handleImageLoad}
                  sizes="(max-width: 768px) 100vw, 208px"
                />
                
                {/* Enhanced Loading Animation */}
                {isImageLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200">
                    <motion.div 
                      animate={{ x: [-400, 400] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }}
                      className="w-40 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Enhanced Image Navigation */}
            {currentImages.length > 1 && (
              <>
                <motion.button
                  onClick={prevImage}
                  whileHover={{ scale: 1.2, x: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 rounded-2xl flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all duration-300 shadow-2xl backdrop-blur-sm border border-white/20"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </motion.button>
                <motion.button
                  onClick={nextImage}
                  whileHover={{ scale: 1.2}}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 rounded-2xl flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all duration-300 shadow-2xl backdrop-blur-sm border border-white/20"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </motion.button>
              </>
            )}

            {/* Enhanced Discount Badge */}
            {discount > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-2xl text-sm font-black shadow-2xl flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                -{discount}%
              </motion.div>
            )}

            {/* Enhanced Image Indicators */}
            {currentImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-sm rounded-2xl px-3 py-2">
                {currentImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === imageIndex 
                        ? "bg-white scale-125 shadow-lg" 
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="text-sm font-black text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-3"
                >
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" as const }}
                    className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                  {product.brand}
                </motion.div>
                
                <Link href={`/products/${product.slug}`}>
                  <h3 className="text-2xl font-black text-gray-900 hover:text-blue-600 transition-all duration-300 line-clamp-2 mb-3 group-hover:translate-x-1 leading-tight">
                    {variant?.title.split(' - ')[0] || "Product"}
                  </h3>
                </Link>
                
                {/* Enhanced Features */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 mb-4"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 text-xs text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-2xl"
                  >
                    <Check className="w-3 h-3" />
                    In Stock
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-2xl"
                  >
                    <Truck className="w-3 h-3" />
                    Free Shipping
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 text-xs text-purple-600 font-semibold bg-purple-50 px-3 py-1.5 rounded-2xl"
                  >
                    <Clock className="w-3 h-3" />
                    Fast Delivery
                  </motion.div>
                </motion.div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center gap-3 flex-shrink-0 ml-6">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl backdrop-blur-sm ${
                    isLiked 
                      ? "bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-red-200" 
                      : "bg-white/80 text-gray-600 hover:bg-white shadow-gray-200 border border-white/50"
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </motion.button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Enhanced Rating */}
                {product.avgRating && (
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-3 bg-white/80 rounded-2xl px-4 py-3 shadow-lg border border-white/50 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.avgRating || 0) 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-700">
                        {product.avgRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({product.reviewCount || 0} reviews)
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Enhanced Color Variants with Hover-Only Switching */}
                {product.variants.length > 1 && (
                  <motion.div 
                    className="flex gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {product.variants.map((v, i) => (
                      <motion.div
                        key={v.id}
                        className="relative"
                        onMouseEnter={() => handleVariantHover(i)}
                        onMouseLeave={handleVariantLeave}
                      >
                        <motion.div
                          whileHover={{ scale: 1.3, y: -4 }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-12 h-12 rounded-2xl border-3 shadow-2xl transition-all duration-300 relative cursor-pointer ${
                            i === variantIndex 
                              ? "border-gray-900 shadow-gray-400 scale-110 ring-4 ring-gray-900/10" 
                              : "border-white shadow-gray-300 hover:border-gray-600"
                          }`}
                          style={{ backgroundColor: v.color || "#94a3b8" }}
                          title={v.name}
                        >
                          {i === variantIndex && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                          
                          {/* Hover Preview Effect */}
                          <AnimatePresence>
                            {hoveredVariantIndex === i && i !== variantIndex && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap"
                              >
                                {v.name}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-black/90 rotate-45" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Enhanced Pricing and Actions */}
              <div className="text-right">
                <motion.div 
                  className="flex items-center gap-3 mb-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="text-3xl font-black text-gray-900">
                    MAD {finalPrice.toFixed(0)}
                  </span>
                  {discount > 0 && (
                    <span className="text-lg text-gray-500 line-through font-semibold">
                      MAD {originalPrice.toFixed(0)}
                    </span>
                  )}
                </motion.div>
             
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Trust Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-white/50"
        >
          {[
            { icon: Shield, text: "2-Year Warranty", color: "text-blue-500" },
            { icon: RotateCcw, text: "30-Day Returns", color: "text-green-500" },
            { icon: Clock, text: "24/7 Support", color: "text-purple-500" },
            { icon: Truck, text: "Free Shipping", color: "text-orange-500" }
          ].map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.1, y: -2 }}
              className="flex items-center gap-2 text-xs font-semibold text-gray-600"
            >
              <item.icon className={`w-4 h-4 ${item.color}`} />
              {item.text}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  // Enhanced Grid View
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white/80 rounded-3xl shadow-2xl border border-white/50 overflow-hidden hover:shadow-3xl transition-all duration-500 backdrop-blur-xl bg-gradient-to-br from-white/90 via-white/70 to-white/50 relative">
        {/* Fixed Animated Background Elements */}
        <motion.div 
          animate={floatingAnimation}
          className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-2xl"
        />
        <motion.div 
          animate={floatingAnimationSlow}
          className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-r from-pink-200/15 to-orange-200/15 rounded-full blur-2xl"
        />
        
        {/* Enhanced Image Container */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
        >
          <Link href={`/products/${product.slug}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${variant.id}-${imageIndex}`}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0"
              >
                <Image
                  src={currentImage}
                  alt={variant?.title || `${product.brand} product`}
                  fill
                  className="object-cover"
                  onLoad={handleImageLoad}
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                
                {/* Enhanced Loading Animation */}
                {isImageLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200">
                    <motion.div 
                      animate={{ x: [-400, 400] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }}
                      className="w-40 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </Link>

          {/* Enhanced Image Navigation */}
          {currentImages.length > 1 && (
            <>
              <motion.button
                onClick={prevImage}
                whileHover={{ scale: 1.2, x: -2 }}
                whileTap={{ scale: 0.9 }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl backdrop-blur-sm border border-white/20"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </motion.button>
              <motion.button
                onClick={nextImage}
                whileHover={{ scale: 1.2, x: 2 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl backdrop-blur-sm border border-white/20"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </motion.button>
            </>
          )}

          {/* Enhanced Discount Badge */}
          {discount > 0 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-2xl text-sm font-black shadow-2xl flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              -{discount}%
              {/*
              <Sparkles className="w-3 h-3" />
               */}
            </motion.div>
          )}

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.1}}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsLiked(!isLiked)}
              className={`w-14 h-14 rounded-2xl backdrop-blur-md flex items-center justify-center shadow-2xl transition-all duration-300 border border-white/20 ${
                isLiked 
                  ? "bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-red-300" 
                  : "bg-white/90 text-gray-600 hover:bg-white shadow-gray-300"
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-md text-gray-600 hover:bg-white shadow-2xl shadow-gray-300 flex items-center justify-center transition-all duration-300 border border-white/20"
            >
              <Eye className="w-6 h-6" />
            </motion.button>
          </div>

         

          {/* Enhanced Image Indicators */}
          {currentImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-sm rounded-2xl px-3 py-2">
              {currentImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === imageIndex 
                      ? "bg-white scale-125 shadow-lg" 
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Stock Alert */}
          {firstSize?.stockQty && firstSize.stockQty < 5 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="absolute bottom-4 right-4 left-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              Only {firstSize.stockQty} left!
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Product Info */}
        <div className="p-6 relative">
          <motion.div
            whileHover={{ x: 2 }}
            className="text-xs font-black text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-3"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" as const }}
              className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            />
            {product.brand}
          </motion.div>

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-black text-gray-900 text-lg line-clamp-1 mb-3 hover:text-blue-600 transition-colors leading-tight group-hover:translate-x-1">
              {variant?.title}
            </h3>
          </Link>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-gray-900">
                MAD {finalPrice.toFixed(0)}
              </span>
              {discount > 0 && (
                <span className="text-lg text-gray-500 line-through font-bold">
                  MAD {originalPrice.toFixed(0)}
                </span>
              )}
            </div>

            {/* Quick Stock Status - MOVED TO RIGHT SIDE */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-2xl"
            >
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" as const }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
              <span className="text-xs font-semibold text-green-600">In Stock</span>
            </motion.div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {product.avgRating && (
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-1 bg-white/80 rounded-2xl px-3 py-1.5 shadow-lg border border-white/50 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.avgRating || 0) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-black text-gray-700 ml-1">
                    {product.avgRating.toFixed(1)}
                  </span>
                </motion.div>
              )}
            </div>

    

          </div>
        {/* Enhanced Color Variants with Hover-Only Switching */}
<div className="w-full flex items-end justify-end">
             {product.variants.length > 0 && (
  <motion.div 
    className="flex gap-3"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.2 }}
  >
    {product.variants.map((v, i) => (
      <motion.div
        key={v.id}
        className="relative"
        onMouseEnter={() => handleVariantHover(i)}
        onMouseLeave={handleVariantLeave}
      >
        {/* Variant Image Thumbnail */}
        <motion.div
          whileHover={{ scale: 1.2, y: -3 }}
          whileTap={{ scale: 0.9 }}
          className={`w-10 h-10 rounded-full overflow-hidden border-2 shadow-md transition-all duration-300 cursor-pointer ${
            i === variantIndex 
              ? "border-gray-900 shadow-gray-400 scale-110 ring-2 ring-gray-900/20" 
              : "border-white shadow-gray-300 hover:border-gray-600"
          }`}
        >
          <Image
            src={v.images[0].url}
            alt={v.name}
            width={40}
            height={40}
            className="object-cover w-full h-full rounded-full"
          />
        </motion.div>

        {/* Active Checkmark */}
        {i === variantIndex && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border border-white flex items-center justify-center shadow-lg"
          >
            <Check className="w-2 h-2 text-white" />
          </motion.div>
        )}

        {/* Hover Preview Tooltip */}
        <AnimatePresence>
          {hoveredVariantIndex === i && i !== variantIndex && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap"
            >
              {v.name}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-black/90 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    ))}
  </motion.div>
)}
</div>
        </div>
      </div>
    </motion.div>
  );
}