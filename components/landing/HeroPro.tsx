"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { HeroProduct } from "@/types/hero";

function discountedPrice(price: number, discount?: number | null) {
  return discount ? price * (1 - discount / 100) : price;
}

export default function HeroPro({ products }: { products: HeroProduct[] }) {
  const [active, setActive] = useState(0);

  if (!products.length) {
    return (
      <section className="border-b border-neutral-200 bg-stone-50">
        <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.2fr_.8fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="hz-eyebrow">HAMZA STORE</p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-neutral-950 sm:text-6xl lg:text-7xl">Shop what is available. Nothing invented.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">Every item, price, category, and stock count comes directly from our live catalog.</p>
            <Link href="/browse" className="hz-primary-button mt-8">Browse catalog <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="border-l border-neutral-300 pl-8">
            <p className="text-sm font-semibold text-neutral-950">Catalog being prepared</p>
            <p className="mt-3 text-sm leading-6 text-neutral-600">Featured products appear here after publication from dashboard.</p>
            <dl className="mt-8 grid gap-5 text-sm">
              <div><dt className="text-neutral-500">Pricing</dt><dd className="mt-1 font-medium text-neutral-950">MAD, live from catalog</dd></div>
              <div><dt className="text-neutral-500">Availability</dt><dd className="mt-1 font-medium text-neutral-950">Checked again at checkout</dd></div>
              <div><dt className="text-neutral-500">Delivery</dt><dd className="mt-1 font-medium text-neutral-950">Calculated from active shipping rules</dd></div>
            </dl>
          </div>
        </div>
      </section>
    );
  }

  const product = products[active % products.length];
  const variant = product.variants[0];
  const image = variant?.images?.[0]?.url ?? "/placeholder.svg";
  const prices = (variant?.sizes ?? []).map((size) => discountedPrice(Number(size.priceMAD), size.discountPercent));
  const price = prices.length ? Math.min(...prices) : null;

  function move(direction: number) {
    setActive((current) => (current + direction + products.length) % products.length);
  }

  return (
    <section className="border-b border-neutral-200 bg-stone-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8 lg:py-16">
        <div className="order-2 lg:order-1">
          <p className="hz-eyebrow">FEATURED NOW</p>
          <p className="mt-5 text-sm font-medium text-neutral-500">{product.brand || "HAMZA"}</p>
          <h1 className="mt-2 max-w-xl text-4xl font-semibold leading-tight tracking-[-0.045em] text-neutral-950 sm:text-6xl">{variant?.title || product.slug}</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-neutral-600">{variant?.shortDescription || "Explore this item and choose an available option."}</p>
          {price !== null && <p className="mt-6 text-xl font-semibold text-neutral-950">From {price.toFixed(2)} MAD</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/products/${product.slug}`} className="hz-primary-button">View product <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/browse" className="hz-secondary-button">Browse all</Link>
          </div>
          {products.length > 1 && (
            <div className="mt-10 flex items-center gap-3">
              <button type="button" onClick={() => move(-1)} className="hz-icon-button border border-neutral-300" aria-label="Previous featured product"><ArrowLeft className="h-4 w-4" /></button>
              <span className="text-xs font-medium tabular-nums text-neutral-500">{active + 1} / {products.length}</span>
              <button type="button" onClick={() => move(1)} className="hz-icon-button border border-neutral-300" aria-label="Next featured product"><ArrowRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>
        <Link href={`/products/${product.slug}`} className="group order-1 block overflow-hidden rounded-xl bg-neutral-100 lg:order-2">
          <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image src={image} alt={variant?.title || product.slug} fill priority className="object-cover transition duration-500 group-hover:scale-[1.02]" sizes="(max-width: 1024px) 100vw, 55vw" />
          </div>
        </Link>
      </div>
    </section>
  );
}
