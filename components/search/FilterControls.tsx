'use client';
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, SortAsc, Grid3X3, List, ChevronDown, Sparkles, Zap, Award } from "lucide-react";

interface FilterControlsProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  sortOpen: boolean;
  setSortOpen: (open: boolean) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  filters: any;
  setFilters: (filters: any) => void;
  dataLength: number;
}

const sortOptions = [
  { value: 'newest', label: 'New Arrivals', icon: Sparkles },
  { value: 'popular', label: 'Most Popular', icon: Zap },
  { value: 'rating', label: 'Top Rated', icon: Award },
  { value: 'price-asc', label: 'Price: Low to High', icon: SortAsc },
  { value: 'price-desc', label: 'Price: High to Low', icon: SortAsc },
];

export function FilterControls({
  showFilters,
  setShowFilters,
  sortOpen,
  setSortOpen,
  viewMode,
  setViewMode,
  filters,
  setFilters,
  dataLength
}: FilterControlsProps) {
  
  const activeFilterCount = Object.keys(filters).reduce((count, key) => {
    if (key === 'q') return count;
    const val = filters[key];
    return count + (Array.isArray(val) ? val.length : 1);
  }, 0);

  return (
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

      {/* Mobile Filter Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowFilters(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filter
        {activeFilterCount > 0 && (
          <span className="bg-white text-black w-5 h-5 rounded-full text-xs flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </motion.button>

      {/* Desktop Filter Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowFilters(true)}
        className="hidden lg:flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg"
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
          className="text-gray-700 flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 hover:text-gray-800 transition-colors bg-white"
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
  );
}