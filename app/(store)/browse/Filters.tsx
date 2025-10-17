export default function Filters({
  categories,
  selected,
}: {
  categories: { id: string; name: string; slug: string }[];
  selected?: { category?: string; size?: string; color?: string; inStock?: boolean; min?: number; max?: number };
}) {
  return (
    <aside className="sticky top-20 z-10 rounded-2xl border border-white/10 bg-white/40 p-4 backdrop-blur-md shadow-lg">
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-700">Filters</h3>
      <div className="space-y-4 text-sm">
        <div>
          <label className="mb-1 block font-medium">Category</label>
          <select
            name="category"
            defaultValue={selected?.category ?? ""}
            className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-medium">Min MAD</label>
            <input type="number" name="min" defaultValue={selected?.min ?? ""} className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2"/>
          </div>
          <div>
            <label className="mb-1 block font-medium">Max MAD</label>
            <input type="number" name="max" defaultValue={selected?.max ?? ""} className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-medium">Size</label>
            <input type="text" name="size" defaultValue={selected?.size ?? ""} className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2" placeholder="M / 42 / 9"/>
          </div>
          <div>
            <label className="mb-1 block font-medium">Color</label>
            <input type="text" name="color" defaultValue={selected?.color ?? ""} className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2" placeholder="Black"/>
          </div>
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="inStock" defaultChecked={!!selected?.inStock} className="h-4 w-4 rounded border-gray-300"/>
          <span>In stock only</span>
        </label>
        <button className="mt-2 w-full rounded-xl bg-black px-4 py-2 text-white shadow-md">Apply</button>
      </div>
    </aside>
  );
}
