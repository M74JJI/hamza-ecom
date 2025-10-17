'use client';

import { useRouter } from "next/navigation";

export default function DashboardFilters({ current }: { current: number }){
  const router = useRouter();
  return (
    <form className="flex gap-2 items-center" onChange={(e)=>{
      const form=e.currentTarget as HTMLFormElement;
      const val=(form.elements.namedItem('range') as HTMLSelectElement).value;
      router.push(`/dashboard?range=${val}`);
    }}>
      <label htmlFor="range" className="text-sm opacity-70">Range:</label>
      <select name="range" defaultValue={current} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-sm">
        <option value="7">7 days</option>
        <option value="30">30 days</option>
        <option value="90">90 days</option>
      </select>
    </form>
  );
}
