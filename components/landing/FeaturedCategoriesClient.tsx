"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FeaturedCategoriesClient({ categories }: { categories: { id: string; name: string; imageUrl: string | null }[] }) {
  return (
    <section className="border-b border-neutral-200 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 border-b border-neutral-200 pb-6">
          <div>
            <p className="hz-eyebrow">CATEGORIES</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-neutral-950 sm:text-4xl">Browse by collection</h2>
          </div>
          <Link href="/browse" className="hidden items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-black sm:flex">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/browse?category=${encodeURIComponent(category.id)}`} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100">
                <Image src={category.imageUrl || "/placeholder.svg"} alt={category.name} fill className="object-cover transition duration-500 group-hover:scale-[1.025]" sizes="(max-width: 768px) 50vw, 33vw" />
              </div>
              <div className="mt-3 flex items-center justify-between border-b border-neutral-200 pb-3">
                <h3 className="font-semibold text-neutral-950">{category.name}</h3>
                <ArrowRight className="h-4 w-4 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-neutral-950" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
