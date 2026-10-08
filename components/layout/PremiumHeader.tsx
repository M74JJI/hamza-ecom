"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ChevronDown, Heart, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { HamzaLogo } from "@/components/brand/HamzaLogo";

type Category = { id: string; name: string; slug: string; productCount: number };
const fetcher = (url: string) => fetch(url).then((response) => response.json());

function Brand() {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label="Hamza store home">
      <HamzaLogo size={44} priority />
    </Link>
  );
}

export default function PremiumHeader({ user }: { user?: any }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [query, setQuery] = useState("");
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { count } = useCart();
  const { data } = useSWR<{ items: Category[] }>("/api/categories/header", fetcher, { revalidateOnFocus: false, revalidateOnReconnect: false });
  const categories = useMemo(() => (data?.items ?? []).slice(0, 5), [data]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setMobileOpen(false);
    router.push(`/browse?q=${encodeURIComponent(value)}`);
  }

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("Sign-out request failed");
      window.location.replace("/");
    } catch {
      setSigningOut(false);
      window.location.reload();
    }
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
          {user ? (
            <div ref={accountMenuRef} className="relative">
              <button type="button" onClick={() => setAccountOpen((open) => !open)} className="hz-icon-button w-auto gap-1 px-2.5" aria-label="Account menu" aria-haspopup="menu" aria-expanded={accountOpen}>
                <User className="h-5 w-5" />
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
              </button>
              {accountOpen && (
                <div role="menu" className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-lg border border-neutral-200 bg-white p-2 shadow-lg">
                  <div className="border-b border-neutral-100 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-neutral-950">{user.name || "Your account"}</p>
                    <p className="truncate text-xs text-neutral-500">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link role="menuitem" href="/profile" onClick={() => setAccountOpen(false)} className="hz-account-menu-item"><User className="h-4 w-4" />Account</Link>
                    <Link role="menuitem" href="/profile/orders" onClick={() => setAccountOpen(false)} className="hz-account-menu-item"><Package className="h-4 w-4" />Orders</Link>
                    <Link role="menuitem" href="/profile/wishlist" onClick={() => setAccountOpen(false)} className="hz-account-menu-item"><Heart className="h-4 w-4" />Wishlist</Link>
                    {user.role === "ADMIN" && <Link role="menuitem" href="/dashboard" onClick={() => setAccountOpen(false)} className="hz-account-menu-item"><LayoutDashboard className="h-4 w-4" />Admin dashboard</Link>}
                  </div>
                  <div className="border-t border-neutral-100 pt-1">
                    <button role="menuitem" type="button" onClick={signOut} disabled={signingOut} className="hz-account-menu-item w-full text-red-700 disabled:opacity-60"><LogOut className="h-4 w-4" />{signingOut ? "Signing out…" : "Sign out"}</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/signin" className="hz-icon-button" aria-label="Sign in"><User className="h-5 w-5" /></Link>
          )}
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
            {user && <button type="button" onClick={signOut} disabled={signingOut} className="hz-mobile-link w-full text-left text-red-700 disabled:opacity-60">{signingOut ? "Signing out…" : "Sign out"}</button>}
          </nav>
        </div>
      )}
    </header>
  );
}
