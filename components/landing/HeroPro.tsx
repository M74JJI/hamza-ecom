// BrandFocusedHero.tsx - Updated Left Side
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, Star, Heart, Eye, ChevronRight, Zap, Sparkles, ArrowRight, ArrowLeft, Shield, Truck, Clock, Award } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { heroInclude, type HeroProduct } from '@/types/hero';

export default function BrandFocusedHero({products}:{products:HeroProduct[]}) {
  const [activeProduct, setActiveProduct] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  
  // Updated product data without artist focus


  const brandHighlights = [
    { icon: Shield, text: "2-Year Warranty", description: "Quality guaranteed" },
    { icon: Truck, text: "Free Shipping", description: "Over 500 MAD" },
    { icon: Clock, text: "24/7 Support", description: "Always here to help" },
    { icon: Award, text: "Premium Quality", description: "Handpicked materials" }
  ];

  const currentProduct = products[activeProduct];

  const nextProduct = () => {
    setActiveProduct((prev) => (prev + 1) % products.length);
  };

  const prevProduct = () => {
    setActiveProduct((prev) => (prev - 1 + products.length) % products.length);
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 py-7 via-orange-50 to-red-50 relative overflow-hidden">
      
      {/* Keep the same artistic background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-red-500/10 rotate-45"
          animate={{ rotate: [45, 90, 45] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-24 h-24 bg-blue-500/10 -rotate-12"
          animate={{ scale: [1, 1.2, 1], rotate: [-12, 12, -12] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        
        {/* Brush Strokes */}
        <motion.div
          className="absolute top-40 right-40 w-64 h-3 bg-black/5 rotate-45 rounded-full"
          animate={{ x: [0, 50, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* Left: Brand-Focused Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            
            {/* Brand Excellence Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-3 px-4 py-3 bg-black text-white rounded-lg border-2 border-white shadow-2xl relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-500 to-yellow-500 opacity-20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              />
              <Award className="w-5 h-5 relative z-10" />
              <span className="font-black text-sm relative z-10">PREMIUM COLLECTION</span>
              <motion.div
                className="w-2 h-2 bg-yellow-400 rounded-full relative z-10"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Brand Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9]">
                <span className="text-black">REDEFINE</span>
                <br />
                <motion.span
                  className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ['0%', '100%'] }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                  style={{ backgroundSize: '200% 100%' }}
                >
                  YOUR STYLE
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-lg text-gray-800 leading-relaxed max-w-md font-medium"
              >
                Discover premium products crafted with exceptional quality and innovative design. 
                Where performance meets sophistication for the modern lifestyle.
              </motion.p>
            </motion.div>

            {/* Current Product Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-gray-800" />
                <span className="font-black text-gray-900 text-lg">PRODUCT HIGHLIGHTS</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {currentProduct.highlights.map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-300 shadow-lg"
                  >
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center border-2 border-black">
                      <Sparkles className="w-3 h-3 text-black" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-sm">{feature.label}</div>
                      <div className="text-xs text-gray-600">{feature.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Brand Trust Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              <div className="font-black text-gray-900 text-lg">WHY CHOOSE US</div>
              <div className="grid grid-cols-2 gap-3">
                {brandHighlights.map((item, index) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="flex items-center gap-2 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-300"
                  >
                    <item.icon className="w-4 h-4 text-yellow-500" />
                    <div>
                      <div className="text-sm font-bold text-gray-900">{item.text}</div>
                      <div className="text-xs text-gray-600">{item.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Enhanced CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-4"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between px-6 py-4 bg-black text-white rounded-xl border-2 border-yellow-500 shadow-2xl relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-500 to-yellow-500 opacity-0 group-hover:opacity-20"
                  transition={{ duration: 0.3 }}
                />
                <div className="flex items-center gap-4 relative z-10">
                  <ShoppingBag className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-black text-lg">SHOP THE COLLECTION</div>
                    <div className="text-yellow-400 text-sm font-medium">Premium quality · Free shipping · 2-year warranty</div>
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.div>
              </motion.button>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-3 bg-white rounded-xl border-2 border-gray-300 text-gray-900 font-black hover:border-black transition-all duration-300 shadow-lg"
                >
                  View All Products
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-3 bg-white rounded-xl border-2 border-gray-300 text-gray-900 font-black hover:border-black transition-all duration-300 shadow-lg"
                >
                  Our Story
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Keep the Amazing Product Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            
            {/* Main Product Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
              className="relative"
            >
              {/* Navigation Arrows */}
              <motion.button
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevProduct}
                className="absolute -left-6 top-1/2 z-20 w-12 h-12 bg-black text-white rounded-full border-2 border-yellow-500 shadow-2xl flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1, x: 2 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextProduct}
                className="absolute -right-6 top-1/2 z-20 w-12 h-12 bg-black text-white rounded-full border-2 border-yellow-500 shadow-2xl flex items-center justify-center"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              {/* Product Card */}
              <div className="relative bg-white border-4 border-black shadow-2xl rounded-2xl overflow-hidden">
                
                {/* Product Image with Enhanced Overlay */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentProduct.id}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full"
                    >
                      <Image
                        src={currentProduct.variants[activeProduct].images[0].url}
                       alt={currentProduct.variants[activeProduct].images[0].url}

                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Enhanced Artistic Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-yellow-500/10 mix-blend-overlay" />
                  <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/90 to-transparent" />
                  
                  {/* Limited Edition Badge */}
                  {true && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-4 left-4 bg-yellow-500 px-3 py-1 rounded-full border-2 border-black"
                    >
                      <span className="text-black font-black text-xs">LIMITED EDITION</span>
                    </motion.div>
                  )}

                  {/* Enhanced Product Info Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <motion.h3
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-2xl font-black text-white"
                        >
                          {currentProduct.variants[activeProduct].name}
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-yellow-400 font-medium text-sm"
                        >
                          {/*currentProduct.categories[0].category.name*/}category
                        </motion.p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 12 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-black cursor-pointer"
                      >
                        <Heart className="w-5 h-5 text-black" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Enhanced Price Tag */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-4 right-4 bg-yellow-500 px-4 py-2 rounded-lg border-2 border-black shadow-xl"
                  >
                    <div className="text-black font-black text-lg">{currentProduct.variants[activeProduct].sizes[0].priceMAD.toString()}</div>
                    <div className="text-black/70 text-xs line-through">{currentProduct.variants[activeProduct].sizes[0].priceMAD.toString()}</div>
                  </motion.div>
                </div>

                {/* Enhanced Product Details */}
                <div className="p-6 space-y-4 border-t-4 border-black">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(5)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600">(5)</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{"description"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Color Options */}
                  <div className="space-y-3">
                    <div className="font-black text-gray-900">AVAILABLE COLORS</div>
                    <div className="flex gap-3">
                      {currentProduct.variants.map((variant, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.2, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                         
                         
                        >
                          <Image
                          src={variant.variantStyleImg}
                          width={64}
                          height={64}
                          alt=''
                           className="w-8 h-8 rounded border-2 border-gray-400 hover:border-black transition-all duration-300 shadow-sm"
                          />
                          </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-black text-white font-black text-lg border-2 border-yellow-500 hover:bg-gray-900 transition-colors duration-300 shadow-xl relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-500 to-yellow-500 opacity-0 group-hover:opacity-20"
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10">ADD TO CART</span>
                  </motion.button>
                </div>
              </div>

              {/* Enhanced Decorative Elements */}
              <motion.div
                className="absolute -top-4 -left-4 w-8 h-8 bg-red-500 border-2 border-black rounded-lg"
                animate={{ rotate: [0, 180, 0] }}
                transition={{ duration: 20, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-4 -right-4 w-6 h-6 bg-blue-500 border-2 border-black rounded-lg"
                animate={{ scale: [1, 1.5, 1], rotate: [0, 45, 0] }}
                transition={{ duration: 15, repeat: Infinity }}
              />
            </motion.div>

            {/* Enhanced Product Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-3 mt-8"
            >
              {products.map((product:any, index:number) => (
                <motion.button
                  key={product.id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveProduct(index)}
                  className={`flex-1 p-3 bg-white rounded-xl border-2 transition-all duration-300 shadow-lg ${
                    activeProduct === index
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-black'
                  }`}
                >
                  <div className="aspect-square relative bg-gray-200 mb-2 rounded-lg overflow-hidden">
                    <Image
                      src={product.variants[0].images[0].url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-current">title</h4>
                    <div className="text-xs opacity-70">{product.category}</div>
                    <div className="font-black text-current text-sm">{product.price}</div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Brand Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t-2 border-black"
        >
          {[
            { value: "10K+", label: "HAPPY CUSTOMERS", icon: Heart },
            { value: "4.8★", label: "AVERAGE RATING", icon: Star },
            { value: "24/7", label: "CUSTOMER SUPPORT", icon: Clock },
            { value: "500+", label: "PREMIUM PRODUCTS", icon: Award },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 + index * 0.1 }}
              className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-300 shadow-lg"
            >
              <stat.icon className="w-6 h-6 text-black mx-auto mb-2" />
              <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs font-medium text-gray-700">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Brand Signature */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-8"
      >
        <motion.div
          className="text-sm font-black text-gray-800 rotate-90 origin-left flex items-center gap-2"
          animate={{ x: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          PREMIUM QUALITY GUARANTEED
        </motion.div>
      </motion.div>
    </section>
  );
}