// QtyPicker.tsx - Updated with Hero Theme
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Sparkles } from 'lucide-react';

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
      whileHover={{ scale: 1.02, y: -1 }}
      className="inline-flex items-center rounded-2xl border-3 border-gray-300 bg-white overflow-hidden shadow-lg shadow-black/10"
    >
      <motion.button
        whileHover={{ 
          scale: isAtMin ? 1 : 1.1, 
          backgroundColor: isAtMin ? "transparent" : "rgba(0, 0, 0, 0.05)" 
        }}
        whileTap={{ scale: isAtMin ? 1 : 0.9 }}
        type="button"
        onClick={dec}
        disabled={isAtMin}
        className={`p-4 transition-all duration-300 flex items-center justify-center border-r border-gray-200 ${
          isAtMin 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-700 hover:text-black hover:bg-gray-100'
        }`}
      >
        <Minus className="w-5 h-5" />
      </motion.button>
      
      <div className="relative">
        <motion.input
          key={value}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="w-16 text-center bg-transparent outline-none font-black text-lg text-black py-4"
          value={value}
          onChange={e => {
            const v = parseInt(e.target.value || '1', 10);
            if (!Number.isNaN(v)) setValue(Math.max(1, Math.min(max, v)));
          }}
        />
        
        {/* Sparkle effect on change - Updated to yellow */}
        <AnimatePresence>
          {value > 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <motion.button
        whileHover={{ 
          scale: isAtMax ? 1 : 1.1, 
          backgroundColor: isAtMax ? "transparent" : "rgba(0, 0, 0, 0.05)" 
        }}
        whileTap={{ scale: isAtMax ? 1 : 0.9 }}
        type="button"
        onClick={inc}
        disabled={isAtMax}
        className={`p-4 transition-all duration-300 flex items-center justify-center border-l border-gray-200 ${
          isAtMax 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-700 hover:text-black hover:bg-gray-100'
        }`}
      >
        <Plus className="w-5 h-5" />
      </motion.button>

      {/* Max limit indicator - Updated theme */}
      <AnimatePresence>
        {isAtMax && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border border-white shadow-lg"
          >
            <span className="text-[10px] text-white font-black">!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced visual feedback for interactions */}
      <AnimatePresence>
        {!isAtMin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -bottom-1 left-4 w-2 h-2 bg-yellow-500 rounded-full"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}