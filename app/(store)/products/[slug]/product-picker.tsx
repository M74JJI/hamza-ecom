'use client';
import { useMemo, useState } from 'react';

export function ProductPicker({ product }:{ product:any }){
  const [variantIdx, setVariantIdx] = useState(0);
  const variant = product.variants[variantIdx];
  const [sizeId, setSizeId] = useState<string | null>(variant?.sizes?.[0]?.id ?? null);
  const selectedSize = useMemo(()=> variant?.sizes.find((s:any)=>s.id===sizeId), [variant, sizeId]);
  const gallery = (variant?.images?.length ? variant.images : product.images) || [];

  return (
    <div className="space-y-6">
      <div className="text-2xl font-semibold">
        {selectedSize ? (selectedSize.priceCents/100).toFixed(2) : '—'} MAD
      </div>
      <div className="text-sm opacity-70">
        {selectedSize?.stockQty>0 ? `${selectedSize.stockQty} in stock` : 'Out of stock'}
      </div>

      <div>
        <div className="text-sm opacity-70 mb-2">Color / Style</div>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v:any, idx:number)=>(
            <button key={v.id}
              onClick={()=>{ setVariantIdx(idx); setSizeId(v.sizes?.[0]?.id ?? null); }}
              className={`px-3 py-2 rounded-lg border ${idx===variantIdx?'border-white':'border-white/20'} bg-white/5`}>
              {v.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm opacity-70 mb-2">Size</div>
        <div className="flex flex-wrap gap-2">
          {variant?.sizes?.map((s:any)=>(
            <button key={s.id} onClick={()=>setSizeId(s.id)}
              className={`px-3 py-2 rounded-lg border ${sizeId===s.id?'border-white':'border-white/20'} ${s.stockQty>0?'bg-white/5':'bg-white/5 opacity-60 cursor-not-allowed'}`}
              disabled={s.stockQty<=0}>
              {s.size}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {gallery.map((img:any)=>(
          <img key={img.id} src={img.url} className="aspect-square object-cover rounded border border-white/10"/>
        ))}
      </div>
    </div>
  );
}
