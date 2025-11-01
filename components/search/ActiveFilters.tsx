'use client';
import { motion } from "framer-motion";

interface ActiveFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
}

export function ActiveFilters({ filters, setFilters }: ActiveFiltersProps) {
  if (Object.keys(filters).length === 0) return null;

  return (
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
            <span className="capitalize">
              {key === 'q' ? 'Search' : key}:
            </span>
            <span>{key === 'q' ? `"${v}"` : String(v)}</span>
            <button
              onClick={() =>
                setFilters((prev: any) => {
                  const updated = { ...prev };
                  if (key === 'q') {
                    delete updated.q;
                  } else if (Array.isArray(updated[key])) {
                    updated[key] = updated[key].filter((item: string) => item !== v);
                    if (updated[key].length === 0) delete updated[key];
                  } else {
                    delete updated[key];
                  }
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
  );
}