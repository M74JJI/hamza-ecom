"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "../store/ProductCard";

export function TopSellers({ products }: { products: any[] }) {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 border-b border-neutral-200 pb-6">
          <div>
            <p className="hz-eyebrow">NEW ARRIVALS</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-neutral-950 sm:text-4xl">Recently added</h2>
            <p className="mt-2 text-sm text-neutral-600">Newest published items from live catalog.</p>
          </div>
          <Link href="/browse" className="hidden items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-black sm:flex">Shop all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {products.length ? (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-neutral-950">No published products yet.</p>
            <p className="mt-2 text-sm text-neutral-500">Published catalog items appear here automatically.</p>
          </div>
        )}
        <Link href="/browse" className="hz-secondary-button mt-10 sm:hidden">Browse catalog <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </section>
  );
}
