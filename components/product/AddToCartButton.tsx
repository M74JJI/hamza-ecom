'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Check, ShoppingBag, Sparkles, Plus, Star } from 'lucide-react';

export default function AddToCartButton({ onClick, disabled, alreadyQty }: { onClick: () => void; disabled?: boolean; alreadyQty?: number }) {
  const [done, setDone] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; type: 'sparkle' | 'star' }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particleId = useRef(0);
  
const createParticles = (count: number) => {
  const newParticles: { id: number; x: number; y: number; delay: number; type: 'sparkle' | 'star' }[] = [];
  for (let i = 0; i < count; i++) {
    newParticles.push({
      id: particleId.current++,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.4,
      type: (Math.random() > 0.5 ? 'sparkle' : 'star') as 'sparkle' | 'star', // ✅ FIXED
    });
  }
  setParticles(newParticles);
  
  setTimeout(() => {
    setParticles([]);
  }, 1500);
};


  async function handleClick() {
    if (disabled) return;
    
    // Create premium particle effect
    createParticles(8);
    
    onClick();
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  }

  // Continuous subtle glow when item is in cart
  useEffect(() => {
    if (alreadyQty && alreadyQty > 0 && !done) {
      const interval = setInterval(() => {
        createParticles(1);
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [alreadyQty, done]);

  return (
    <motion.button
      ref={buttonRef}
      whileHover={{ 
        scale: disabled ? 1 : 1.02,
        y: -2
      }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onHoverStart={() => !disabled && setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative flex-1 px-10 py-5 rounded-2xl
        overflow-hidden border-2 transition-all duration-500
        disabled:cursor-not-allowed
        backdrop-blur-lg
        group
        ${disabled 
          ? 'bg-gray-100 text-gray-400 border-gray-200' 
          : done
            ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white border-green-600 shadow-2xl shadow-green-500/30'
            : 'bg-gradient-to-br from-black to-gray-900 text-white border-black hover:from-gray-900 hover:to-black hover:shadow-2xl hover:shadow-black/30'
        }
      `}
    >
      {/* Premium background shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: isHovering && !disabled && !done ? '100%' : '-100%' }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Premium floating particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-3 h-3 pointer-events-none"
            initial={{
              opacity: 0,
              scale: 0,
              x: `${particle.x}%`,
              y: `${particle.y}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.3, 0],
              x: `${particle.x + (Math.random() - 0.5) * 80}%`,
              y: `${particle.y - 60 - Math.random() * 30}%`,
              rotate: particle.type === 'star' ? [0, 180, 360] : 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              ease: "easeOut",
              delay: particle.delay,
            }}
          >
            {particle.type === 'sparkle' ? (
              <Sparkles className="w-full h-full text-amber-300" />
            ) : (
              <Star className="w-full h-full text-white fill-white/80" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Premium success wave effect */}
      <AnimatePresence>
        {done && (
          <>
            <motion.div
              className="absolute inset-0 bg-white/40 rounded-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 1 }}
              exit={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
            <motion.div
              className="absolute inset-0 bg-white/25 rounded-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1, delay: 0.1 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main button content */}
      <div className="relative z-10 flex items-center justify-center gap-4">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="added"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="flex items-center gap-4"
            >
              {/* Premium checkmark animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }}
                className="relative"
              >
                <Check className="w-6 h-6" />
                
                {/* Mini sparkles on check */}
                <motion.div
                  initial={{ scale: 0, opacity: 0, x: -2, y: -2 }}
                  animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0, opacity: 0, x: 2, y: -2 }}
                  animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-1 -left-1"
                >
                  <Star className="w-2 h-2 text-white fill-white" />
                </motion.div>
              </motion.div>
              
              <span className="font-semibold text-base">Added to Bag</span>
              
              {/* Premium cart count fly-in */}
              {alreadyQty !== undefined && (
                <motion.div
                  initial={{ x: 20, opacity: 0, scale: 0.5 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="flex items-center gap-2 bg-white/25 px-3 py-1.5 rounded-full backdrop-blur-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {alreadyQty + 1}
                  </span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-4"
            >
              {/* Premium animated shopping bag icon */}
              <motion.div
                animate={{
                  y: isHovering ? [-3, 0, -3] : 0,
                }}
                transition={{
                  duration: 2,
                  repeat: isHovering ? Infinity : 0,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <ShoppingBag className="w-6 h-6" />
                
                {/* Bag shine effect */}
                <motion.div
                  className="absolute inset-0 bg-white/30 rounded-full"
                  animate={{ 
                    scale: isHovering ? [1, 1.2, 1] : 1,
                    opacity: isHovering ? [0.3, 0.6, 0.3] : 0
                  }}
                  transition={{ duration: 2, repeat: isHovering ? Infinity : 0 }}
                />
              </motion.div>
              
              <div className="flex items-center gap-3">
                <span className="font-semibold text-base">
                  Add to Bag
                </span>
                
                {/* Premium existing quantity indicator */}
                {typeof alreadyQty === 'number' && alreadyQty > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 bg-white/25 px-3 py-1.5 rounded-full backdrop-blur-sm"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="text-sm font-semibold">
                      {alreadyQty}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Premium hover sparkle effect */}
              <AnimatePresence>
                {isHovering && !disabled && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex gap-1"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <Star className="w-3 h-3 text-white fill-white/80" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Premium continuous pulse when item is in cart */}
      <AnimatePresence>
        {alreadyQty && alreadyQty > 0 && !done && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Premium disabled state overlay */}
      {disabled && (
        <motion.div
          className="absolute inset-0 bg-gray-500/20 rounded-2xl backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      {/* Premium glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ 
          opacity: isHovering && !disabled ? [0.4, 0.8, 0.4] : 0,
          x: isHovering && !disabled ? ['-100%', '100%'] : '-100%'
        }}
        transition={{ 
          opacity: { duration: 2, repeat: isHovering && !disabled ? Infinity : 0 },
          x: { duration: 2, repeat: isHovering && !disabled ? Infinity : 0 }
        }}
      />

      {/* Premium shimmer border */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:200%_100%]"
        animate={{ 
          backgroundPosition: isHovering && !disabled ? ['0% 0%', '200% 0%'] : '0% 0%'
        }}
        transition={{ 
          duration: 2,
          repeat: isHovering && !disabled ? Infinity : 0
        }}
      />
    </motion.button>
  );
}