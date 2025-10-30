'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

export default function QtyPicker({ value, setValue, max = 99 }: { value: number, setValue: (n: number) => void, max?: number }) {
  function dec() { 
    setValue(Math.max(1, value - 1));
  }
  
  function inc() { 
    setValue(Math.min(max, value + 1));
  }

  const isAtMax = value >= max;
  const isAtMin = value <= 1;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className="inline-flex items-center rounded-2xl border-2 border-gray-200 bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <motion.button
        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={dec}
        disabled={isAtMin}
        className={`p-4 transition-all duration-300 flex items-center justify-center border-r border-gray-200 ${
          isAtMin 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-600 hover:text-black hover:bg-gray-50'
        }`}
      >
        <Minus className="w-5 h-5" />
      </motion.button>
      
      <div className="relative">
        <motion.input
          key={value}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="w-16 text-center bg-transparent outline-none font-semibold text-gray-900 py-4 text-lg"
          value={value}
          onChange={e => {
            const v = parseInt(e.target.value || '1', 10);
            if (!Number.isNaN(v)) setValue(Math.max(1, Math.min(max, v)));
          }}
        />
        
        {/* Value change indicator */}
        <AnimatePresence>
          {value > 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white shadow-lg"
            />
          )}
        </AnimatePresence>
      </div>
      
      <motion.button
        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={inc}
        disabled={isAtMax}
        className={`p-4 transition-all duration-300 flex items-center justify-center border-l border-gray-200 ${
          isAtMax 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-600 hover:text-black hover:bg-gray-50'
        }`}
      >
        <Plus className="w-5 h-5" />
      </motion.button>

      {/* Max limit indicator */}
      <AnimatePresence>
        {isAtMax && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
          >
            <span className="text-[8px] text-white font-bold">!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full ${
            value >= max * 0.8 
              ? 'bg-red-500' 
              : value >= max * 0.5 
              ? 'bg-amber-500'
              : 'bg-green-500'
          }`}
        />
      </div>
    </motion.div>
  );
}