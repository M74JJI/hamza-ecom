'use client';

import { useEffect, useState } from 'react';

export default function VariantEditor({ variant, onChange }:{ variant:any, onChange:(v:any)=>void }){
  const [freeDelivery, setFreeDelivery] = useState(!!variant?.freeDelivery);
  useEffect(()=>{
    onChange?.({ ...variant, freeDelivery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeDelivery]);

  return (
    <div className="p-3 rounded border border-white/10">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={freeDelivery} onChange={e=>setFreeDelivery(e.target.checked)} />
        <span>Free delivery for this variant</span>
      </label>
    </div>
  );
}
