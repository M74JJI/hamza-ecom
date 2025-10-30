'use client';
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ZoomImageProps {
  src: string;
  alt?: string;
  height?: number;
  zoomScale?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export default function ZoomImage({
  src,
  alt = '',
  height = 700,
  zoomScale = 2.5,
  onLoad,
  onError,
}: ZoomImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isZoomEnabled, setIsZoomEnabled] = useState(true);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !isZoomEnabled) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOffset({ x, y });
  };

  const handleMouseEnter = () => isZoomEnabled && setIsZoomed(true);
  const handleMouseLeave = () => setIsZoomed(false);

  const toggleZoom = () => {
    setIsZoomEnabled(!isZoomEnabled);
    setIsZoomed(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageLoaded(true);
    onError?.();
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden bg-white rounded-3xl flex items-center justify-center group"
      style={{ height }}
    >
      {/* Base image */}
      <Image
        src={src}
        alt={alt}
        fill
        priority
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`transition-all duration-500 object-contain ${
          isZoomed ? 'opacity-0' : 'opacity-100'
        } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Zoomed layer */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            key="zoom-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 overflow-hidden"
          >
            <motion.img
              src={src}
              alt={alt}
              style={{
                transformOrigin: `${offset.x}% ${offset.y}%`,
              }}
              className="w-full h-full object-contain pointer-events-none"
              animate={{
                scale: zoomScale,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom Control Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleZoom}
        className={`absolute bottom-6 right-6 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-lg border transition-all duration-300 z-20 shadow-2xl ${
          isZoomEnabled
            ? 'bg-black text-white border-black'
            : 'bg-white/95 text-gray-600 border-gray-300'
        } opacity-0 group-hover:opacity-100`}
      >
        {isZoomEnabled ? (
          <ZoomIn className="w-5 h-5" />
        ) : (
          <ZoomOut className="w-5 h-5" />
        )}
      </motion.button>

      {/* Zoom Hint */}
      <AnimatePresence>
        {!isZoomed && isZoomEnabled && imageLoaded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-6 left-6 px-4 py-2 bg-black/80 backdrop-blur-lg rounded-full text-white text-sm font-medium border border-white/20 shadow-2xl z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            Hover to zoom
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {!imageLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full"
          />
        </motion.div>
      )}
    </div>
  );
}