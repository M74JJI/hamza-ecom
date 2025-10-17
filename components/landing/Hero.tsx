'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero(){
  return (
    <section className="relative h-[70vh] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?fashion,store')" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20"></div>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Discover the Future of Shopping</h1>
        <p className="text-lg md:text-2xl mb-6">Premium products. Cash on delivery. Fast shipping.</p>
        <Link href="/products" className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition">Shop Now</Link>
      </motion.div>
    </section>
  );
}
