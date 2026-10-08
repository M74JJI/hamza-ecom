"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";

export default function AddToCartButton({ onClick, disabled, alreadyQty }: { onClick: () => void; disabled?: boolean; alreadyQty?: number }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [added]);

  function handleClick() {
    if (disabled) return;
    onClick();
    setAdded(true);
  }

  return (
    <button type="button" onClick={handleClick} disabled={disabled} className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 ${added ? "bg-emerald-700 text-white" : "bg-neutral-950 text-white hover:bg-neutral-800"}`}>
      {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {added ? "Added to cart" : "Add to cart"}
      {!added && typeof alreadyQty === "number" && alreadyQty > 0 && <span className="border-l border-white/30 pl-2 text-xs text-neutral-300">{alreadyQty} in cart</span>}
    </button>
  );
}
