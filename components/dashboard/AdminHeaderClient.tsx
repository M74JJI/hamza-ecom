'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, User, ShoppingCart, TrendingUp, Moon, Sun } from "lucide-react";

export function AdminHeaderClient({
  user,
  stats,
}: {
  user: any;
  stats: {
    revenue: string;
    pending: string; // ✅ add this line
    orders: number;
    products: number;
    growth: string;
  };
}) {

  const [darkMode, setDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

const hoverSpring = { type: "spring", stiffness: 400, damping: 25 } as const;


  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-b border-white/20 dark:border-gray-700/30 shadow-lg shadow-blue-500/5 dark:shadow-blue-900/10">
      <div className="flex items-center justify-between p-6 lg:p-8">
        {/* Left Section */}
        <motion.div 
          className="flex items-center space-x-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Page Title */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Welcome back, {user?.name ?? 'Admin'} 👋
            </p>
          </div>

          {/* Quick Stats */}
          <div className="hidden lg:flex items-center space-x-6">
        {/* Confirmed Revenue */}
  <motion.div whileHover={{ scale: 1.02 }} transition={hoverSpring}>
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          MAD {stats.revenue}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Confirmed Revenue</p>
      </div>
    </div>
  </motion.div>

  {/* Pending Revenue */}
  <motion.div whileHover={{ scale: 1.02 }} transition={hoverSpring}>
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          MAD {stats.pending}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Pending Revenue</p>
      </div>
    </div>
  </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} transition={hoverSpring}>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{stats.orders}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} transition={hoverSpring}>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">{stats.growth}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Growth</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Section — simplified for brevity */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/30"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </motion.button>

          {/* Profile */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 px-3 py-2 rounded-2xl border border-white/20 dark:border-gray-700/30"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name ?? 'Admin'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
