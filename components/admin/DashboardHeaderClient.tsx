"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { DateRangePicker, type AdminDateRange } from "@/components/ui/date-range-picker";

export function DashboardHeaderClient({ user, from, to, exportButton }: { user: { name?: string | null }; from?: Date; to?: Date; exportButton?: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [date, setDate] = useState<AdminDateRange | undefined>({ from, to });

  function applyRange(range: AdminDateRange | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (range?.from && range?.to) {
      params.set("from", format(range.from, "yyyy-MM-dd"));
      params.set("to", format(range.to, "yyyy-MM-dd"));
    } else {
      params.delete("from");
      params.delete("to");
    }
    router.push(params.size ? `/dashboard?${params}` : "/dashboard");
  }

  return <section className="flex flex-col gap-5 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Business overview</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">Good to see you, {user.name || "Admin"}</h2>
      <p className="mt-2 text-sm text-neutral-500">Sales, customers, inventory, and order activity.</p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <DateRangePicker value={date} onChange={setDate} onApply={applyRange} />
      {exportButton}
    </div>
  </section>;
}
