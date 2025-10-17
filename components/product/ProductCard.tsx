'use client';
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import WishlistButton from "../wishlist/WishlistButton";

function formatMAD(m:number){
  return Number(m).toFixed(2) + " MAD";
}
const applyDiscount = (val:number, pct?:number|null) => (!pct || pct<=0) ? val : Math.max(0, Number((val * (100 - pct) / 100).toFixed(2)));

export default function ProductCard({ product, randomizePreview=true }:{ product:any, randomizePreview?: boolean }){
  const variants = product.variants || [];
  const initialVariantIndex = useMemo(()=>{
    if (!randomizePreview) return 0;
    if (variants.length === 0) return 0;
    return Math.floor(Math.random() * variants.length);
  }, [product.id, variants.length, randomizePreview]);

  const [hoverVariantIdx, setHoverVariantIdx] = useState(initialVariantIndex);
  const active = variants[hoverVariantIdx] || variants[0];
  const mainImage = (active?.images?.[0]?.url) || (variants[0]?.images?.[0]?.url) || "/placeholder.svg";
  const priceRange = useMemo(()=>{
    if(!active?.sizes?.length) return null;
    const discounted = active.sizes.map((s:any)=> applyDiscount(Number(s.priceMAD), s.discountPercent));
    return { min: Math.min(...discounted), max: Math.max(...discounted) };
  }, [active]);

  return (
    <Link href={`/products/${product.slug}`} className="group block rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:shadow-xl/10">
      <div className="relative aspect-[4/5] w-full">
        <div className="absolute right-2 top-2 z-10"><WishlistButton productId={product.id} /></div>
        <Image src={mainImage} alt={active?.title || product.slug || ''} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur rounded-full px-2 py-1">
          {variants.slice(0,8).map((v:any, idx:number)=>{
            const thumb = v.variantStyleImg || v.images?.[0]?.url || mainImage;
            return (
              <button
                key={v.id}
                onMouseEnter={()=>setHoverVariantIdx(idx)}
                onFocus={()=>setHoverVariantIdx(idx)}
                className={"w-6 h-6 rounded-full overflow-hidden ring-1 " + (idx===hoverVariantIdx ? "ring-white" : "ring-white/40")}
                aria-label={v.name}
                title={v.name}
                type="button"
              >
                <img src={thumb} className="w-full h-full object-cover" />
              </button>
            )
          })}
        </div>
      </div>
      <div className="p-3">
        <div className="text-sm opacity-70">{product.categories?.map((pc:any)=>pc.category?.name).join(" / ")}</div>
        <div className="font-medium line-clamp-1">{active?.title || product.slug}</div>
        {priceRange && (
          <div className="text-sm mt-1">
            <span className="font-semibold">{formatMAD(priceRange.min)}</span>
            {priceRange.max !== priceRange.min && (
              <span className="opacity-70"> – {formatMAD(priceRange.max)}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
