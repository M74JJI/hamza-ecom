"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/products": "Products",
  "/dashboard/categories": "Categories",
  "/dashboard/orders": "Orders",
  "/dashboard/customers": "Customers",
  "/dashboard/coupons": "Coupons",
  "/dashboard/shipping": "Shipping",
};

export function AdminHeaderClient({ user }: { user: { email?: string | null } }) {
  const pathname = usePathname();
  const title = Object.entries(titles)
    .sort(([a], [b]) => b.length - a.length)
    .find(([path]) => path === "/dashboard" ? pathname === path : pathname.startsWith(path))?.[1] ?? "Admin";

  return <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-5 lg:px-8">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">HAMZA administration</p>
        <h1 className="truncate text-lg font-semibold tracking-tight text-neutral-950">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <p className="hidden max-w-64 truncate text-xs text-neutral-500 sm:block">{user.email}</p>
        <Link href="/" className="inline-flex h-9 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-xs font-semibold text-neutral-800 hover:bg-neutral-50">
          Store <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  </header>;
}
