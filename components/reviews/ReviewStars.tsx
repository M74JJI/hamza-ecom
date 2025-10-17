// ReviewStars.tsx - Premium Enhanced
'use client';
import { motion } from 'framer-motion';

export default function ReviewStars({ value, size = 20 }: { value: number; size?: number }) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value - fullStars >= 0.5;
  
  return (
    <div className="inline-flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return (
            <motion.svg
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              width={size}
              height={size}
              viewBox="0 0 24 24"
              className="fill-yellow-400 text-yellow-400 drop-shadow-sm"
            >
              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.401 8.162L12 18.896l-7.335 3.862 1.401-8.162L.132 9.21l8.2-1.192z"/>
            </motion.svg>
          );
        } else if (i === fullStars && hasHalfStar) {
          return (
            <motion.svg
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              width={size}
              height={size}
              viewBox="0 0 24 24"
              className="fill-yellow-400 text-yellow-400 drop-shadow-sm"
            >
              <path d="M12 5.173l2.335 4.817 5.305.732-3.861 3.71.942 5.27L12 17.178V5.173zm0-4.586L8.332 7.431 0 8.623l5.934 5.786-1.401 8.162L12 18.896l7.335 3.862-1.401-8.162L24 8.623l-8.2-1.192L12 .587z"/>
            </motion.svg>
          );
        } else {
          return (
            <motion.svg
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              width={size}
              height={size}
              viewBox="0 0 24 24"
              className="fill-slate-300 dark:fill-slate-600 text-slate-300 dark:text-slate-600"
            >
              <path d="M12 5.173l2.335 4.817 5.305.732-3.861 3.71.942 5.27L12 17.178V5.173zm0-4.586L8.332 7.431 0 8.623l5.934 5.786-1.401 8.162L12 18.896l7.335 3.862-1.401-8.162L24 8.623l-8.2-1.192L12 .587z"/>
            </motion.svg>
          );
        }
      })}
    </div>
  );
}