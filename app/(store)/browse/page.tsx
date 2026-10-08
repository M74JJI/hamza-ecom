'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import ProductCard from '@/components/store/ProductCard';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter, SortAsc, Grid3X3, List, Sparkles,
  Zap, ArrowRight, ChevronDown, X, SlidersHorizontal,
  Tag, Truck, Award, Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FilterControls } from '@/components/search/FilterControls';
import { MobileFilterSheet } from '@/components/search/MobileFilterSheet';


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
  const router = useRouter();
const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSearchParams = useRef(searchParams);
  const [filters, setFilters] = useState<any>({});
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categoryNameMap, setCategoryNameMap] = useState<Record<string, string>>({});
const [isHydrated, setIsHydrated] = useState(false);

 const q = searchParams.get('q') || '';

  const sortOptions = [
    { value: 'newest', label: 'New Arrivals', icon: Sparkles },
    { value: 'popular', label: 'Most Popular', icon: Zap },
    { value: 'rating', label: 'Top Rated', icon: Award },
    { value: 'price-asc', label: 'Price: Low to High', icon: SortAsc },
    { value: 'price-desc', label: 'Price: High to Low', icon: SortAsc },
  ];

useEffect(() => {
  const initialFilters: any = {};

  const params = initialSearchParams.current;
  const urlCategory = params.getAll('category');
  const urlBrand = params.getAll('brand');
  const urlColor = params.getAll('color');
  const urlSize = params.getAll('size');
  const urlMin = params.get('min');
  const urlMax = params.get('max');
  const urlRating = params.get('rating');
  const urlSort = params.get('sort');
  const urlQ = params.get('q');
  const urlPage = params.get('page');

  if (urlCategory.length) initialFilters.category = urlCategory;
  if (urlBrand.length) initialFilters.brand = urlBrand;
  if (urlColor.length) initialFilters.color = urlColor;
  if (urlSize.length) initialFilters.size = urlSize;
  if (urlMin) initialFilters.min = Number(urlMin);
  if (urlMax) initialFilters.max = Number(urlMax);
  if (urlRating) initialFilters.rating = Number(urlRating);
  if (urlSort) initialFilters.sort = urlSort;
  if (urlQ) initialFilters.q = urlQ;
  if (urlPage && Number.isInteger(Number(urlPage)) && Number(urlPage) > 1) {
    initialFilters.page = Number(urlPage);
  }

  setFilters(initialFilters);
    setIsHydrated(true); // ✅ mark ready
}, []); // 👈 run once only



  /* ---------------------- Data Fetch ---------------------- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();

for (const [key, value] of Object.entries(filters)) {
  if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
  else if (value !== undefined && value !== '') params.set(key, String(value));
}


    try {
      const res = await fetch(`/api/search?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();

      if (!res.ok) {
        setData([]);
        setTotal(0);
        setTotalPages(0);
        return;
      }

      setData(json.data || []);
      setTotal(Number(json.total) || 0);
      setTotalPages(Number(json.totalPages) || 0);
    } finally {
      setLoading(false);
    }
  }, [filters]);
useEffect(() => {
   if (!isHydrated) return;
  fetchData();
  // Sync URL with filters
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (Array.isArray(val)) val.forEach((v) => params.append(key, v));
    else if (val !== undefined && val !== '') params.set(key, String(val));
  });
  const query = params.toString();
  router.replace(query ? `${pathname}?${query}` : pathname);
}, [fetchData, filters, isHydrated, pathname, router]);



// 🧠 Detect q changes from URL (e.g., when navigating from another page)
useEffect(() => {
  const qParam = searchParams.get('q');

  setFilters((prev: any) => {
    const updated = { ...prev };

    // If q exists in the URL, apply it
    if (qParam && qParam.trim() !== '') {
      if (prev.q === qParam) return prev; // no change
      updated.q = qParam;
      updated.page = 1;
    } else {
      // if q is missing from URL but was previously set, remove it
      if (!prev.q) return prev;
      delete updated.q;
      updated.page = 1;
    }

    return updated;
  });
}, [searchParams]);


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
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 gap-4">
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-950"
              >
                {q ? `"${q}"` : 'Our Products'}
              </motion.h1>
              {!loading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-600 text-lg"
                >
                  {total} {total === 1 ? 'product' : 'products'} available
                </motion.p>
              )}
            </div>
 {/* Filter Controls */}
            <FilterControls
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              sortOpen={sortOpen}
              setSortOpen={setSortOpen}
              viewMode={viewMode}
              setViewMode={setViewMode}
              filters={filters}
              setFilters={setFilters}
              dataLength={total}
            />
          </div>
        </div>
      </div>

      {/* ---------------------- Main ---------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
        {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8">
              <FilterSidebar
                initialFilters={filters}
                onChange={(update) =>
                  setFilters((prev: any) => {
                    const next = { ...prev };
                    for (const key of ['category', 'brand', 'color', 'size', 'min', 'max', 'rating']) {
                      delete next[key];
                    }
                    Object.assign(next, update);
                    next.page = 1;
                    return next;
                  })
                }
              />
            </div>
          </div>

          {/* Mobile Filter Sheet */}
          <MobileFilterSheet
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            filters={filters}
            setFilters={setFilters}
            dataLength={total}
          />

          {/* Product Section */}
          <section className="flex-1">
            {/* Active Filters */}
            {Object.keys(filters).some((key) => key !== 'sort' && key !== 'page') && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 mb-6"
              >
            {Object.entries(filters).map(([key, val]) => {
  if (key === 'sort' || key === 'page' || !val) return null;
  const vals = Array.isArray(val) ? val : [val];
  return vals.map((v) => (
    <motion.div
      key={`${key}-${v}`}
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200"
    >
      <span className="capitalize">
        {key === 'q' ? 'Search' : key}:
      </span>
      <span>
  {key === 'category'
    ? categoryNameMap[v] || v   // 👈 show name if known
    : key === 'q'
      ? `"${v}"`
      : String(v)}
</span>
      <button
        onClick={() =>
          setFilters((prev: any) => {
            const updated = { ...prev };
            if (key === 'q') {
              delete updated.q; // remove q from filters
            } else if (Array.isArray(updated[key])) {
              updated[key] = updated[key].filter((item: string) => item !== v);
              if (updated[key].length === 0) delete updated[key];
            } else {
              delete updated[key];
            }
            updated.page = 1;
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
                    <div className="bg-stone-100 aspect-[3/4] rounded-lg mb-3"></div>
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
                <h3 className="text-xl font-semibold text-stone-900 mb-3">
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
                  className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
                >
                  Reset Filters
                </motion.button>
              </motion.div>
            )}
            {!loading && totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={(Number(filters.page) || 1) <= 1}
                  onClick={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      page: Math.max(1, (Number(prev.page) || 1) - 1),
                    }))
                  }
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {Number(filters.page) || 1} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={(Number(filters.page) || 1) >= totalPages}
                  onClick={() =>
                    setFilters((prev: any) => ({
                      ...prev,
                      page: Math.min(totalPages, (Number(prev.page) || 1) + 1),
                    }))
                  }
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
