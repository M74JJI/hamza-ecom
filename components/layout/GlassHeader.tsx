'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function GlassHeader(){
  return (
    <motion.header initial={{ y: -20, opacity: 0}} animate={{ y: 0, opacity: 1}} transition={{ duration: .5 }}
      className="sticky top-3 z-40 w-full">
      <div className="glass px-4 py-3 mx-3 md:mx-auto md:max-w-5xl flex items-center justify-between rounded-2xl">
        <Link href="/" className="font-extrabold tracking-tight text-white">
          H<span className="text-[var(--hz-accent)]">Z</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/products" className="opacity-80 hover:opacity-100">Products</Link>
          <Link href="/search" className="opacity-80 hover:opacity-100">Search</Link>
          <Link href="/cart" className="opacity-80 hover:opacity-100">Cart</Link>
          <Link href="/orders" className="opacity-80 hover:opacity-100">Orders</Link>
        </nav>
      </div>
    </motion.header>
  );
}
