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
import ProductCard from '../store/ProductCard';

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
  products: {
    id: string;
    slug: string;
    brand: string;
    avgRating?: number;
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
  }[];
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
      {/* Background Elements - PERFORMANCE OPTIMIZED */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 w-16 h-16 bg-red-500/10 rotate-45"
          animate={{ rotate: [45, 90, 45] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }} // Slower duration
        />
        <motion.div
          className="absolute bottom-10 left-10 w-12 h-12 bg-orange-500/10 -rotate-12"
          animate={{ scale: [1, 1.1, 1] }} // Reduced scale change
          transition={{ duration: 20, repeat: Infinity }} // Slower duration
        />
        
        {/* Floating Elements - PERFORMANCE OPTIMIZED */}
        <motion.div
          className="absolute top-1/3 left-1/4 w-8 h-8 bg-yellow-500/10 rounded-full"
          animate={{
            y: [0, -10, 0], // Reduced movement
            opacity: [0.3, 0.5, 0.3], // Reduced opacity change
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }} // Slower duration
        />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section Header - PERFORMANCE OPTIMIZED */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} // Faster duration
          viewport={{ once: true }} // Only animate once
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }} // Faster duration
            viewport={{ once: true }} // Only animate once
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
          {products.slice(0, 8).map((p,i)=>
           <ProductCard product={p}/>
          )}
        </div>

        {/* View All Button - PERFORMANCE OPTIMIZED */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }} // Faster duration
          viewport={{ once: true }} // Only animate once
          className="text-center mt-12"
        >
          <Link href="/products">
            <motion.div
              whileHover={{ scale: 1.03, y: -1 }} // Reduced hover effect
              whileTap={{ scale: 0.98 }} // Reduced tap effect
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl border-2 border-white shadow-2xl cursor-pointer group hover:shadow-3xl transition-all duration-300"
            >
              <span className="font-black text-lg">VIEW ALL PRODUCTS</span>
              <motion.div
                animate={{ x: [0, 3, 0] }} // Reduced movement
                transition={{ duration: 3, repeat: Infinity }} // Slower duration
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