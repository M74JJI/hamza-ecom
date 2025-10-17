'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Heart, 
  MessageSquare, 
  Shield, 
  LogOut,
  ChevronRight,
  Crown,
  Sparkles
} from 'lucide-react';

const links = [
  { 
    href: '/profile', 
    label: 'Overview', 
    icon: User,
    description: 'Account summary'
  },
  { 
    href: '/profile/orders', 
    label: 'Orders', 
    icon: ShoppingBag,
    description: 'Your purchases'
  },
  { 
    href: '/profile/addresses', 
    label: 'Addresses', 
    icon: MapPin,
    description: 'Delivery locations'
  },
  { 
    href: '/profile/wishlist', 
    label: 'Wishlist', 
    icon: Heart,
    description: 'Saved items'
  },
  { 
    href: '/profile/reviews', 
    label: 'Reviews', 
    icon: MessageSquare,
    description: 'Your feedback'
  },
  { 
    href: '/profile/security', 
    label: 'Security', 
    icon: Shield,
    description: 'Account protection'
  },
  { 
    href: '/profile/sessions', 
    label: 'Sessions', 
    icon: LogOut,
    description: 'Active logins'
  },
];

export default function ProfileNav(){
  const pathname = usePathname();
  
  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-2xl border-2 border-gray-300 rounded-2xl lg:rounded-3xl p-6 h-fit sticky top-24 shadow-2xl relative overflow-hidden"
    >
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl" />
      
      {/* Header with Premium Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 relative z-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800">Account</h2>
            <p className="text-gray-600 text-sm font-medium">Manage your profile</p>
          </div>
        </div>
        
        {/* Premium Status Badge */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full border-2 border-yellow-300 shadow-lg"
        >
          <Crown className="w-4 h-4 text-yellow-800" />
          <span className="text-yellow-900 font-black text-sm">PREMIUM MEMBER</span>
          <Sparkles className="w-3 h-3 text-yellow-700" />
        </motion.div>
      </motion.div>

      {/* Navigation Links */}
      <ul className="space-y-2 relative z-10">
        {links.map(({ href, label, icon: Icon, description }, index) => {
          const active = pathname === href || (href !== '/profile' && pathname?.startsWith(href));
          
          return (
            <motion.li
              key={href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <Link href={href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg'
                      : 'bg-white/50 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Icon Container */}
                      <motion.div
                        animate={active ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.5 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          active
                            ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      
                      {/* Text Content */}
                      <div>
                        <div className={`font-semibold text-base ${
                          active ? 'text-blue-700' : 'text-gray-800'
                        }`}>
                          {label}
                        </div>
                        <div className={`text-sm ${
                          active ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {description}
                        </div>
                      </div>
                    </div>
                    
                    {/* Active Indicator */}
                    <AnimatePresence>
                      {active && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Hover Arrow */}
                    {!active && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="w-6 h-6 text-gray-400"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Active Glow Effect */}
                  {active && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                    />
                  )}
                </motion.div>
              </Link>
            </motion.li>
          );
        })}
      </ul>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 pt-6 border-t border-gray-200 relative z-10"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-black text-gray-800">12</div>
            <div className="text-xs text-gray-600 font-medium">ORDERS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-gray-800">2Y</div>
            <div className="text-xs text-gray-600 font-medium">MEMBER</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Loyalty Level</span>
            <span>Gold Tier</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ delay: 1, duration: 1 }}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full relative"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white/30 rounded-full"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
      <div className="absolute bottom-4 left-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-1000" />
    </motion.nav>
  );
}