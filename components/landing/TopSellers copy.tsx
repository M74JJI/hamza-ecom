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
  TrendingUp
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
  color: string;
  variantStyleImg: string;
  shortDescription: string;
  contentHtml: string;
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
                {/* Product Card */}
     <div className="relative bg-white border-4 border-black rounded-none overflow-hidden group hover:rotate-1 transition-transform duration-500 shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000]">
  
  {/* Image Container */}
  <div className="relative h-80 bg-yellow-100 overflow-hidden border-b-4 border-black">
    <AnimatePresence mode="wait">
      {(hoveredVariant?.productId === product.id && product.variants[hoveredVariant.variantIndex]) ? (
        <motion.div
          key={`hover-${product.variants[hoveredVariant.variantIndex].id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {product.variants[hoveredVariant.variantIndex].images[0] && (
            <Image
              src={product.variants[hoveredVariant.variantIndex].images[0].url}
              alt={product.variants[hoveredVariant.variantIndex].title}
              fill
              className="object-cover mix-blend-multiply"
            />
          )}
        </motion.div>
      ) : (
        <motion.div
          key={currentVariant.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {currentVariant.images[0] && (
            <Image
              src={currentVariant.images[0].url}
              alt={currentVariant.title}
              fill
              className="object-cover mix-blend-multiply"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>

    {/* Brutalist Variant Selector */}
    <div className="absolute bottom-4 left-4 right-4">
      <div className="flex gap-1 justify-center">
        {product.variants.map((variant, variantIndex) => (
          <button
            key={variant.id}
            onMouseEnter={() => setHoveredVariant({ productId: product.id, variantIndex })}
            onClick={() => product.variants.length > 1 && switchVariant(product.id, variantIndex)}
            className={`w-10 h-2 border-2 border-black transition-all duration-300 ${
              activeProducts[product.id] === variantIndex 
                ? 'bg-black scale-110' 
                : 'bg-white hover:bg-gray-300'
            }`}
            style={{ backgroundColor: activeProducts[product.id] === variantIndex ? variant.color : undefined }}
          />
        ))}
      </div>
    </div>

    {/* Price Tag */}
    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 border-2 border-black text-sm font-bold">
      {currentPriceInfo.price} MAD
    </div>
  </div>

  {/* Content */}
  <div className="p-6 bg-white">
    <div className="mb-2">
      <span className="bg-black text-white px-2 py-1 text-xs font-bold inline-block">
        {product.categories[0]?.category.name || 'PRODUCT'}
      </span>
    </div>
    
    <h3 className="text-sm font-black uppercase mb-2 leading-tight">
      {currentVariant.title}
    </h3>
    
    <p className="text-gray-600 mb-4 text-sm uppercase tracking-wide">
      {currentVariant.name}
    </p>

    <div className="flex items-center justify-between">
      <div className="text-xs text-gray-500 uppercase">
        {stats.totalStock} IN STOCK
      </div>
      
      <button className="bg-black text-white px-6 py-3 font-bold text-sm border-2 border-black hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2">
        <ShoppingBag className="w-4 h-4" />
        BUY NOW
      </button>
    </div>
  </div>
</div>
                {/* Quick View on Hover */}
                <AnimatePresence>
                  {hoveredProduct === product.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-20"
                    >
                      <Link href={`/products/${product.slug}`}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl border-2 border-white shadow-2xl cursor-pointer"
                        >
                          <span className="font-bold text-sm">QUICK VIEW</span>
                        </motion.div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
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