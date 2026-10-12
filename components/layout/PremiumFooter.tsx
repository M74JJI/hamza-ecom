import Link from "next/link";
import { PackageCheck, ShieldCheck, ShoppingBag } from "lucide-react";

const footerSections = [
  {
    title: "Shop",
    links: [
      { name: "Current catalog", href: "/browse" },
      { name: "Cart", href: "/cart" },
    ],
  },
  {
    title: "Account",
    links: [
      { name: "Profile", href: "/profile" },
      { name: "Orders", href: "/profile/orders" },
      { name: "Wishlist", href: "/profile/wishlist" },
      { name: "Security", href: "/profile/security" },
    ],
  },
] as const;

export default function PremiumFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-stone-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-md">
          <Link href="/" className="inline-flex items-center gap-3 text-xl font-black text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-stone-950">H</span>
            HAMZA
          </Link>
          <p className="mt-4 text-sm leading-6 text-stone-400">
            Products, prices, availability, and categories shown on this store come from the live catalog managed in the dashboard.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-stone-300">
            <div className="flex items-center gap-3">
              <PackageCheck className="h-4 w-4 text-emerald-400" />
              Stock is checked again during checkout
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Account and checkout requests are protected
            </div>
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-4 w-4 text-emerald-400" />
              Shipping options are calculated at checkout
            </div>
          </div>
        </div>

        {footerSections.map((section) => (
          <nav key={section.title} aria-label={`${section.title} links`}>
            <h2 className="font-bold text-white">{section.title}</h2>
            <ul className="mt-4 space-y-3">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-stone-400 transition hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} HAMZA. Prices are displayed in MAD.
      </div>
    </footer>
  );
}
