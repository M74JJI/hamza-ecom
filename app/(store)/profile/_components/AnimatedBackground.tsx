// app/(store)/profile/_components/AnimatedBackground.tsx
'use client';

import { motion } from 'framer-motion';

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rotate-45"
        animate={{ rotate: [45, 90, 45] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-24 h-24 bg-purple-500/10 -rotate-12"
        animate={{ scale: [1, 1.2, 1], rotate: [-12, 12, -12] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
    </div>
  );
}