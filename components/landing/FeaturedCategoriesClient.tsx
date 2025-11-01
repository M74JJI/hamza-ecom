'use client';
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Sparkles } from "lucide-react";
import Image from "next/image";

interface FeaturedCategoriesClientProps {
  categories: {
    id: string;
    name: string;
    imageUrl: string | null;
  }[];
}

export function FeaturedCategoriesClient({ categories }: FeaturedCategoriesClientProps) {
  // Performance optimizations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const
      }
    }
  };

  const hoverVariants = {
    hover: {
      scale: 1.02,
      y: -4,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-16 overflow-hidden w-full mx-auto">
      {/* Simplified background - removed continuous animations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-16 h-16 bg-red-500/10 rotate-45" />
        <div className="absolute bottom-10 left-10 w-12 h-12 bg-orange-500/10 -rotate-12" />
        <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-yellow-500/10 rounded-full" />
      </div>

      <div className="container mx-auto relative z-10 px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg border-2 border-white shadow-lg mb-4"
          >
            <Zap className="w-4 h-4" />
            <span className="font-black text-sm">EXPLORE COLLECTIONS</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid lg:grid-cols-3 gap-6 relative z-10 mb-16"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover="hover"
              className="group relative"
            >
              <Link
                href={`/browse?category=${category.id}`}
                className="block relative h-80 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md border border-stone-300/50 shadow-lg hover:shadow-xl transition-all duration-300"
                prefetch={false}
              >
                {/* Image Container */}
                <div className="relative h-3/4 overflow-hidden">
                  <div className="w-full h-full relative">
                    <Image
                      src={category.imageUrl || "/placeholder.jpg"}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 3} // Only prioritize first 3 images
                    />
                  </div>
                  
                  {/* Static overlays */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-orange-500/5 mix-blend-overlay" />
                  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-stone-900/95 via-stone-900/50 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-700 px-3 py-1.5 rounded-full border border-amber-300/30 shadow-lg">
                    <span className="text-white font-black text-xs tracking-wider">{category.name}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black text-white mb-1 tracking-wide">
                        {category.name}
                      </h3>
                      <div className="flex items-center gap-2 text-amber-300">
                        <span className="text-sm font-medium tracking-wide">Explore Collection</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center border border-amber-300/30 flex-shrink-0 hover:from-amber-600 hover:to-amber-800 transition-all duration-300 shadow-lg group-hover:scale-110">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link href="/browse">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg border-2 border-white shadow-lg cursor-pointer group hover:shadow-xl transition-all duration-300">
              <span className="font-black text-base">VIEW ALL CATEGORIES</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}