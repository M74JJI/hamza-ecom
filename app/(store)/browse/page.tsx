'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/store/ProductCard';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter, SortAsc, Grid3X3, List, Sparkles,
  Zap, ArrowRight, ChevronDown, X, SlidersHorizontal,
  Tag, Truck, Award, Shield
} from 'lucide-react';

const COLORS = {
  primary: {
    bg: 'bg-black',
    text: 'text-white',
    hover: 'hover:bg-gray-800',
    border: 'border-black'
  },
  secondary: {
    bg: 'bg-white',
    text: 'text-gray-800',
    hover: 'hover:bg-gray-50',
    border: 'border-gray-300'
  },
  accent: {
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    hover: 'hover:bg-blue-700',
    border: 'border-blue-600'
  }
} as const;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<any>({});
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categoryNameMap, setCategoryNameMap] = useState<Record<string, string>>({});

  const q = searchParams.get('q') || '';
  const sortOptions = [
    { value: 'newest', label: 'New Arrivals', icon: Sparkles },
    { value: 'popular', label: 'Most Popular', icon: Zap },
    { value: 'rating', label: 'Top Rated', icon: Award },
    { value: 'price-asc', label: 'Price: Low to High', icon: SortAsc },
    { value: 'price-desc', label: 'Price: High to Low', icon: SortAsc },
  ];

useEffect(() => {
  // Build initial filters from URL params
  const initialFilters: any = {};

  const urlCategory = searchParams.getAll('category');
  const urlBrand = searchParams.getAll('brand');
  const urlColor = searchParams.getAll('color');
  const urlSize = searchParams.getAll('size');
  const urlMin = searchParams.get('min');
  const urlMax = searchParams.get('max');
  const urlRating = searchParams.get('rating');
  const urlSort = searchParams.get('sort');

  if (urlCategory.length) initialFilters.category = urlCategory;
  if (urlBrand.length) initialFilters.brand = urlBrand;
  if (urlColor.length) initialFilters.color = urlColor;
  if (urlSize.length) initialFilters.size = urlSize;
  if (urlMin) initialFilters.min = Number(urlMin);
  if (urlMax) initialFilters.max = Number(urlMax);
  if (urlRating) initialFilters.rating = Number(urlRating);
  if (urlSort) initialFilters.sort = urlSort;

  setFilters(initialFilters);
}, [searchParams]);


  /* ---------------------- Data Fetch ---------------------- */
  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();

    if (q) params.set('q', q);
    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
      else if (value !== undefined && value !== '') params.set(key, String(value));
    }

    const res = await fetch(`/api/search?${params.toString()}`, { cache: 'no-store' });
    const json = await res.json();
    setData(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [q, filters]);

  /* ---------------------- Fetch Category Names ---------------------- */
  useEffect(() => {
    const loadMap = async () => {
      try {
        const res = await fetch('/api/filters', { cache: 'no-store' });
        const json = await res.json();
        setCategoryNameMap(json.categoryNameMap || {});
      } catch (err) {
        console.error('Failed to load category map:', err);
      }
    };
    loadMap();
  }, []);

  /* ---------------------- Render ---------------------- */
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 gap-4">
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl sm:text-4xl font-light text-gray-800"
              >
                {q ? `"${q}"` : 'Curated Collection'}
              </motion.h1>
              {!loading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-600 text-lg"
                >
                  Discover {data.length} exquisite {data.length === 1 ? 'piece' : 'pieces'}
                </motion.p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* View Mode */}
              <div className="flex bg-white rounded-xl border border-gray-200 p-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Filter Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </motion.button>

              {/* Sort Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 hover:text-gray-800 transition-colors bg-white"
                >
                  <SortAsc className="w-4 h-4" />
                  Sort
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      sortOpen ? 'rotate-180' : ''
                    }`}
                  />
                </motion.button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50"
                    >
                      {sortOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <motion.button
                            key={option.value}
                            whileHover={{ backgroundColor: '#f8fafc' }}
                            onClick={() => {
                              setFilters((prev: any) => ({
                                ...prev,
                                sort: option.value,
                              }));
                              setSortOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm hover:text-gray-800 transition-colors flex items-center gap-3 ${
                              filters.sort === option.value
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-700'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {option.label}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------- Main ---------------------- */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8">
<FilterSidebar
  onChange={(update) => setFilters(update)}
/>

            </div>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                  onClick={() => setShowFilters(false)}
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 lg:hidden shadow-2xl flex flex-col"
                >
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
                      <p className="text-sm text-gray-600">Refine your search</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowFilters(false)}
                      className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <FilterSidebar
                      onChange={(update) =>
                        setFilters((prev: any) => ({ ...prev, ...update }))
                      }
                    />
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-white">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowFilters(false)}
                      className={`w-full ${COLORS.primary.bg} ${COLORS.primary.text} py-4 rounded-xl font-semibold text-lg ${COLORS.primary.hover} transition-colors flex items-center justify-center gap-3 shadow-lg`}
                    >
                      Show Results
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product Section */}
          <section className="flex-1">
            {/* Active Filters */}
            {Object.keys(filters).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 mb-6"
              >
                {Object.entries(filters).map(([key, val]) => {
                  if (!val) return null;
                  const vals = Array.isArray(val) ? val : [val];
                  return vals.map((v) => (
                    <motion.div
                      key={`${key}-${v}`}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200"
                    >
                      <span className="capitalize">{key}:</span>
                      <span>
                        {key === 'category'
                          ? categoryNameMap[v] || v
                          : String(v)}
                      </span>
                      <button
                        onClick={() =>
                          setFilters((prev: any) => {
                            const updated = { ...prev };
                            if (Array.isArray(updated[key])) {
                              updated[key] = updated[key].filter(
                                (item: string) => item !== v
                              );
                              if (updated[key].length === 0)
                                delete updated[key];
                            } else delete updated[key];
                            return updated;
                          })
                        }
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        ×
                      </button>
                    </motion.div>
                  ));
                })}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setFilters({})}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1.5 hover:bg-gray-50 rounded-full transition-colors"
                >
                  Clear all
                </motion.button>
              </motion.div>
            )}

            {/* Trust Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              {[
                { icon: Truck, label: "Free Shipping", desc: "Over 500 MAD", color: "text-blue-600" },
                { icon: Award, label: "2-Year Warranty", desc: "Quality Guaranteed", color: "text-yellow-600" },
                { icon: Shield, label: "Secure Payment", desc: "SSL Protected", color: "text-green-600" },
                { icon: Tag, label: "Best Price", desc: "Price Match", color: "text-purple-600" },
              ].map((feature) => (
                <motion.div
                  key={feature.label}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <feature.icon className={`w-6 h-6 ${feature.color} mx-auto mb-2`} />
                  <div className="font-semibold text-gray-800 text-sm">{feature.label}</div>
                  <div className="text-gray-600 text-xs">{feature.desc}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Products */}
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-[3/4] rounded-2xl mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </motion.div>
            ) : data.length ? (
              <motion.div
                layout
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                <AnimatePresence>
                  {data.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                      layout
                    >
                      <ProductCard product={p} viewMode={viewMode} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  No products found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto text-lg mb-6">
                  Try adjusting your search criteria or browse different
                  categories.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilters({})}
                  className="px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg"
                >
                  Reset Filters
                </motion.button>
              </motion.div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
