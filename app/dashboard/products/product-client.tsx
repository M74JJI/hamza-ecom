"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Edit, Package, Plus, Search } from "lucide-react";
import Link from "next/link";

type Product = { id: string; slug: string; status: string; isFeaturedInHero: boolean; createdAt: string; categories: Array<{ categoryId: string; category: { name: string } }> };
type Sort = "newest" | "oldest" | "name-asc" | "name-desc";

export function ProductsClient({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const published = products.filter((p) => p.status === "PUBLISHED").length;
  const drafts = products.filter((p) => p.status === "DRAFT").length;
  const featured = products.filter((p) => p.isFeaturedInHero).length;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => status === "all" || product.status === status).filter((product) => !needle || product.slug.toLowerCase().includes(needle) || product.categories.some((item) => item.category.name.toLowerCase().includes(needle))).slice().sort((a, b) => sort === "oldest" ? +new Date(a.createdAt) - +new Date(b.createdAt) : sort === "name-asc" ? a.slug.localeCompare(b.slug) : sort === "name-desc" ? b.slug.localeCompare(a.slug) : +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [products, query, sort, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const resetPage = () => setPage(1);

  return <div className="space-y-5">
    <PageHeader title="Products" description="Manage catalog, publishing, categories, and featured placement." action={<Link href="/dashboard/products/new" className="hz-admin-primary"><Plus className="h-4 w-4" /> New product</Link>} />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat label="Total products" value={products.length} /><Stat label="Published" value={published} /><Stat label="Drafts" value={drafts} /><Stat label="Featured" value={featured} /></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" /><input value={query} onChange={(e) => { setQuery(e.target.value); resetPage(); }} placeholder="Search products or categories" className="h-10 w-full pl-9 pr-3 text-sm" /></label>
      <select value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }} className="h-10 px-3 text-sm"><option value="all">All statuses</option><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option></select>
      <select value={sort} onChange={(e) => { setSort(e.target.value as Sort); resetPage(); }} className="h-10 px-3 text-sm"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></select>
      <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); resetPage(); }} className="h-10 px-3 text-sm"><option value="10">10 per page</option><option value="25">25 per page</option><option value="50">50 per page</option></select>
    </div>
    <section className="hz-admin-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4"><h2 className="font-semibold">Product catalog <span className="font-normal text-neutral-400">({filtered.length})</span></h2><span className="text-xs text-neutral-500">Showing {filtered.length ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(safePage * pageSize, filtered.length)}</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr><Th>Product</Th><Th>Status</Th><Th>Categories</Th><Th>Placement</Th><Th><span className="sr-only">Actions</span></Th></tr></thead><tbody className="divide-y divide-neutral-200">{rows.map((product) => <tr key={product.id} className="hover:bg-neutral-50"><td className="p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-neutral-100 text-neutral-500"><Package className="h-4 w-4" /></span><div><p className="font-medium text-neutral-950">{humanize(product.slug)}</p><p className="mt-0.5 font-mono text-xs text-neutral-500">{product.slug}</p></div></div></td><td className="p-4"><Badge tone={product.status === "PUBLISHED" ? "green" : "gray"}>{humanize(product.status)}</Badge></td><td className="p-4"><div className="flex flex-wrap gap-1.5">{product.categories.length ? product.categories.slice(0, 3).map((item) => <Badge key={item.categoryId}>{item.category.name}</Badge>) : <span className="text-neutral-400">Uncategorized</span>}</div></td><td className="p-4">{product.isFeaturedInHero ? <Badge tone="dark">Featured</Badge> : <span className="text-neutral-400">Standard</span>}</td><td className="p-4 text-right"><Link href={`/dashboard/products/${product.id}`} className="hz-admin-secondary"><Edit className="h-3.5 w-3.5" /> Edit</Link></td></tr>)}</tbody></table></div>
      {!rows.length && <Empty title="No products found" text="Try changing search or filters." />}
      <Pagination page={safePage} pages={pages} onPage={setPage} />
    </section>
  </div>;
}

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) { return <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-3 text-sm"><span className="text-neutral-500">Page {page} of {pages}</span><div className="flex items-center gap-1"><button className="hz-admin-icon" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>{Array.from({ length: pages }, (_, i) => i + 1).map((value) => <button key={value} onClick={() => onPage(value)} className={`min-w-9 rounded-md border px-2 py-1.5 ${value === page ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white"}`}>{value}</button>)}<button className="hz-admin-icon" disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div></div>; }
function PageHeader({ title, description, action }: { title: string; description: string; action: React.ReactNode }) { return <header className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-1 text-sm text-neutral-500">{description}</p></div>{action}</header>; }
function Stat({ label, value }: { label: string; value: number }) { return <div className="hz-admin-panel p-4"><p className="text-xs text-neutral-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>; }
function Th({ children }: { children: React.ReactNode }) { return <th className="bg-neutral-50 p-4 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{children}</th>; }
function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "green" | "dark" }) { const style = tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : tone === "dark" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-100 text-neutral-600"; return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${style}`}>{children}</span>; }
function Empty({ title, text }: { title: string; text: string }) { return <div className="p-12 text-center"><Package className="mx-auto h-8 w-8 text-neutral-300" /><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-1 text-sm text-neutral-500">{text}</p></div>; }
function humanize(value: string) { return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
