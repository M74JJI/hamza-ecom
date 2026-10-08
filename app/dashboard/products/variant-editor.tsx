'use client';

import { useEffect, useState } from 'react';

export default function VariantEditor({ variant, onChange }:{ variant:any, onChange:(v:any)=>void }){
  const [freeDelivery, setFreeDelivery] = useState(!!variant?.freeDelivery);
  useEffect(()=>{
    onChange?.({ ...variant, freeDelivery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeDelivery]);

  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={freeDelivery} onChange={e=>setFreeDelivery(e.target.checked)} />
        <span>Free delivery for this variant</span>
      </label>
    </div>
  );
}
