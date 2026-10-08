"use client";

import { Edit, Package, Plus } from "lucide-react";
import Link from "next/link";

type Product = { id: string; slug: string; status: string; isFeaturedInHero: boolean; categories: Array<{ categoryId: string; category: { name: string } }> };

export function ProductsClient({ products }: { products: Product[] }) {
  const published = products.filter((p) => p.status === "PUBLISHED").length;
  const drafts = products.filter((p) => p.status === "DRAFT").length;
  const featured = products.filter((p) => p.isFeaturedInHero).length;
  return <div className="space-y-5">
    <PageHeader title="Products" description="Manage catalog, publishing, categories, and featured placement." action={<Link href="/dashboard/products/new" className="hz-admin-primary"><Plus className="h-4 w-4" /> New product</Link>} />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat label="Total products" value={products.length} /><Stat label="Published" value={published} /><Stat label="Drafts" value={drafts} /><Stat label="Featured" value={featured} />
    </div>
    <section className="hz-admin-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4"><h2 className="font-semibold">Product catalog</h2><span className="text-xs text-neutral-500">Newest first</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
        <thead><tr><Th>Product</Th><Th>Status</Th><Th>Categories</Th><Th>Placement</Th><Th><span className="sr-only">Actions</span></Th></tr></thead>
        <tbody className="divide-y divide-neutral-200">{products.map((product) => <tr key={product.id} className="hover:bg-neutral-50">
          <td className="p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-neutral-100 text-neutral-500"><Package className="h-4 w-4" /></span><div><p className="font-medium text-neutral-950">{humanize(product.slug)}</p><p className="mt-0.5 font-mono text-xs text-neutral-500">{product.slug}</p></div></div></td>
          <td className="p-4"><Badge tone={product.status === "PUBLISHED" ? "green" : "gray"}>{humanize(product.status)}</Badge></td>
          <td className="p-4"><div className="flex flex-wrap gap-1.5">{product.categories.length ? product.categories.slice(0, 3).map((item) => <Badge key={item.categoryId}>{item.category.name}</Badge>) : <span className="text-neutral-400">Uncategorized</span>}</div></td>
          <td className="p-4">{product.isFeaturedInHero ? <Badge tone="dark">Featured</Badge> : <span className="text-neutral-400">Standard</span>}</td>
          <td className="p-4 text-right"><Link href={`/dashboard/products/${product.id}`} className="hz-admin-secondary"><Edit className="h-3.5 w-3.5" /> Edit</Link></td>
        </tr>)}</tbody>
      </table></div>
      {!products.length && <Empty title="No products yet" text="Create your first product to start building catalog." />}
    </section>
  </div>;
}

function PageHeader({ title, description, action }: { title: string; description: string; action: React.ReactNode }) { return <header className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-1 text-sm text-neutral-500">{description}</p></div>{action}</header>; }
function Stat({ label, value }: { label: string; value: number }) { return <div className="hz-admin-panel p-4"><p className="text-xs text-neutral-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>; }
function Th({ children }: { children: React.ReactNode }) { return <th className="bg-neutral-50 p-4 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{children}</th>; }
function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "green" | "dark" }) { const style = tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : tone === "dark" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-100 text-neutral-600"; return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${style}`}>{children}</span>; }
function Empty({ title, text }: { title: string; text: string }) { return <div className="p-12 text-center"><Package className="mx-auto h-8 w-8 text-neutral-300" /><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-1 text-sm text-neutral-500">{text}</p></div>; }
function humanize(value: string) { return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
