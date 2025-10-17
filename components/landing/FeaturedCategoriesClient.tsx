// components/landing/FeaturedCategoriesClient.tsx (Client Component)
'use client';
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Sparkles } from "lucide-react";

interface FeaturedCategoriesClientProps {
  categories: {
    id: string;
    name: string;
  }[];
}

export function FeaturedCategoriesClient({ categories }: FeaturedCategoriesClientProps) {
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
        
        {/* Additional floating elements */}
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
            <Zap className="w-4 h-4" />
            <span className="font-black text-sm">EXPLORE COLLECTIONS</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            <span className="text-gray-900">SHOP BY</span>
            <br />
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              CATEGORY
            </span>
          </h2>
          
          <p className="text-lg text-gray-700 max-w-2xl mx-auto font-medium">
            Discover our carefully curated collections designed for every style and occasion
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-3 gap-6 relative z-10">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.2, duration: 0.8, type: "spring" }}
              whileHover={{ scale: 1.05, y: -8 }}
              className="group relative"
            >
              <Link 
                href={`/products?category=${cat.id}`}
                className="block relative h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-amber-50 border-4 border-orange-200 shadow-2xl hover:shadow-3xl transition-all duration-500"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(251,146,60,0.1)_25%,rgba(251,146,60,0.1)_50%,transparent_50%,transparent_75%,rgba(251,146,60,0.1)_75%)] bg-[length:10px_10px] opacity-30" />
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
                  {/* Icon Placeholder */}
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl border-2 border-white shadow-lg flex items-center justify-center mb-4 group-hover:shadow-xl transition-all duration-300"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className="text-2xl font-black text-gray-900 group-hover:text-white transition-colors duration-300 mb-2"
                  >
                    {cat.name}
                  </motion.span>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-sm font-bold text-gray-600 group-hover:text-white transition-colors duration-300"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-red-500/90 to-orange-500/90 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                {/* Border Glow Effect */}
                <div className="absolute inset-0 border-4 border-transparent group-hover:border-orange-300 rounded-2xl transition-all duration-500" />
                
                {/* Corner Decorations */}
                <div className="absolute top-4 left-4 w-6 h-6 bg-red-400 border-2 border-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 right-4 w-4 h-4 bg-orange-400 border-2 border-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>

              {/* Floating Label */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.3, duration: 0.6 }}
                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
              >
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg border-2 border-white shadow-lg">
                  <span className="font-bold text-sm">SHOP NOW</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/categories">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl border-2 border-white shadow-2xl cursor-pointer group hover:shadow-3xl transition-all duration-300"
            >
              <span className="font-black text-lg">VIEW ALL CATEGORIES</span>
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
