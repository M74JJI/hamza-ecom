// components/admin/sidebar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Folder, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  BarChart3,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  Bell,
  Search,
  Zap,
  Cloud,
  Database,
  Cpu,
  Rocket,
  Moon,
  Sun,
  LogOut,
  User,
  HelpCircle,
  Gift,
  TruckElectric
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { signOutAction } from '@/app/(store)/(auth)/actions';

const menuItems = [
  { 
    name: 'Overview', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    badge: null,
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    name: 'Categories', 
    href: '/dashboard/categories', 
    icon: Folder,
    badge: null,
    gradient: 'from-green-500 to-emerald-500'
  },
  { 
    name: 'Products', 
    href: '/dashboard/products', 
    icon: Package,
    badge: '12',
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    name: 'Orders', 
    href: '/dashboard/orders', 
    icon: ShoppingCart,
    badge: '3',
    gradient: 'from-orange-500 to-red-500'
  },
  { 
    name: 'Coupons', 
    href: '/dashboard/coupons', 
    icon: Gift,
    badge: '3',
    gradient: 'from-orange-500 to-red-500'
  },
  { 
    name: 'Shipping', 
    href: '/dashboard/shipping', 
    icon: TruckElectric,
    badge: '3',
    gradient: 'from-orange-500 to-red-500'
  },
  { 
    name: 'Customers', 
    href: '/dashboard/customers', 
    icon: Users,
    badge: null,
    gradient: 'from-indigo-500 to-blue-500'
  },
];

const quickActions = [
  { name: 'AI Insights', icon: Zap, color: 'text-yellow-500' },
  { name: 'Cloud Sync', icon: Cloud, color: 'text-blue-500' },
  { name: 'Backup', icon: Database, color: 'text-green-500' },
  { name: 'Performance', icon: Cpu, color: 'text-purple-500' },
];

export function AdminSidebar({user}:{user:any}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Spring-based values for smooth animations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 300 };
  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-15, 15]), springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sidebarRef.current) return;
    const rect = sidebarRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXValue = e.clientX - rect.left - width / 2;
    const mouseYValue = e.clientY - rect.top - height / 2;
    mouseX.set(mouseXValue);
    mouseY.set(mouseYValue);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Enhanced Mobile Overlay with blur */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        />
      </AnimatePresence>

      {/* Enhanced Sidebar with 3D tilt effect */}
      <motion.div
        ref={sidebarRef}
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50
          bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl
          border-r border-white/20 dark:border-gray-700/30
          transition-all duration-500 ease-in-out
          shadow-2xl shadow-blue-500/10 dark:shadow-blue-900/20
          overflow-hidden
        `}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        initial={false}
        animate={{ width: isCollapsed ? 80 : 320 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              initial={{
                x: Math.random() * 300,
                y: Math.random() * 600,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Header with enhanced design */}
        <motion.div 
          className="relative p-6 border-b border-white/20 dark:border-gray-700/30"
          style={{ transform: 'translateZ(20px)' }}
        >
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30"
                      animate={{ rotate: [0, 180, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                  <div>
                    <h1 className="font-bold text-gray-900 dark:text-white text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      HAMZA DASHBOARD
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                      System Online
                    </p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search Bar - Only visible when expanded */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 border-b border-white/20 dark:border-gray-700/30"
              style={{ transform: 'translateZ(15px)' }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl text-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions Grid */}
        <AnimatePresence>
          {!isCollapsed && !searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-4 border-b border-white/20 dark:border-gray-700/30"
              style={{ transform: 'translateZ(10px)' }}
            >
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-white/20 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all group"
                  >
                    <action.icon className={`w-4 h-4 ${action.color} mx-auto mb-1`} />
                    <span className="text-xs text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                      {action.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Navigation */}
        <nav className="p-4 space-y-1" style={{ transform: 'translateZ(5px)' }}>
          <AnimatePresence mode="popLayout">
            {filteredMenuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 30,
                    delay: searchQuery ? 0 : index * 0.1 
                  }}
                >
                  <Link
                    href={item.href}
                    className={`
                      relative flex items-center rounded-2xl p-3 transition-all duration-300 group overflow-hidden
                      ${isActive 
                        ? 'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white shadow-lg shadow-black/10' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50'
                      }
                    `}
                  >
                    {/* Animated gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    
                    {/* Active indicator with glow */}
                    {isActive && (
                      <>
                        <motion.div
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full shadow-lg shadow-blue-500/50"
                          layoutId="activeSidebar"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      </>
                    )}
                    
                    {/* Icon with gradient when active */}
                    <div className={`relative z-10 ${isActive ? `bg-gradient-to-r ${item.gradient} p-2 rounded-xl` : ''}`}>
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-current'}`} />
                    </div>
                    
                    {/* Text with smooth appearance */}
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="ml-3 font-medium text-sm flex-1"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Enhanced badge */}
                    {item.badge && !isCollapsed && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`
                          px-2 py-1 text-xs rounded-full font-bold backdrop-blur-sm border
                          ${isActive 
                            ? 'bg-white/20 text-white border-white/30' 
                            : 'bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-300/50 dark:border-gray-600/50'
                          }
                        `}
                      >
                        {item.badge}
                      </motion.span>
                    )}

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </nav>

        {/* Enhanced Footer with user menu */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 dark:border-gray-700/30 bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg"
          style={{ transform: 'translateZ(20px)' }}
        >
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-3"
              >
                {/* User profile */}
                <div className="flex items-center space-x-3 p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Administrator
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all"
                  >
                    {darkMode ? (
                      <Sun className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-gray-600" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all"
                  >
                    <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all"
                  >
                              <form action={signOutAction}>

                    <LogOut className="w-4 h-4 text-white" />
                              </form>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center space-y-2"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30"
                >
                  {darkMode ? (
                    <Sun className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-gray-600" />
                  )}
                </motion.button>
                
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}