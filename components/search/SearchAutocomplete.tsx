'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function SearchAutocomplete(){
  const [q,setQ] = useState('');
  const [open,setOpen] = useState(false);
  const [items,setItems] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const h = (e:MouseEvent)=>{ if(ref.current && !ref.current.contains(e.target as any)) setOpen(false); };
    document.addEventListener('click', h);
    return ()=>document.removeEventListener('click', h);
  },[]);

  useEffect(()=>{
    const t = setTimeout(async ()=>{
      if(q.trim().length < 2){ setItems([]); return; }
      const res = await fetch('/api/search?q=' + encodeURIComponent(q));
      const data = await res.json();
      setItems(data.suggestions || []);
      setOpen(true);
    }, 150);
    return ()=>clearTimeout(t);
  }, [q]);

  return (
    <div className="relative w-full max-w-md" ref={ref}>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products..." className="w-full rounded-xl bg-white/10 px-4 py-2 outline-none" />
      {open && items.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-black/90 backdrop-blur p-2">
          {items.map((it:any)=>(
            <Link key={it.id} href={`/products/${it.slug}`} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10">
              {it.image && <img src={it.image} alt="" className="w-8 h-8 rounded object-cover" />}
              <div>
                <div className="text-sm">{it.title}</div>
                <div className="text-xs opacity-70">{it.tags?.join(' · ')}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
