"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { signOutAction } from "@/app/(store)/(auth)/actions";
import { useCart } from "@/hooks/useCart";

type Category = { id: string; name: string; slug: string; productCount: number };
const fetcher = (url: string) => fetch(url).then((response) => response.json());

function Brand() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Hamza store home">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-950 text-base font-black tracking-tight text-white">H.</span>
      <span className="leading-none">
        <span className="block text-lg font-black tracking-[-0.04em] text-neutral-950">HAMZA</span>
        <span className="mt-1 block text-[10px] font-semibold tracking-[0.24em] text-neutral-500">STORE</span>
      </span>
    </Link>
  );
}

export default function PremiumHeader({ user }: { user?: any }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { count } = useCart();
  const { data } = useSWR<{ items: Category[] }>("/api/categories/header", fetcher, { revalidateOnFocus: false, revalidateOnReconnect: false });
  const categories = useMemo(() => (data?.items ?? []).slice(0, 5), [data]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setMobileOpen(false);
    router.push(`/browse?q=${encodeURIComponent(value)}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <Link href="/browse" className="hz-nav-link">Shop</Link>
          {categories.map((category) => <Link key={category.id} href={`/browse?category=${encodeURIComponent(category.id)}`} className="hz-nav-link">{category.name}</Link>)}
        </nav>
        <form onSubmit={submitSearch} className="relative ml-auto hidden w-full max-w-xs md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-950/5" />
        </form>
        <div className="hidden items-center gap-1 sm:flex">
          <Link href="/profile/wishlist" className="hz-icon-button" aria-label="Wishlist"><Heart className="h-5 w-5" /></Link>
          <Link href={user ? "/profile" : "/signin"} className="hz-icon-button" aria-label={user ? "Account" : "Sign in"}><User className="h-5 w-5" /></Link>
          <Link href="/cart" className="hz-icon-button relative" aria-label={`Cart with ${count} items`}>
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-neutral-950 px-1 text-center text-[10px] font-bold leading-4 text-white">{count}</span>}
          </Link>
        </div>
        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="hz-icon-button lg:hidden" aria-expanded={mobileOpen} aria-label="Toggle menu">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-5 lg:hidden">
          <form onSubmit={submitSearch} className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm outline-none focus:border-neutral-400" />
          </form>
          <nav className="grid gap-1" aria-label="Mobile navigation">
            <Link href="/browse" onClick={() => setMobileOpen(false)} className="hz-mobile-link">Shop all</Link>
            {categories.map((category) => <Link key={category.id} href={`/browse?category=${encodeURIComponent(category.id)}`} onClick={() => setMobileOpen(false)} className="hz-mobile-link">{category.name}</Link>)}
            <div className="my-2 border-t border-neutral-200" />
            <Link href="/cart" onClick={() => setMobileOpen(false)} className="hz-mobile-link">Cart ({count})</Link>
            <Link href="/profile/wishlist" onClick={() => setMobileOpen(false)} className="hz-mobile-link">Wishlist</Link>
            <Link href={user ? "/profile" : "/signin"} onClick={() => setMobileOpen(false)} className="hz-mobile-link">{user ? "Account" : "Sign in"}</Link>
            {user?.role === "ADMIN" && <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="hz-mobile-link">Dashboard</Link>}
            {user && <form action={signOutAction}><button type="submit" className="hz-mobile-link w-full text-left text-red-700">Sign out</button></form>}
          </nav>
        </div>
      )}
    </header>
  );
}
