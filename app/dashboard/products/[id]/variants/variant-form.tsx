'use client';

import { useEffect, useState, useTransition } from 'react';
import { upsertVariantAction, deleteVariantAction, adjustVariantStockAction } from './server-actions';

export function VariantForm({ productId, initial }:{ productId: string, initial?: any }){
  const [sku,setSku] = useState(initial?.sku || '');
  const [color,setColor] = useState<string>(
    Array.isArray(initial?.attributes?.color) ? (initial.attributes.color as string[]).join(', ') : (initial?.attributes?.color || '')
  );
  const [size,setSize] = useState<string>(initial?.attributes?.size || '');
  const [priceCents,setPriceCents] = useState<number>(initial?.priceCents ?? 0);
  const [stockQty,setStockQty] = useState<number>(initial?.stockQty ?? 0);
  const [isActive,setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [freeDelivery,setFreeDelivery] = useState<boolean>(initial?.freeDelivery ?? false);
  const [pending,start] = useTransition();
  const [msg,setMsg] = useState<string|undefined>();

  return (
    <form onSubmit={(e)=>{
      e.preventDefault();
      start(async ()=>{
        const attributes:any = {};
        const trimmedColor = color.trim();
        if(trimmedColor){
          attributes.color = trimmedColor.includes(',') ? trimmedColor.split(',').map(s=>s.trim()).filter(Boolean) : trimmedColor;
        }
        if(size.trim()){ attributes.size = size.trim(); }
        const payload = { id: initial?.id, productId, sku, attributes, priceCents: Number(priceCents), stockQty: Number(stockQty), isActive };
        const res = await upsertVariantAction(payload);
        setMsg(res.error || 'Saved');
        if(!res.error && !initial){
          setSku(''); setColor(''); setSize(''); setPriceCents(0); setStockQty(0); setIsActive(true);
        }
      });
    }} className="hz-admin-panel grid gap-3 p-5 md:grid-cols-3">
      <input className="h-11 px-3" placeholder="SKU" value={sku} onChange={e=>setSku(e.target.value)} />
      <input className="h-11 px-3" placeholder="Color (e.g., Blue or Blue,Red)" value={color} onChange={e=>setColor(e.target.value)} />
      <input className="h-11 px-3" placeholder="Size (e.g., M)" value={size} onChange={e=>setSize(e.target.value)} />
      <input className="h-11 px-3" placeholder="Price (cents)" type="number" value={priceCents} onChange={e=>setPriceCents(Number(e.target.value))} />
      <input className="h-11 px-3" placeholder="Stock qty" type="number" value={stockQty} onChange={e=>setStockQty(Number(e.target.value))} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={freeDelivery} onChange={e=>setFreeDelivery(e.target.checked)} />
        Free delivery for this variant
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} />
        Active
      </label>
      <div className="col-span-full">
        <button disabled={pending} className="hz-admin-primary">{pending?'Saving...':'Save variant'}</button>
        {msg && <span className="ml-3 text-xs opacity-70">{msg}</span>}
      </div>
    </form>
  );
}
