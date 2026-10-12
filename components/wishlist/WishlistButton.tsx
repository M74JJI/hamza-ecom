"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

type WishlistResponse = {
  items: Array<{ productId: string; variantId: string }>;
};

const fetcher = (url: string) => fetch(url).then((response) => response.json());

export default function WishlistButton({ productId, variantId }: { productId: string; variantId?: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { data, mutate } = useSWR<WishlistResponse>("/api/wishlist", fetcher, {
    revalidateOnFocus: false,
  });
  const inWish = Boolean(
    variantId && data?.items.some((item) => item.productId === productId && item.variantId === variantId),
  );

  function toggle() {
    if (!variantId) return;
    startTransition(async () => {
      const action = inWish ? "remove" : "add";
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId, action }),
      });
      if (res.status === 401) {
        router.push(`/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      if (res.ok) await mutate();
    });
  }

  return (
    <button type="button" onClick={toggle} disabled={isPending || !variantId} aria-pressed={inWish}
      className={`rounded-2xl border px-3 py-1.5 text-sm transition-all shadow-sm ${inWish ? "border-rose-400 bg-rose-50 text-rose-700" : "border-gray-200 bg-white/70 hover:bg-gray-50"}`}>
      {inWish ? "♥ In wishlist" : "♡ Add to wishlist"}
    </button>
  );
}
