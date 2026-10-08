'use client';

import { useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronDown } from "lucide-react";
import { format } from "date-fns";

export interface AdminDateRange {
  from?: Date;
  to?: Date;
}

interface Props {
  value?: AdminDateRange;
  onChange?: (range: AdminDateRange) => void;
  onApply?: (range: AdminDateRange) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, onApply, className }: Props) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [temp, setTemp] = useState<AdminDateRange>({
    from: value?.from,
    to: value?.to,
  });

  const handleChange = (field: "from" | "to", dateStr: string) => {
    const d = dateStr ? new Date(dateStr + "T00:00:00") : undefined;
    const newRange = { ...temp, [field]: d };
    setTemp(newRange);
    onChange?.(newRange);
  };

  const handleApply = () => {
    if (temp.from && temp.to) {
      onApply?.(temp);
      setOpen(false);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setCoords({ x: rect.left, y: rect.bottom + window.scrollY });
    setOpen((p) => !p);
  };

  const label =
    temp.from && temp.to
      ? `${format(temp.from, "MMM d, yyyy")} → ${format(temp.to, "MMM d, yyyy")}`
      : "All Time";

  return (
    <div className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative z-[10000] flex h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">{label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown in Portal */}
      {typeof window !== "undefined" &&
        createPortal(
          open ? (
              <div
                style={{
                  position: "absolute",
                  top: coords.y,
                  left: coords.x,
                  zIndex: 999999,
                }}
                className="w-72 rounded-lg border border-neutral-200 bg-white p-4 shadow-lg"
              >
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">
                      From
                    </label>
                    <input
                      type="date"
                      value={temp.from ? format(temp.from, "yyyy-MM-dd") : ""}
                      onChange={(e) => handleChange("from", e.target.value)}
                      className="hz-field"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-700">
                      To
                    </label>
                    <input
                      type="date"
                      value={temp.to ? format(temp.to, "yyyy-MM-dd") : ""}
                      onChange={(e) => handleChange("to", e.target.value)}
                      className="hz-field"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTemp({});
                        onApply?.({});
                        setOpen(false);
                      }}
                      className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleApply}
                      className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ) : null,
          document.body
        )}
    </div>
  );
}
