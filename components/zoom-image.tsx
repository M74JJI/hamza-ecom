'use client';

import { useRef, useState } from 'react';

export function ZoomImage({ src, alt }: { src: string; alt: string }){
  const containerRef = useRef<HTMLDivElement>(null);
  const [bgPos, setBgPos] = useState('center');

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg border border-white/10"
      style={{ backgroundImage: `url(${src})`, backgroundRepeat: 'no-repeat', backgroundPosition: bgPos, backgroundSize: '200%' }}
      onMouseMove={(e)=>{
        const rect = containerRef.current!.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setBgPos(`${x}% ${y}%`);
      }}
      onMouseLeave={()=>setBgPos('center')}
    >
      <img src={src} alt={alt} className="opacity-0 w-full h-auto select-none pointer-events-none" />
    </div>
  );
}
