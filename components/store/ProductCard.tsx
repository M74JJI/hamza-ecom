"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import WishlistButton from "../wishlist/WishlistButton";

const applyDiscount = (value: number, percent?: number | null) => percent && percent > 0 ? value * (1 - percent / 100) : value;

export default function ProductCard({ product, randomizePreview = true, viewMode = "grid" }: { product: any; randomizePreview?: boolean; viewMode?: "grid" | "list" }) {
  const variants = product.variants ?? [];
  const initial = useMemo(() => {
    if (!randomizePreview || !variants.length) return 0;
    return String(product.id ?? product.slug ?? "").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % variants.length;
  }, [product.id, product.slug, randomizePreview, variants.length]);
  const [activeIndex, setActiveIndex] = useState(initial);
  const active = variants[activeIndex] ?? variants[0];
  const image = active?.images?.[0]?.url ?? "/placeholder.svg";
  const prices = (active?.sizes ?? []).filter((size: any) => size.isActive !== false).map((size: any) => applyDiscount(Number(size.priceMAD), size.discountPercent));
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxDiscount = Math.max(0, ...(active?.sizes ?? []).map((size: any) => Number(size.discountPercent) || 0));
  const title = active?.title || active?.name || product.brand || product.slug;

  return (
    <article className={`group relative ${viewMode === "list" ? "grid gap-5 border-b border-neutral-200 pb-6 sm:grid-cols-[180px_1fr]" : ""}`}>
      <div className="relative overflow-hidden rounded-lg bg-neutral-100">
        <Link href={`/products/${product.slug}`} className="block">
          <div className={`relative ${viewMode === "list" ? "aspect-square" : "aspect-[4/5]"}`}>
            <Image src={image} alt={title} fill className="object-cover transition duration-500 group-hover:scale-[1.025]" sizes={viewMode === "list" ? "180px" : "(max-width: 768px) 50vw, 25vw"} />
          </div>
        </Link>
        <div className="absolute right-2 top-2"><WishlistButton productId={product.id} /></div>
        {maxDiscount > 0 && <span className="absolute left-2 top-2 rounded-md bg-white px-2 py-1 text-[11px] font-bold text-neutral-950">-{maxDiscount}%</span>}
      </div>
      <div className="pt-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">{product.brand || product.categories?.[0]?.category?.name || "HAMZA"}</p>
        <Link href={`/products/${product.slug}`} className="mt-1 block font-semibold leading-6 text-neutral-950 hover:underline hover:underline-offset-4">{title}</Link>
        {minPrice !== null && <p className="mt-2 text-sm font-semibold tabular-nums text-neutral-900">From {minPrice.toFixed(2)} MAD</p>}
        {variants.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Product variants">
            {variants.slice(0, 6).map((variant: any, index: number) => (
              <button key={variant.id} type="button" onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onClick={() => setActiveIndex(index)} aria-label={`Show ${variant.name || variant.title}`} className={`h-6 w-6 overflow-hidden rounded-full border bg-neutral-100 p-0.5 ${index === activeIndex ? "border-neutral-950" : "border-neutral-300"}`}>
                <span className="relative block h-full w-full overflow-hidden rounded-full"><Image src={variant.variantStyleImg || variant.images?.[0]?.url || image} alt="" fill className="object-cover" sizes="24px" /></span>
              </button>
            ))}
          </div>
        )}
        {viewMode === "list" && active?.shortDescription && <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">{active.shortDescription}</p>}
      </div>
    </article>
  );
}
