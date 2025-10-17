"use client";
import { motion } from "framer-motion";
import { Shield, Truck, CreditCard, Sparkles } from "lucide-react";

const items = [
  { icon: Truck, text: "Fast Delivery" },
  { icon: CreditCard, text: "Cash on Delivery" },
  { icon: Shield, text: "Secure Checkout" },
  { icon: Sparkles, text: "Modern Design" },
];

export default function Trust() {
  return (
    <section className="relative container py-20 overflow-hidden">
      {/* faint aurora */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.25] blur-[80px]
        bg-[radial-gradient(60%_60%_at_50%_40%,rgba(212,175,55,0.3),transparent)]" />

      <motion.div
        className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        {items.map(({ icon: Icon, text }, i) => (
          <motion.div
            key={i}
            className="group relative hz-glass rounded-2xl p-8 flex flex-col items-center justify-center 
              hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-500"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-b from-transparent to-white/[0.03] pointer-events-none"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <Icon className="h-10 w-10 mb-3 text-white group-hover:text-[var(--hz-gold-2)]
              transition-transform duration-500 group-hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
            <p className="font-semibold tracking-wide text-white group-hover:text-[var(--hz-gold-2)]
              transition-colors duration-300">{text}</p>
            <motion.span
              layoutId="trust-glow"
              className="absolute bottom-0 left-0 right-0 mx-auto h-[2px] w-1/2 bg-gradient-to-r 
                from-[var(--hz-gold-1)] to-[var(--hz-gold-2)] rounded-full opacity-0 group-hover:opacity-100 
                transition-all duration-500"
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
