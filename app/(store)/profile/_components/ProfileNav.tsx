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
  Sparkles,
  Award,
  Star,
  Trophy
} from 'lucide-react';
// Loyalty system configuration
const LOYALTY_TIERS = {
  BRONZE: { 
    name: 'Bronze', 
    minOrders: 0, 
    color: 'from-amber-600 to-amber-700',
    bgColor: 'from-amber-50 to-amber-100',
    borderColor: 'border-amber-200',
    icon: Star,
    description: 'Getting started'
  },
  SILVER: { 
    name: 'Silver', 
    minOrders: 5, 
    color: 'from-gray-400 to-gray-500',
    bgColor: 'from-gray-50 to-gray-100',
    borderColor: 'border-gray-200',
    icon: Award,
    description: 'Regular shopper'
  },
  GOLD: { 
    name: 'Gold', 
    minOrders: 15, 
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'from-yellow-50 to-yellow-100',
    borderColor: 'border-yellow-200',
    icon: Crown,
    description: 'Valued member'
  },
  PLATINUM: { 
    name: 'Platinum', 
    minOrders: 30, 
    color: 'from-blue-400 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100',
    borderColor: 'border-blue-200',
    icon: Trophy,
    description: 'Elite shopper'
  },
  DIAMOND: { 
    name: 'Diamond', 
    minOrders: 50, 
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-50 to-pink-100',
    borderColor: 'border-purple-200',
    icon: Sparkles,
    description: 'VIP member'
  }
};

// Calculate user's loyalty tier
function calculateLoyaltyTier(ordersCount: number, userSince: number) {
  const tiers = Object.values(LOYALTY_TIERS);
  
  // Find the highest tier user qualifies for based on orders
  let userTier = LOYALTY_TIERS.BRONZE;
  
  for (const tier of tiers) {
    if (ordersCount >= tier.minOrders) {
      userTier = tier;
    } else {
      break;
    }
  }
  
  // Calculate progress to next tier
  const currentTierIndex = tiers.findIndex(t => t.name === userTier.name);
  const nextTier = tiers[currentTierIndex + 1];
  
let progress = 0;
if (nextTier) {
  const ordersInCurrentTier = ordersCount - userTier.minOrders;
  const ordersNeededForNextTier = nextTier.minOrders - userTier.minOrders;
  progress = Math.min((ordersInCurrentTier / ordersNeededForNextTier) * 100, 100);
  
  // Ensure minimum progress display
  if (ordersInCurrentTier > 0 && progress < 1) {
    progress = 1;
  }
} else {
  progress = 100; // Max tier reached
}
  
  // Ensure progress is at least 1% if user has orders in current tier
  if (ordersCount > userTier.minOrders && progress === 0) {
    progress = 1;
  }
  
  return {
    currentTier: userTier,
    nextTier,
    progress,
    ordersToNextTier: nextTier ? nextTier.minOrders - ordersCount : 0
  };
}

// Calculate tenure bonus (longer membership = higher starting tier)
function calculateTenureBonus(userSince: number) {
  if (userSince >= 365) return 10; // 1+ year = 10 order bonus
  if (userSince >= 180) return 5;  // 6+ months = 5 order bonus
  if (userSince >= 90) return 3;   // 3+ months = 3 order bonus
  if (userSince >= 30) return 1;   // 1+ month = 1 order bonus
  return 0;
}
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

export default function ProfileNav({ordersCount,userSince}:{ordersCount:number,userSince:number}){
  const pathname = usePathname();

  // Calculate dynamic loyalty data
  const tenureBonus = calculateTenureBonus(userSince);
  const effectiveOrders = ordersCount + tenureBonus;
  const loyaltyData = calculateLoyaltyTier(effectiveOrders, userSince);
  const TierIcon = loyaltyData.currentTier.icon;


  const createdText = userSince === 0 
  ? 'today'
  : userSince === 1 
    ? 'yesterday'
    : `${userSince} days ago`;
  
  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-2xl border-2 border-gray-300 rounded-2xl lg:rounded-3xl p-6 h-fit sticky top-24 shadow-2xl relative overflow-hidden"
    >
      {/* Premium Background Effects */}
  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${loyaltyData.currentTier.color}`} />
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
  className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${loyaltyData.currentTier.color} rounded-full border-2 ${loyaltyData.currentTier.borderColor} shadow-lg`}
>
  <TierIcon className="w-4 h-4 text-white" />
  <span className="text-white font-black text-sm">{loyaltyData.currentTier.name.toUpperCase()} MEMBER</span>
  <Sparkles className="w-3 h-3 text-white/80" />
</motion.div>
{tenureBonus > 0 && (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex items-center gap-1 mt-2 text-xs text-gray-600"
  >
    <span>🎁 +{tenureBonus} order bonus for loyalty</span>
  </motion.div>
)}
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
            <div className="text-2xl font-black text-gray-800">{ordersCount}</div>
            <div className="text-xs text-gray-600 font-medium">ORDERS</div>
          </div>
  <div className="text-center">
  <div className="text-xs text-gray-500 font-medium mb-1">Joined</div>
  <div className="text-sm font-semibold text-gray-800 bg-gray-100 rounded-lg px-2 py-1">
    {createdText}
  </div>
</div>
        </div>
        
     {/* Progress Bar */}
<div className="mt-4">
  <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
    <div className="flex items-center gap-2">
      <span className="font-semibold">{loyaltyData.currentTier.name} Tier</span>
      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
      <span className="text-gray-500">{loyaltyData.currentTier.description}</span>
    </div>
    {loyaltyData.nextTier ? (
      <div className="text-right">
        <div className="font-semibold text-gray-700">{loyaltyData.nextTier.name}</div>
        <div className="text-gray-500">{loyaltyData.ordersToNextTier} orders away</div>
      </div>
    ) : (
      <div className="text-right">
        <div className="font-semibold text-green-600">Max Tier!</div>
        <div className="text-gray-500">Elite status</div>
      </div>
    )}
  </div>
  
  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden relative">
    {/* Always show minimum 10% visually */}
    <div 
      className={`absolute inset-0 bg-gradient-to-r ${loyaltyData.currentTier.color} rounded-full`}
      style={{ width: `${Math.max(10, loyaltyData.progress)}%` }}
    />
    
    {/* Animated progress overlay */}
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${loyaltyData.progress}%` }}
      transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
      className={`bg-gradient-to-r ${loyaltyData.currentTier.color} h-3 rounded-full relative`}
    >
      {/* Animated shine effect */}
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
      
      {/* Progress percentage indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute top-1/2 transform -translate-y-1/2 text-white text-[10px] font-bold "
      >
        {Math.round(loyaltyData.progress)}%
      </motion.div>
    </motion.div>
  </div>
  
  {/* Tier benefits preview */}
  {loyaltyData.nextTier && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="mt-3 text-center"
    >
      <div className="text-xs text-gray-600">
        Unlock <span className="font-semibold text-gray-800">{loyaltyData.nextTier.name}</span> with{' '}
        <span className="font-bold text-blue-600">{loyaltyData.ordersToNextTier}</span> more orders
      </div>
    </motion.div>
  )}
</div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
      <div className="absolute bottom-4 left-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-1000" />
    </motion.nav>
  );
}