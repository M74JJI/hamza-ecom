// components/admin/low-stock-alert.tsx
interface LowStockItem {
  id: string;
  size: string;
  sku: string;
  stockQty: number;
  variant: {
    title: string;
  };
}

interface LowStockAlertProps {
  lowStock: LowStockItem[];
}

export function LowStockAlert({ lowStock }: LowStockAlertProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
      <h3 className="font-semibold text-neutral-950">
        Inventory attention
      </h3>
      <span className="text-xs font-medium text-neutral-500">{lowStock.length} items</span>
      </div>
      <div className="divide-y divide-neutral-100 px-5">
        {lowStock.length === 0 ? (
          <p className="py-5 text-sm text-neutral-500">All products have healthy stock.</p>
        ) : (
          lowStock.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {s.variant.title}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Size {s.size} • SKU {s.sku}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${s.stockQty === 0 ? 'text-red-700' : 'text-amber-700'}`}>
                  {s.stockQty} left
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {s.stockQty === 0 ? 'Out of stock' : 'Low stock'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
