'use client';
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { FilterSidebar } from "./FilterSidebar";

const COLORS = {
  primary: {
    bg: 'bg-black',
    text: 'text-white',
    hover: 'hover:bg-gray-800',
  }
} as const;

interface MobileFilterSheetProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: any;
  setFilters: (filters: any) => void;
  dataLength: number;
}

export function MobileFilterSheet({ 
  showFilters, 
  setShowFilters, 
  filters, 
  setFilters, 
  dataLength 
}: MobileFilterSheetProps) {
  return (
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
            {/* Header */}
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

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto">
              <FilterSidebar
                onChange={(update) =>
                  setFilters((prev: any) => ({ ...prev, ...update }))
                }
              />
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-white">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(false)}
                className={`w-full ${COLORS.primary.bg} ${COLORS.primary.text} py-4 rounded-xl font-semibold text-lg ${COLORS.primary.hover} transition-colors flex items-center justify-center gap-3 shadow-lg`}
              >
                Show {dataLength} Results
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}