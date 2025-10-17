export type CartItem = {
  productId: string;
  productSlug: string;
  variantId: string;
  variantTitle: string;
  variantName: string;
  variantStyleImg?: string | null;
  variantImage?: string | null;
  variantSizeId: string;
  sizeLabel: string;
  sku: string;
  unitPriceMAD: number;
  discountPercent?: number | null;
  finalUnitPriceMAD: number;
  maxStock: number;
  qty: number;
};

export type Cart = {
  items: CartItem[];
  updatedAt: number;
};

export function lineTotalMAD(item: CartItem) {
  return Number((item.finalUnitPriceMAD * item.qty).toFixed(2));
}

export function subtotalMAD(cart: Cart) {
  return Number(cart.items.reduce((sum, it) => sum + lineTotalMAD(it), 0).toFixed(2));
}
