// components/admin/low-stock-alert.tsx
'use client';

import { motion } from 'framer-motion';

interface LowStockItem {
  id: string;
  size: string;
  sku: string;
  stockQty: number;
  variant: {
    title: string;
  };
}

interface LowStockAlertProps {
  lowStock: LowStockItem[];
}

export function LowStockAlert({ lowStock }: LowStockAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-700/50 p-6"
    >
      <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-4 flex items-center">
        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
        Low Stock Alert
      </h3>
      <div className="space-y-3">
        {lowStock.length === 0 ? (
          <p className="text-amber-800/70 dark:text-amber-300/70 text-sm">All products are well stocked! 🎉</p>
        ) : (
          lowStock.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-900/30 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-200 text-sm">
                  {s.variant.title}
                </p>
                <p className="text-amber-700/70 dark:text-amber-400/70 text-xs">
                  Size {s.size} • SKU {s.sku}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                  {s.stockQty} left
                </p>
                <p className="text-amber-700/70 dark:text-amber-400/70 text-xs">
                  {s.stockQty === 0 ? 'Out of stock' : 'Low stock'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}