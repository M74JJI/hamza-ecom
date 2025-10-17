// components/landing/TopSellers.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Heart, 
  Eye, 
  ShoppingBag, 
  ArrowRight, 
  Zap,
  Sparkles,
  Crown,
  TrendingUp,
  Truck,
  Shield
} from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  slug: string;
  status: string;
  variants: Variant[];
  categories: ProductCategory[];
  createdAt: string;
  updatedAt: string;
}

interface Variant {
  id: string;
  title: string;
  name: string;
  color: string | null;                // ✅ fixed earlier
  variantStyleImg: string;
  shortDescription: string | null;     // ✅ allow null
  contentHtml: string | null;          // ✅ allow null
  sortOrder: number;
  isActive: boolean;
  freeDelivery: boolean;
  images: VariantImage[];
  sizes: VariantSize[];
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}


interface VariantImage {
  id: string;
  url: string;
  sortOrder: number;
}

interface VariantSize {
  id: string;
  size: string;
  sku: string;
  priceMAD: string;
  discountPercent: number | null;
  stockQty: number;
  isActive: boolean;
}

interface ProductCategory {
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Review {
  id: string;
  rating: number;
  createdAt: string;
}

interface TopSellersProps {
  products: Product[];
}

export function TopSellers({ products }: TopSellersProps) {
  const [activeProducts, setActiveProducts] = useState<{ [key: string]: number }>({});
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [hoveredVariant, setHoveredVariant] = useState<{ productId: string; variantIndex: number } | null>(null);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  // Initialize active variants
  useEffect(() => {
    const initialActive: { [key: string]: number } = {};
    products.forEach(product => {
      if (product.variants.length > 0) {
        initialActive[product.id] = 0; // First variant by default
      }
    });
    setActiveProducts(initialActive);
  }, [products]);

  const switchVariant = async (productId: string, variantIndex: number) => {
    setLoadingStates(prev => ({ ...prev, [productId]: true }));
    
    // Simulate loading delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setActiveProducts(prev => ({
      ...prev,
      [productId]: variantIndex
    }));
    
    setLoadingStates(prev => ({ ...prev, [productId]: false }));
  };

  const getProductStats = (product: Product) => {
    const allReviews = product.variants.flatMap(v => v.reviews);
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    const totalStock = product.variants.reduce((sum, variant) => 
      sum + variant.sizes.reduce((sizeSum, size) => sizeSum + size.stockQty, 0), 0
    );

    return { totalReviews, averageRating, totalStock };
  };

  const getCurrentVariant = (product: Product) => {
    const activeIndex = activeProducts[product.id] || 0;
    return product.variants[activeIndex];
  };

  const getVariantPrice = (variant: Variant) => {
    const sizes = variant.sizes.filter(size => size.isActive);
    if (sizes.length === 0) return { price: '0', originalPrice: '0', hasDiscount: false };
    
    const firstSize = sizes[0];
    const price = parseFloat(firstSize.priceMAD);
    const discount = firstSize.discountPercent || 0;
    
    if (discount > 0) {
      const discountedPrice = price * (1 - discount / 100);
      return {
        price: discountedPrice.toFixed(2),
        originalPrice: price.toFixed(2),
        hasDiscount: true,
        discountPercent: discount
      };
    }
    
    return {
      price: price.toFixed(2),
      originalPrice: price.toFixed(2),
      hasDiscount: false,
      discountPercent: 0
    };
  };

  return (
    <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-20">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 w-16 h-16 bg-red-500/10 rotate-45"
          animate={{ rotate: [45, 90, 45] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-12 h-12 bg-orange-500/10 -rotate-12"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-1/3 left-1/4 w-8 h-8 bg-yellow-500/10 rounded-full"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg border-2 border-white shadow-lg mb-4"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="font-black text-sm">TOP SELLERS</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            <span className="text-gray-900">BEST SELLING</span>
            <br />
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              PRODUCTS
            </span>
          </h2>
          
          <p className="text-lg text-gray-700 max-w-2xl mx-auto font-medium">
            Discover our most loved products that customers can't stop talking about
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.slice(0, 8).map((product, index) => {
            const currentVariant = getCurrentVariant(product);
            const currentPriceInfo = getVariantPrice(currentVariant);
            const stats = getProductStats(product);
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.8, type: "spring" }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => {
                  setHoveredProduct(null);
                  setHoveredVariant(null);
                }}
              >
      {/* Premium Brutalist Product Card */}
<div className="relative bg-white border-[3px] border-black rounded-none overflow-hidden group hover:rotate-[-0.5deg] transition-all duration-700 shadow-[12px_12px_0_0_#000] hover:shadow-[18px_18px_0_0_#000] hover:scale-[1.02]">

  {/* Premium Badge Ribbon */}
  <div className="absolute top-6 -left-2 bg-red-500 text-white px-6 py-2 border-2 border-black font-black text-xs uppercase z-20 rotate-[-45deg] shadow-[2px_2px_0_0_#000]">
    Limited
  </div>

  {/* Image Container with Enhanced Interactions */}
  <div className="relative h-96 bg-gradient-to-br from-yellow-50 to-orange-100 overflow-hidden border-b-[3px] border-black">
    <AnimatePresence mode="wait">
      {(hoveredVariant?.productId === product.id && product.variants[hoveredVariant.variantIndex]) ? (
        <motion.div
          key={`hover-${product.variants[hoveredVariant.variantIndex].id}`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full h-full"
        >
          {product.variants[hoveredVariant.variantIndex].images[0] && (
            <Image
              src={product.variants[hoveredVariant.variantIndex].images[0].url}
              alt={product.variants[hoveredVariant.variantIndex].title}
              fill
              className="object-cover mix-blend-multiply hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          )}
        </motion.div>
      ) : (
        <motion.div
          key={currentVariant.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full"
        >
          {currentVariant.images[0] && (
            <Image
              src={currentVariant.images[0].url}
              alt={currentVariant.title}
              fill
              className="object-cover mix-blend-multiply hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>

    {/* Premium Color Variant Selector */}
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
      <div className="flex gap-3 bg-white/90 backdrop-blur-sm px-4 py-3 border-2 border-black shadow-[4px_4px_0_0_#000]">
        {product.variants.map((variant, variantIndex) => (
          <motion.button
            key={variant.id}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHoveredVariant({ productId: product.id, variantIndex })}
            onClick={() => product.variants.length > 1 && switchVariant(product.id, variantIndex)}
            className={`relative w-8 h-8 border-[3px] border-black transition-all duration-300 ${
              activeProducts[product.id] === variantIndex 
                ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' 
                : 'hover:scale-105'
            }`}
          >
            {activeProducts[product.id] === variantIndex && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>

    {/* Enhanced Price Tag with Animation */}
    <motion.div 
      className="absolute top-6 right-6 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-3 border-2 border-black font-black text-sm uppercase shadow-[4px_4px_0_0_#000]"
      whileHover={{ scale: 1.05, rotate: 2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex flex-col items-center">
        <span className="text-lg leading-none">{currentPriceInfo.price} MAD</span>
        {currentPriceInfo.originalPrice && (
          <span className="text-xs line-through opacity-80">
            {currentPriceInfo.originalPrice} MAD
          </span>
        )}
      </div>
    </motion.div>

    {/* Quick Actions Overlay */}
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
      <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-white text-black px-4 py-3 border-2 border-black font-bold text-sm hover:bg-black hover:text-white transition-all duration-300 shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000]"
        >
          <Eye className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-white text-black px-4 py-3 border-2 border-black font-bold text-sm hover:bg-black hover:text-white transition-all duration-300 shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000]"
        >
          <Heart className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  </div>

  {/* Enhanced Content Section */}
  <div className="p-8 bg-white relative">
    {/* Stock Level Indicator */}
    <div className="absolute -top-3 left-8 right-8">
      <div className="bg-gray-200 h-1 border border-black">
        <div 
          className="bg-green-500 h-full border-r border-black"
         // style={{ width: `${(stats.totalStock / stats.maxStock) * 100}%` }}
        />
      </div>
    </div>

    <div className="mb-4 flex items-center gap-3">
      <span className="bg-black text-white px-3 py-1 text-xs font-black uppercase tracking-wider">
        {product.categories[0]?.category.name || 'PREMIUM'}
      </span>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    </div>
    
    <h3 className="text-sm font-black text-black uppercase mb-3 leading-tight tracking-tight group-hover:text-gray-800 transition-colors duration-300">
      {currentVariant.title}
    </h3>
    
    <p className="text-gray-600 mb-6 text-sm uppercase tracking-widest font-medium border-l-2 border-black pl-3">
      {currentVariant.name}
    </p>


    {/* Enhanced CTA Section */}
    <div className="flex items-center justify-between pt-4 border-t-2 border-black">
      <div className="flex flex-col">
        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">
          {stats.totalStock} LEFT
        </div>
        <div className="text-[10px] text-gray-400 uppercase">
          Free shipping
        </div>
      </div>
    
    </div>

    {/* Quick Stats */}
    <div className="flex gap-4 mt-4 text-xs text-gray-500 hidden">
      <div className="flex items-center gap-1">
        <Truck className="w-3 h-3" />
        <span>2-day delivery</span>
      </div>
      <div className="flex items-center gap-1">
        <Shield className="w-3 h-3" />
        <span>1yr warranty</span>
      </div>
    </div>
  </div>
</div>
             
              </motion.div>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/products">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl border-2 border-white shadow-2xl cursor-pointer group hover:shadow-3xl transition-all duration-300"
            >
              <span className="font-black text-lg">VIEW ALL PRODUCTS</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}