'use client';

import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

export default function ConfettiBurst(){
  const [run, setRun] = useState(false);
  const [dim, setDim] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => setDim({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    setRun(true);
    const t = setTimeout(()=> setRun(false), 4000); // 4s burst
    return () => { window.removeEventListener('resize', update); clearTimeout(t); };
  }, []);

  return run ? <Confetti width={dim.width} height={dim.height} numberOfPieces={300} recycle={false} /> : null;
}
