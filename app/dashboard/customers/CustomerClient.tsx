"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, User } from "lucide-react";

type Customer = { id: string; name: string | null; email: string; createdAt: string; totalOrders: number; totalSpent: number };
type SortOption = "newest" | "oldest" | "alpha-asc" | "alpha-desc" | "orders-desc" | "spent-desc";

export function CustomersClient({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState(""); const [sort, setSort] = useState<SortOption>("newest"); const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10);
  const filtered = useMemo(() => {
    const value = query.toLowerCase(); const list = customers.filter((c) => c.name?.toLowerCase().includes(value) || c.email.toLowerCase().includes(value));
    return list.sort((a, b) => sort === "oldest" ? +new Date(a.createdAt) - +new Date(b.createdAt) : sort === "alpha-asc" ? (a.name || "").localeCompare(b.name || "") : sort === "alpha-desc" ? (b.name || "").localeCompare(a.name || "") : sort === "orders-desc" ? b.totalOrders - a.totalOrders : sort === "spent-desc" ? b.totalSpent - a.totalSpent : +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [customers, query, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize)); const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  return <div className="space-y-5">
    <header className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 lg:flex-row lg:items-end"><div><h1 className="text-2xl font-semibold tracking-tight">Customers</h1><p className="mt-1 text-sm text-neutral-500">Registered accounts and lifetime order activity.</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search customers" className="h-10 w-full pl-9 pr-3 text-sm sm:w-64" /></label><select value={sort} onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }} className="h-10 px-3 text-sm"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="alpha-asc">Name A–Z</option><option value="alpha-desc">Name Z–A</option><option value="orders-desc">Most orders</option><option value="spent-desc">Highest spend</option></select></div></header>
    <section className="hz-admin-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4"><h2 className="font-semibold">Customer directory <span className="font-normal text-neutral-400">({filtered.length})</span></h2><label className="flex items-center gap-2 text-xs text-neutral-500">Rows<select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="h-8 px-2"><option>10</option><option>25</option><option>50</option></select></label></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr>{["Customer", "Email", "Orders", "Lifetime spend", "Joined"].map((label) => <th key={label} className="bg-neutral-50 p-4 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</th>)}</tr></thead><tbody className="divide-y divide-neutral-200">{rows.map((c) => <tr key={c.id} className="hover:bg-neutral-50"><td className="p-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100"><User className="h-4 w-4 text-neutral-500" /></span><span className="font-medium text-neutral-950">{c.name || "Unnamed customer"}</span></div></td><td className="p-4 text-neutral-600">{c.email}</td><td className="p-4 font-medium">{c.totalOrders}</td><td className="p-4 font-medium">{c.totalSpent.toFixed(2)} MAD</td><td className="p-4 text-neutral-500">{new Date(c.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>
      {!rows.length && <div className="p-10 text-center text-sm text-neutral-500">No customers found.</div>}
      <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-3 text-sm"><span className="text-neutral-500">Page {page} of {pages}</span><div className="flex gap-2"><button className="hz-admin-icon" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><button className="hz-admin-icon" disabled={page === pages} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div></div>
    </section>
  </div>;
}
