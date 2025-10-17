'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';

export default function SearchBar(){
  const [q,setQ] = useState('');
  const [open,setOpen] = useState(false);
  const [suggestions,setSuggestions] = useState<any[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    function onDoc(e: MouseEvent){
      if(!boxRef.current) return;
      if(!boxRef.current.contains(e.target as any)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return ()=>document.removeEventListener('mousedown', onDoc);
  },[]);

  useEffect(()=>{
    const ctrl = new AbortController();
    const t = setTimeout(async ()=>{
      if(!q){ setSuggestions([]); return; }
      const res = await fetch('/api/search/suggest?q=' + encodeURIComponent(q), { signal: ctrl.signal });
      if(res.ok){
        const j = await res.json();
        setSuggestions(j.suggestions || []);
        setOpen(true);
      }
    }, 200);
    return ()=>{ clearTimeout(t); ctrl.abort(); };
  },[q]);

  function submit(e: React.FormEvent){
    e.preventDefault();
    if(!q.trim()) return;
    window.location.href = '/products?q=' + encodeURIComponent(q.trim());
  }

  return (
    <div className="relative" ref={boxRef}>
      <form onSubmit={submit} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 w-[260px]">
        <Search className="h-4 w-4 opacity-60" />
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          className="bg-transparent outline-none text-sm flex-1"
          placeholder="Search products..."
        />
      </form>
      {open && suggestions.length>0 && (
        <div className="absolute mt-2 w-[360px] z-50 rounded-xl border border-white/10 bg-black/80 backdrop-blur p-2">
          {suggestions.map((s,i)=>(
            <Link key={i} href={'/products/' + s.productSlug} className="flex items-center gap-3 p-2 rounded hover:bg-white/5">
              {s.thumb ? <img src={s.thumb} className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-white/10" />}
              <div className="text-sm">
                <div className="font-medium">{s.title}</div>
                <div className="opacity-70">{s.name}</div>
              </div>
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t border-white/10">
            <Link href={'/products?q=' + encodeURIComponent(q)} className="block text-center text-xs opacity-80 hover:opacity-100">See all results</Link>
          </div>
        </div>
      )}
    </div>
  );
}
