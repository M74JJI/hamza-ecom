'use client';

import { useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface Props {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  onApply?: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, onApply, className }: Props) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [temp, setTemp] = useState<DateRange>({
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
      {/* Trigger Button */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 relative z-[10000]"
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">{label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </motion.button>

      {/* Dropdown in Portal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  top: coords.y,
                  left: coords.x,
                  zIndex: 999999, // 👈 high enough to beat anything
                }}
                className="w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl p-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={temp.from ? format(temp.from, "yyyy-MM-dd") : ""}
                      onChange={(e) => handleChange("from", e.target.value)}
                      className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300/30 dark:border-gray-600/40 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={temp.to ? format(temp.to, "yyyy-MM-dd") : ""}
                      onChange={(e) => handleChange("to", e.target.value)}
                      className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300/30 dark:border-gray-600/40 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <motion.button
                      onClick={() => {
                        setTemp({});
                        onApply?.({});
                        setOpen(false);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-sm px-3 py-2 rounded-lg bg-gray-200/70 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-300/70 dark:hover:bg-gray-600/70"
                    >
                      Clear
                    </motion.button>
                    <motion.button
                      onClick={handleApply}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-300"
                    >
                      Apply
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
