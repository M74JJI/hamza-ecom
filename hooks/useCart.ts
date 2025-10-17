'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Cart } from '@/lib/cart-types';
import { addItemToCart, clearCart, getCart, getItemQty, removeItem, setItemQty, updateQty } from '@/lib/cart-cookie';

const CART_EVT = 'hajzen:cart'; // 👈 same name used when dispatching in cart-cookie

export function useCart(){
  const [cart, setCart] = useState<Cart>({ items: [], updatedAt: Date.now() });

  const refresh = useCallback(() => setCart(getCart()), []);

  useEffect(() => {
    refresh();

    const onFocus = () => refresh();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'hajzen_cart_ping') refresh(); // cross-tab updates
    };

    const onCartEvent = () => refresh();           // 👈 same-tab updates

    const onVisibility = () => {
      if (!document.hidden) refresh();             // optional: refresh when tab becomes visible
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    window.addEventListener(CART_EVT, onCartEvent as EventListener);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(CART_EVT, onCartEvent as EventListener);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refresh]);

  const actions = useMemo(() => ({
    add: (item: any) => setCart(addItemToCart(item)),
    updateQty: (id: string, qty: number) => setCart(updateQty(id, qty)),
    setQty: (id: string, qty: number) => setCart(setItemQty(id, qty)),
    remove: (id: string) => setCart(removeItem(id)),
    clear: () => setCart(clearCart()),
    inCartQty: (id: string) => getItemQty(id),
    refresh,
  }), [refresh]);

  const count = cart.items.reduce((n, it) => n + it.qty, 0);

  return { cart, count, ...actions };
}
