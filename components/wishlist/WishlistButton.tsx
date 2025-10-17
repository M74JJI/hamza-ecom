"use client";
import { useState, useTransition } from "react";

export default function WishlistButton({ productId, initial = false }: { productId: string; initial?: boolean }) {
  const [inWish, setInWish] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const action = inWish ? "remove" : "add";
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, action }),
      });
      if (res.ok) setInWish(!inWish);
    });
  }

  return (
    <button onClick={toggle} disabled={isPending}
      className={`rounded-2xl border px-3 py-1.5 text-sm transition-all shadow-sm ${inWish ? "border-rose-400 bg-rose-50 text-rose-700" : "border-gray-200 bg-white/70 hover:bg-gray-50"}`}>
      {inWish ? "♥ In wishlist" : "♡ Add to wishlist"}
    </button>
  );
}
