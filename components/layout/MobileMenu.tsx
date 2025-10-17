'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function MobileMenu(){
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/cart', label: 'Cart' },
    { href: '/profile', label: 'Profile' },
    { href: '/dashboard', label: 'Admin' },
  ];

  return (
    <div className="md:hidden">
      <button aria-label="Menu" onClick={()=>setOpen(v=>!v)} className="p-2 rounded-md hz-glass">
        {open ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-lg md:hidden">
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
              className="relative hz-glass mx-3 mt-20 rounded-2xl p-6 overflow-hidden">
              <div className="hz-aurora"></div>
              <nav className="relative z-10 grid gap-3 text-lg">
                {links.map(l => (
                  <Link key={l.href} href={l.href} onClick={()=>setOpen(false)}
                    className={`hz-link ${pathname===l.href ? 'text-white' : 'text-white/80'}`}>
                    {l.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
