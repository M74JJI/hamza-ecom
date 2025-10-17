'use client';
import { useState } from "react";

export type Highlight = { id?: string; label: string; value: string };

export default function ProductHighlightsEditor({
  initial = [],
  onChange,
}: {
  initial?: Highlight[];
  onChange?: (values: Highlight[]) => void;
}) {
  const [items, setItems] = useState<Highlight[]>(initial);

  function update(index: number, patch: Partial<Highlight>) {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    setItems(next);
    onChange?.(next);
  }

  function add() {
    const next = [...items, { label: "", value: "" }];
    setItems(next);
    onChange?.(next);
  }

  function remove(index: number) {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    onChange?.(next);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold">Highlights</h4>
        <button type="button" onClick={add} className="rounded-xl border px-3 py-1 text-sm">Add highlight</button>
      </div>
      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-3">
            <input className="col-span-5 rounded-xl border border-gray-200 bg-white/70 px-3 py-2" placeholder="Label (e.g., Water resistant)"
              value={it.label} onChange={e => update(idx, { label: e.target.value })}/>
            <input className="col-span-6 rounded-xl border border-gray-200 bg-white/70 px-3 py-2" placeholder="Value (e.g., Premium canvas & leather)"
              value={it.value} onChange={e => update(idx, { value: e.target.value })}/>
            <button type="button" onClick={() => remove(idx)} className="col-span-1 rounded-xl border px-3 py-2 text-sm">×</button>
          </div>
        ))}
        {!items.length && <p className="text-sm text-gray-500">No highlights yet.</p>}
      </div>
      {/* Use on submit: send `items` in your form payload to create/update ProductHighlight rows */}
    </div>
  );
}
