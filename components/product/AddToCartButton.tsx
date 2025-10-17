'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Check, ShoppingCart, Sparkles, Zap, ShoppingBag } from 'lucide-react';

export default function AddToCartButton({ onClick, disabled, alreadyQty }: { onClick: () => void; disabled?: boolean; alreadyQty?: number }) {
  const [done, setDone] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particleId = useRef(0);

  const createParticles = (count: number) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleId.current++,
        x: Math.random() * 100,
        y: Math.random() * 100,
      });
    }
    setParticles(newParticles);
    
    setTimeout(() => {
      setParticles([]);
    }, 1000);
  };

  async function handleClick() {
    if (disabled) return;
    
    // Create sparkle particles
    createParticles(12);
    
    // Pulse animation
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 600);
    
    onClick();
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }

  // Continuous subtle pulse when item is in cart
  useEffect(() => {
    if (alreadyQty && alreadyQty > 0) {
      const interval = setInterval(() => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 600);
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [alreadyQty]);

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
        relative px-8 py-4 rounded-2xl font-black text-lg
        shadow-2xl overflow-hidden border-2
        transition-all duration-500
        ${disabled 
          ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed' 
          : done
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-yellow-500 shadow-green-500/25'
            : 'bg-black text-white border-yellow-500 hover:bg-gray-900 hover:shadow-yellow-500/30'
        }
        ${isPulsing ? 'animate-pulse' : ''}
      `}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: isHovering && !disabled && !done ? '100%' : '-100%' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      
      {/* Floating particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 pointer-events-none"
            initial={{
              opacity: 1,
              scale: 0,
              x: `${particle.x}%`,
              y: `${particle.y}%`,
            }}
            animate={{
              opacity: 0,
              scale: [0, 1.5, 0],
              x: `${particle.x + (Math.random() - 0.5) * 100}%`,
              y: `${particle.y - 50}%`,
              rotate: 360,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.2,
              ease: 'easeOut',
            }}
          >
            <Sparkles className="w-full h-full text-yellow-400 fill-yellow-400" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Background shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: done ? '100%' : '-100%' }}
        transition={{ duration: 0.8, delay: done ? 0.1 : 0 }}
      />

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center gap-3">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="added"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="flex items-center gap-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, times: [0, 0.7, 1] }}
              >
                <Check className="w-6 h-6" />
              </motion.div>
              <span className="font-black">ADDED TO CART!</span>
              
              {/* Mini cart icon flying in */}
              <motion.div
                initial={{ x: 20, opacity: 0, scale: 0 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex items-center gap-1"
              >
                <ShoppingBag className="w-4 h-4" />
                {alreadyQty && alreadyQty > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-black border border-white"
                  >
                    {alreadyQty + 1}
                  </motion.span>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-3"
            >
              {/* Animated shopping cart icon */}
              <motion.div
                animate={{
                  y: isHovering ? [-2, 2, -2] : 0,
                  rotate: isHovering ? [-5, 5, -5] : 0,
                }}
                transition={{
                  duration: 1,
                  repeat: isHovering ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                <ShoppingCart className="w-5 h-5" />
              </motion.div>
              
              <span className="font-black">
                ADD TO CART
                {typeof alreadyQty === 'number' && alreadyQty > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2 text-sm bg-yellow-500 text-black px-2 py-1 rounded-full border border-white"
                  >
                    IN CART: {alreadyQty}
                  </motion.span>
                )}
              </span>

              {/* Lightning bolt on hover */}
              <AnimatePresence>
                {isHovering && !disabled && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <Zap className="w-4 h-4 text-yellow-400 fill-current" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success wave effect */}
      <AnimatePresence>
        {done && (
          <>
            <motion.div
              className="absolute inset-0 bg-yellow-500/20 rounded-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
            <motion.div
              className="absolute inset-0 bg-yellow-500/10 rounded-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Continuous border animation when item in cart */}
      <AnimatePresence>
        {alreadyQty && alreadyQty > 0 && !done && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-yellow-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Disabled state overlay */}
      {disabled && (
        <motion.div
          className="absolute inset-0 bg-gray-500/20 rounded-2xl backdrop-blur-[1px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.button>
  );
}