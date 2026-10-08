import type { ReactNode } from "react";
import Link from "next/link";
import { HamzaLogo } from "@/components/brand/HamzaLogo";

export function AuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return (
    <main className="bg-stone-50 px-4 py-12 sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-xl border border-neutral-200 bg-white lg:grid-cols-[.8fr_1.2fr]">
        <aside className="border-b border-neutral-200 bg-neutral-950 p-8 text-white lg:border-b-0 lg:border-r lg:p-12">
          <Link href="/" className="inline-flex items-center" aria-label="Hamza store home">
            <HamzaLogo size={48} inverted priority />
          </Link>
          <div className="mt-16">
            <p className="text-xs font-bold tracking-[0.2em] text-neutral-400">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.045em]">{title}</h1>
            <p className="mt-5 text-sm leading-7 text-neutral-300">{description}</p>
          </div>
          <div className="mt-12 border-t border-white/15 pt-6 text-xs leading-5 text-neutral-400">Secure account access. No invented offers or membership claims.</div>
        </aside>
        <section className="p-6 sm:p-10 lg:p-12">{children}</section>
      </div>
    </main>
  );
}
