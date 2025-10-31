// BrandFocusedHero.tsx - Ultra Premium Version
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, Star, Heart, Eye, ChevronRight, Zap, Sparkles, ArrowRight, ArrowLeft, Shield, Truck, Clock, Award, Crown, Gem, Check } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect, useMemo } from 'react';
import { heroInclude, type HeroProduct } from '@/types/hero';

export default function BrandFocusedHero({products}:{products:HeroProduct[]}) {
    if (!products || products.length === 0) {
    return (
      <section className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50/30">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-stone-800 tracking-tight">
            No Featured Products Yet
          </h2>
          <p className="text-stone-600 text-lg max-w-md mx-auto">
            We’re curating our luxury collection. Please check back soon for premium arrivals.
          </p>
        </div>
      </section>
    );
  }
  const [activeProduct, setActiveProduct] = useState(0);
  const [activeVariant, setActiveVariant] = useState(0);
  const [hoveredVariant, setHoveredVariant] = useState<number | null>(null);
  
  const currentProduct = products[activeProduct];
  const currentVariant = currentProduct.variants[activeVariant];

  // Premium price calculation utilities
  const calculateDiscountedPrice = (price: number, discountPercent: number | null) => {
    if (!discountPercent) return price;
    return price * (1 - discountPercent / 100);
  };

  // Get cheapest size for a variant considering discounts
  const getCheapestSize = (variant: typeof currentVariant) => {
    return variant.sizes.reduce((cheapest, size) => {
      const currentPrice = calculateDiscountedPrice(size.priceMAD, size.discountPercent);
      const cheapestPrice = calculateDiscountedPrice(cheapest.priceMAD, cheapest.discountPercent);
      return currentPrice < cheapestPrice ? size : cheapest;
    });
  };

  // Calculate price range for product across all variants
  const getProductPriceRange = useMemo(() => {
    const allPrices = currentProduct.variants.flatMap(variant => 
      variant.sizes.map(size => calculateDiscountedPrice(size.priceMAD, size.discountPercent))
    );
    
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    
    return {
      min: Math.round(minPrice),
      max: Math.round(maxPrice),
      hasRange: minPrice !== maxPrice,
      formatted: minPrice === maxPrice 
        ? `${Math.round(minPrice)} MAD` 
        : `From ${Math.round(minPrice)} MAD`
    };
  }, [currentProduct]);

  // Get current variant's best price
  const currentVariantPrice = useMemo(() => {
    const cheapestSize = getCheapestSize(currentVariant);
    const discountedPrice = calculateDiscountedPrice(cheapestSize.priceMAD, cheapestSize.discountPercent);
    const originalPrice = cheapestSize.priceMAD;
    
    return {
      discounted: Math.round(discountedPrice),
      original: Math.round(originalPrice),
      hasDiscount: !!cheapestSize.discountPercent,
      discountPercent: cheapestSize.discountPercent,
      size: cheapestSize.size
    };
  }, [currentVariant]);

  const brandHighlights = [
    { icon: Crown, text: "Luxury Craftsmanship", description: "Artisanal quality" },
    { icon: Shield, text: "2-Year Warranty", description: "Quality guaranteed" },
    { icon: Gem, text: "Premium Materials", description: "Finest selection" },
    { icon: Truck, text: "White Glove Delivery", description: "Free over 500 MAD" }
  ];

  const nextProduct = () => {
    setActiveProduct((prev) => (prev + 1) % products.length);
    setActiveVariant(0);
  };

  const prevProduct = () => {
    setActiveProduct((prev) => (prev - 1 + products.length) % products.length);
    setActiveVariant(0);
  };

  // Auto-rotation with premium timing
  useEffect(() => {
    const interval = setInterval(() => {
      nextProduct();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeProduct]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50/30 relative overflow-hidden py-10">
      
      {/* Ultra Premium Background Elements */}
      <div className="absolute inset-0">
        {/* Subtle geometric patterns */}
        <motion.div
          className="absolute top-20 left-20 w-48 h-48 bg-amber-200/5 rotate-45 rounded-3xl"
          animate={{ rotate: [45, 90, 45], opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-32 right-32 w-36 h-36 bg-stone-300/5 -rotate-12 rounded-2xl"
          animate={{ scale: [1, 1.3, 1], rotate: [-12, 12, -12] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        
        {/* Premium brush strokes */}
        <motion.div
          className="absolute top-40 right-40 w-80 h-1 bg-amber-900/10 rotate-45 rounded-full"
          animate={{ x: [0, 60, 0], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        
        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-amber-600/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 items-start">
          
          {/* Left: Ultra Premium Brand Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-12"
          >
            
            {/* Luxury Excellence Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-amber-900 to-amber-700 text-white rounded-2xl border border-amber-400/30 shadow-2xl relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-yellow-400/10"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              />
              <Crown className="w-6 h-6 relative z-10" />
              <span className="font-black text-sm relative z-10 tracking-widest">LUXURY COLLECTION</span>
              <motion.div
                className="w-2 h-2 bg-amber-300 rounded-full relative z-10"
                animate={{ scale: [1, 1.8, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Premium Brand Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              <h1 className="text-[14vw] md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.85]">
                <span className="text-stone-900">ELEVATE</span>
                <br />
                <motion.span
                  className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-800 bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ['0%', '100%'] }}
                  transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
                  style={{ backgroundSize: '200% 100%' }}
                >
                  YOUR ESSENCE
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-stone-700 leading-relaxed max-w-lg font-light tracking-wide"
              >
                Discover meticulously crafted pieces where exceptional quality meets timeless design. 
              </motion.p>
            </motion.div>

            {/* Premium Product Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <Gem className="w-6 h-6 text-amber-600" />
                <span className="font-black text-stone-900 text-lg tracking-widest uppercase">Craftsmanship</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {currentProduct.highlights.slice(0,3).map((feature, index) => (
                  <motion.div
                  key={`${currentProduct.id}-${feature.id || feature.label}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center gap-4 p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-stone-300/50 shadow-lg hover:shadow-xl transition-all duration-500 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center border border-amber-400/30 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-stone-900 text-base tracking-wide">{feature.label}</div>
                      <div className="text-sm text-stone-600 font-light">{feature.value}</div>
                    </div>
                    <Check className="w-4 h-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Luxury Trust Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-6"
            >
              <div className="font-black text-stone-900 text-lg tracking-widest uppercase">The Luxury Promise</div>
              <div className="grid grid-cols-2 gap-4">
                {brandHighlights.map((item, index) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-stone-300/50 hover:border-amber-300/50 transition-all duration-300 group"
                  >
                    <item.icon className="w-5 h-5 text-amber-600 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-stone-900 truncate">{item.text}</div>
                      <div className="text-xs text-stone-600 font-light truncate">{item.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Premium CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-6"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between px-8 py-6 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl border border-amber-400/30 shadow-2xl relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.5 }}
                />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center border border-amber-300/50">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-black text-xl tracking-wide">EXPLORE THE COLLECTION</div>
                    <div className="text-amber-300 text-sm font-medium tracking-wide">Artisanal quality · White glove delivery · Lifetime support</div>
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative z-10"
                >
                  <ChevronRight className="w-7 h-7 text-amber-300" />
                </motion.div>
              </motion.button>

          
            </motion.div>
          </motion.div>

          {/* Right: Luxury Product Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative p-5 md:p-0"
          >
            
            {/* Luxury Main Product Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.8, type: "spring", stiffness: 100 }}
              className="relative"
            >
              {/* Premium Navigation Arrows */}
              <motion.button
                whileHover={{ scale: 1.1, x: -2, backgroundColor: "#1c1917" }}
                whileTap={{ scale: 0.9 }}
                onClick={prevProduct}
                className="absolute -left-8 top-1/2 z-20 w-14 h-14 bg-stone-900 text-amber-300 rounded-full border border-amber-400/30 shadow-2xl flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1, x: 2, backgroundColor: "#1c1917" }}
                whileTap={{ scale: 0.9 }}
                onClick={nextProduct}
                className="absolute -right-8 top-1/2 z-20 w-14 h-14 bg-stone-900 text-amber-300 rounded-full border border-amber-400/30 shadow-2xl flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
              >
                <ArrowRight className="w-6 h-6" />
              </motion.button>

              {/* Luxury Product Card */}
              <div className="relative bg-white/95 backdrop-blur-md border border-stone-300/50 shadow-2xl rounded-3xl overflow-hidden">
                
                {/* Premium Product Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-stone-200 to-stone-300 group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${currentProduct.id}-${activeVariant}`}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="w-full h-full"
                    >
                      <Image
                        src={currentVariant.images[0].url}
                        alt={currentVariant.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Luxury Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-orange-500/5 mix-blend-overlay" />
                  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-stone-900/95 via-stone-900/50 to-transparent" />
                  
                  {/* Limited Edition Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute top-6 left-6 bg-gradient-to-r from-amber-500 to-amber-700 px-4 py-2 rounded-full border border-amber-300/30 shadow-lg"
                  >
                    <span className="text-white font-black text-xs tracking-wider">LIMITED EDITION</span>
                  </motion.div>

                  {/* Premium Product Info Overlay */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-end justify-between">
                      <div className="flex-1 min-w-0 mr-6">
                        <motion.h3
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-3xl font-black text-white mb-1 tracking-wide line-clamp-1"
                        >
                          {currentVariant.title}
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-amber-300 font-medium text-base tracking-wide"
                        >
                          {currentProduct.categories?.[0]?.category?.name || "Luxury Collection"}
                        </motion.p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 12 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center border border-amber-300/30 cursor-pointer flex-shrink-0 hover:from-amber-600 hover:to-amber-800 transition-all duration-300 shadow-lg"
                      >
                        <Heart className="w-6 h-6 text-white" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Premium Price Display */}
                  <motion.div
                    initial={{ opacity: 0, x: 20, y: -20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-6 right-6 bg-gradient-to-br from-amber-500 to-amber-700 px-5 py-3 rounded-2xl border border-amber-300/30 shadow-2xl text-center"
                  >
                    <div className="text-white font-black text-2xl mb-1">{currentVariantPrice.discounted} MAD</div>
                    {currentVariantPrice.hasDiscount && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-amber-200 text-sm line-through font-medium">
                          {currentVariantPrice.original} MAD
                        </div>
                        <div className="bg-white text-amber-700 px-2 py-1 rounded-full text-xs font-black">
                          -{currentVariantPrice.discountPercent}%
                        </div>
                      </div>
                    )}
                    <div className="text-amber-200 text-xs font-medium mt-1">
                      Best: {currentVariantPrice.size}
                    </div>
                  </motion.div>
                </div>

                {/* Luxury Product Details */}
                <div className="p-4 space-y-4 border-t border-stone-300/30">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(currentProduct.rating || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-stone-600 whitespace-nowrap">
                            ({currentProduct.reviews?.length || 5} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Luxury Color Selection */}
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      {currentProduct.variants.map((variant, index) => (
                        <motion.div
                          key={variant.id}
                          className="relative"
                          onMouseEnter={() => setHoveredVariant(index)}
                          onMouseLeave={() => setHoveredVariant(null)}
                        >
                          <motion.button
                            whileHover={{ scale: 1.15, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveVariant(index)}
                            className={`w-12 h-12 rounded-xl border-2 transition-all duration-300 shadow-lg relative overflow-hidden group ${
                              activeVariant === index
                                ? 'border-amber-500 ring-2 ring-amber-200'
                                : 'border-stone-300 hover:border-amber-400'
                            }`}
                          >
                            <Image
                              src={variant.variantStyleImg}
                              alt={variant.name}
                              fill
                              className="object-cover"
                            />
                            {activeVariant === index && (
                              <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </motion.button>
                          
                          {/* Luxury Hover Preview */}
                          <AnimatePresence>
                            {hoveredVariant === index && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 z-30"
                              >
                                <div className="bg-white border border-stone-300/50 rounded-2xl shadow-2xl p-3 backdrop-blur-sm">
                                  <div className="w-32 h-32 relative rounded-xl overflow-hidden border border-stone-300/30">
                                    <Image
                                      src={variant.images[0].url}
                                      alt={variant.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="text-sm font-bold text-center mt-2 text-stone-900 max-w-[120px] truncate">
                                    {variant.name}
                                  </div>
                                  <div className="text-xs text-amber-600 text-center font-medium">
                                    {getCheapestSize(variant).size} • {calculateDiscountedPrice(getCheapestSize(variant).priceMAD, getCheapestSize(variant).discountPercent).toFixed(0)} MAD
                                  </div>
                                </div>
                                {/* Tooltip arrow */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-white" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Luxury Decorative Elements */}
              <motion.div
                className="absolute -top-6 -left-6 w-12 h-12 bg-amber-500 border border-amber-400/30 rounded-2xl z-10 shadow-2xl"
                animate={{ rotate: [0, 180, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 20, repeat: Infinity }}
              />
          
            </motion.div>

            {/* Luxury Product Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-6 mt-2"
            >
              {products.map((product, index) => {
                const productMinPrice = Math.min(...product.variants.flatMap(variant => 
                  variant.sizes.map(size => calculateDiscountedPrice(size.priceMAD, size.discountPercent))
                ));
                
                return (
                  <motion.button
                    key={product.id}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveProduct(index);
                      setActiveVariant(0);
                    }}
                    className={`flex-1 p-5 bg-white/90 backdrop-blur-sm rounded-2xl border transition-all duration-500 shadow-lg hover:shadow-xl ${
                      activeProduct === index
                        ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50'
                        : 'border-stone-300/50 hover:border-amber-300'
                    }`}
                  >
                    <div className="aspect-square relative bg-stone-200 mb-4 rounded-xl overflow-hidden border border-stone-300/30">
                      <Image
                        src={product.variants[0].images[0].url}
                        alt={product.variants[0].id}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-stone-900 truncate tracking-wide">{product.variants[0].name}</h4>
                      <div className="text-xs text-stone-600 font-light truncate">
                        {product.categories?.[0]?.category?.name || "Luxury"}
                      </div>
                      <div className="font-black text-stone-900 text-base">
                        From {Math.round(productMinPrice)} MAD
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        </div>

      
      </div>

      {/* Luxury Brand Signature */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-8"
      >
        <motion.div
          className="text-sm font-black text-stone-700 rotate-90 origin-left flex items-center gap-4 tracking-widest"
          animate={{ x: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-amber-500 rounded-full" />
          CRAFTED WITH EXCELLENCE
          <div className="w-2 h-2 bg-amber-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}