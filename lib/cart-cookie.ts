'use client';

import { Cart, CartItem } from './cart-types';

const COOKIE = 'hajzen_cart';
const DAYS = 30;
const LS_PING = 'hajzen_cart_ping';

const CART_EVT = 'hajzen:cart';

function broadcastCartPing() {
  // Cross-tab (other tabs)
  try { localStorage.setItem(LS_PING, String(Date.now())); } catch {}
  // Same tab
  try { window.dispatchEvent(new CustomEvent(CART_EVT)); } catch {}
}

function writeCookie(name: string, value: string, days = DAYS) {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;

  // 🔔 notify both same-tab and other tabs
  broadcastCartPing();
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return m ? decodeURIComponent(m.pop() as string) : null;
}


export function getCart(): Cart {
  try{
    const raw = readCookie(COOKIE);
    if(!raw) return { items: [], updatedAt: Date.now() };
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.items)) return { items: [], updatedAt: Date.now() };
    return { items: data.items, updatedAt: Date.now() };
  }catch{
    return { items: [], updatedAt: Date.now() };
  }
}

function saveCart(cart: Cart){
  writeCookie(COOKIE, JSON.stringify({ items: cart.items, updatedAt: Date.now() }));
}

const keyOf = (it: Pick<CartItem, 'variantSizeId'>) => it.variantSizeId;

export function getItemQty(variantSizeId: string){
  const cart = getCart();
  const found = cart.items.find(it => it.variantSizeId === variantSizeId);
  return found ? found.qty : 0;
}

export function addItemToCart(newItem: CartItem){
  const cart = getCart();
  const idx = cart.items.findIndex(it => keyOf(it) === keyOf(newItem));
  if(idx >= 0){
    const max = newItem.maxStock;
    const mergedQty = Math.min(cart.items[idx].qty + newItem.qty, max);
    cart.items[idx] = { ...cart.items[idx], qty: mergedQty, finalUnitPriceMAD: newItem.finalUnitPriceMAD };
  }else{
    newItem.qty = Math.max(1, Math.min(newItem.qty, newItem.maxStock));
    cart.items.unshift(newItem);
  }
  saveCart(cart);
  return cart;
}

export function setItemQty(variantSizeId: string, qty: number){
  const cart = getCart();
  const idx = cart.items.findIndex(it => it.variantSizeId === variantSizeId);
  if(idx >= 0){
    const max = cart.items[idx].maxStock;
    const clamped = Math.max(1, Math.min(qty, max));
    cart.items[idx] = { ...cart.items[idx], qty: clamped };
    saveCart(cart);
  }
  return cart;
}

export function updateQty(variantSizeId: string, qty: number){
  return setItemQty(variantSizeId, qty);
}

export function removeItem(variantSizeId: string){
  const cart = getCart();
  cart.items = cart.items.filter(it => it.variantSizeId !== variantSizeId);
  saveCart(cart);
  return cart;
}

export function clearCart(){
  const cart = { items: [], updatedAt: Date.now() };
  saveCart(cart);
  return cart;
}
