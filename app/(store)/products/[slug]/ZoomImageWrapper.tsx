// ZoomImageWrapper.tsx — fullscreen overlay below header
'use client';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const ZoomImage = dynamic(
  () => import('@/components/zoom-image').then(m => m.ZoomImage),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-200 animate-pulse rounded-3xl flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function ZoomImageWrapper({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);

  // ESC key closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-[800px] flex items-center justify-center"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative w-full h-full group outline-none"
        >
          <ZoomImage
            src={src}
            alt={alt}
          //  className="max-w-full max-h-full object-contain cursor-zoom-in"
          />
        </button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // ⬇️ put z-[80] (or any value just below your header z-index)
            className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm flex items-center justify-center top-[100px]"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <ZoomImage
                src={src}
                alt={alt}
               // className="max-w-[95vw] max-h-[90vh] object-contain rounded-3xl"
              />

              {/* ✅ close button INSIDE image area */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-20 right-6 bg-black/50 hover:bg-black/70 text-white text-lg px-3 py-1.5 rounded-full"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
