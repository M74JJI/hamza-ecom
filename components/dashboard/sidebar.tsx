"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, Gift, LayoutDashboard, Package, ShoppingCart, Truck, Users } from "lucide-react";
import { signOutAction } from "@/app/(store)/(auth)/actions";
import { HamzaLogo } from "@/components/brand/HamzaLogo";

const items = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Categories", href: "/dashboard/categories", icon: Folder },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Coupons", href: "/dashboard/coupons", icon: Gift },
  { name: "Shipping", href: "/dashboard/shipping", icon: Truck },
];

export function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const active = (href: string) => href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 text-white lg:flex">
        <Link href="/dashboard" className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <HamzaLogo size={40} inverted priority />
          <span className="text-[10px] font-semibold tracking-[0.18em] text-neutral-400">ADMIN</span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Dashboard navigation">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${active(item.href) ? "bg-white text-neutral-950" : "text-neutral-400 hover:bg-neutral-900 hover:text-white"}`}>
              <item.icon className="h-4 w-4" />{item.name}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate px-3 text-sm font-medium">{user?.name || "Administrator"}</p>
          <p className="truncate px-3 pt-1 text-xs text-neutral-500">{user?.email}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href="/" className="rounded-lg border border-white/15 px-3 py-2 text-center text-xs font-semibold text-neutral-300 hover:bg-white/10">Store</Link>
            <form action={signOutAction}><button type="submit" className="w-full rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-white/10">Sign out</button></form>
          </div>
        </div>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-50 flex overflow-x-auto border-t border-neutral-200 bg-white px-2 py-2 lg:hidden" aria-label="Mobile dashboard navigation">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={`flex min-w-[72px] flex-1 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium ${active(item.href) ? "bg-neutral-950 text-white" : "text-neutral-500"}`}>
            <item.icon className="h-4 w-4" />{item.name}
          </Link>
        ))}
      </nav>
    </>
  );
}
