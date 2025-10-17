'use client';
import { useEffect, useState } from 'react';

export default function useScrollPosition(threshold: number = 10){
  const [scrolled, setScrolled] = useState(false);
  useEffect(()=>{
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  },[threshold]);
  return scrolled;
}
