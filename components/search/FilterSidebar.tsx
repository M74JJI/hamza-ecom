'use client';
import { useCallback, useEffect, useRef, useState } from "react";
import { RangeSlider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle, Star, ChevronRight } from "lucide-react";
import { useDebouncedCallback } from "use-debounce"; 

/* ---------------------- 🧩 Recursive Category Tree ---------------------- */
function CategoryTree({
  nodes,
  selectedIds,
  onToggle,
  level = 0,
}: {
  nodes: any[];
  selectedIds: string[];
  onToggle: (id: string, node: any, level?: number) => void;
  level?: number;
}) {
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const open: Record<string, boolean> = {};
    const visit = (node: any): boolean => {
      const childSelected = (node.children || []).some(visit);
      const selected = selectedIds.includes(node.id);
      if (childSelected) open[node.id] = true;
      return selected || childSelected;
    };
    nodes.forEach(visit);
    if (Object.keys(open).length) setOpenNodes((current) => ({ ...current, ...open }));
  }, [nodes, selectedIds]);
  const toggle = (id: string) =>
    setOpenNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  
  return (
    <div style={{ paddingLeft: `${level * 10}px` }}>
      {nodes.map((node) => (
        <div key={node.id} className="mb-1">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={() => onToggle(node.id, node, level)}
              whileHover={{ x: 3 }}
              className={`flex-1 text-left py-2 px-3 rounded-xl text-sm transition-all ${
                selectedIds.includes(node.id)
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              {node.name}
            </motion.button>
            {node.children?.length > 0 && (
              <button
                onClick={() => toggle(node.id)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                {openNodes[node.id] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
          <AnimatePresence>
            {openNodes[node.id] && node.children?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-3 border-l border-gray-100 pl-3"
              >
                <CategoryTree
                  nodes={node.children}
                  selectedIds={selectedIds}
                  onToggle={onToggle}
                  level={level + 1}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ---------------------- 🧭 Filter Sidebar ---------------------- */
function normalizeFacetFilters(source: Record<string, any>) {
  const normalized: Record<string, any> = {
    category: Array.isArray(source.category) ? source.category : [],
    brand: Array.isArray(source.brand) ? source.brand : [],
    color: Array.isArray(source.color) ? source.color : [],
    size: Array.isArray(source.size) ? source.size : [],
  };

  if (typeof source.min === "number") normalized.min = source.min;
  if (typeof source.max === "number") normalized.max = source.max;
  if (typeof source.rating === "number") normalized.rating = source.rating;

  return normalized;
}

const COLOR_SWATCHES: Record<string, string> = {
  black: "#111111",
  white: "#ffffff",
  gray: "#9ca3af",
  grey: "#9ca3af",
  silver: "#c0c0c0",
  navy: "#172554",
  blue: "#2563eb",
  red: "#dc2626",
  green: "#16a34a",
  yellow: "#facc15",
  orange: "#f97316",
  purple: "#9333ea",
  pink: "#ec4899",
  brown: "#78350f",
  beige: "#d6c6a5",
  cream: "#fffdd0",
};

function colorSwatch(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[\s_-]+/g, "");
  return COLOR_SWATCHES[normalized] ?? value;
}

export function FilterSidebar({
  onChange,
  initialFilters = {},
}: {
  onChange: (filters: Record<string, any>) => void;
  initialFilters?: Record<string, any>;
}) {
  const [filters, setFilters] = useState<Record<string, any>>(() =>
    normalizeFacetFilters(initialFilters),
  );
  const [data, setData] = useState<any>({
    categories: [],
    brands: [],
    colors: [],
    sizes: [],
    priceRange: { min: 0, max: 10000 },
  });
  const [price, setPrice] = useState<[number, number]>([0, 10000]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    brand: true,
    color: true,
    size: true,
    rating: true,
  });
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    const next = normalizeFacetFilters(initialFilters);
    setFilters(next);
    setPrice((current) => [
      typeof next.min === 'number' ? next.min : current[0],
      typeof next.max === 'number' ? next.max : current[1],
    ]);
  }, [initialFilters]);

  /* 🧠 Fetch filters dynamically */
  const fetchFilters = useCallback(async (cats?: string[]) => {
    try {
      const params = new URLSearchParams();
      if (cats && cats.length)
        cats.forEach((c) => params.append("category", c));

      const res = await fetch(`/api/filters${params.toString() ? `?${params.toString()}` : ""}`, {
        cache: "no-store",
      });
      const json = await res.json();
      setData(json);
      if (json.priceRange) {
        const lower = Number(json.priceRange.min ?? 0);
        const upper = Number(json.priceRange.max ?? lower);
        const active = filtersRef.current;
        setPrice([
          typeof active.min === "number" ? Math.max(lower, Math.min(active.min, upper)) : lower,
          typeof active.max === "number" ? Math.max(lower, Math.min(active.max, upper)) : upper,
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch filters:", err);
    }
  }, []);

  useEffect(() => {
    fetchFilters(filters.category);
  }, [fetchFilters, filters.category]);

  /* 🧩 Update filters and notify parent */
const updateFilters = (update: Record<string, any>) => {
  const newFilters = { ...filters, ...update };

  // 🧹 Clean up empty or undefined filters AFTER merging
  for (const key of Object.keys(newFilters)) {
    const val = newFilters[key];
    if (val === undefined || (Array.isArray(val) && val.length === 0)) {
      delete newFilters[key];
    }
  }

  setFilters(newFilters);
  onChange(newFilters);
};


  const clearAll = () => {
    setFilters({ category: [], brand: [], color: [], size: [] });
    setPrice([Number(data.priceRange.min ?? 0), Number(data.priceRange.max ?? 0)]);
    onChange({});
    fetchFilters();
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };


const debouncedApplyPrice = useDebouncedCallback((val: [number, number]) => {
  const lower = Number(data.priceRange.min ?? 0);
  const upper = Number(data.priceRange.max ?? lower);
  updateFilters({
    min: val[0] <= lower ? undefined : val[0],
    max: val[1] >= upper ? undefined : val[1],
  });
}, 350);

  const activeFilterCount = Object.values(filters).reduce(
    (count: number, value) => count + (Array.isArray(value) ? value.length : value === undefined ? 0 : 1),
    0,
  );

  /* ---------------------- Render ---------------------- */
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full bg-white rounded-lg border border-stone-200 p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-stone-900">Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}</h2>
        {activeFilterCount > 0 && (
          <button type="button" onClick={clearAll} className="text-sm font-medium text-blue-700 hover:text-blue-900">
            Clear all
          </button>
        )}
      </div>

{/* Price Section */}
<div className="border-b border-gray-100 pb-6">
  <motion.button
    whileHover={{ backgroundColor: "#f8fafc" }}
    className="flex items-center justify-between w-full text-left p-3 rounded-xl"
    onClick={() => toggleSection("price")}
  >
    <h3 className="font-semibold text-gray-800">Price Range</h3>
    <ChevronDown
      className={`w-4 h-4 text-gray-400 transition-transform ${
        openSections.price ? "rotate-180" : ""
      }`}
    />
  </motion.button>

  <AnimatePresence>
    {openSections.price && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-4 space-y-5"
      >
        {/* --- Slider --- */}
        <RangeSlider
          min={Number(data.priceRange.min ?? 0)}
          max={Math.max(Number(data.priceRange.min ?? 0) + 1, Number(data.priceRange.max ?? 0))}
          step={Math.max(1, Math.round((Number(data.priceRange.max ?? 0) - Number(data.priceRange.min ?? 0)) / 100))}
          value={price}
          onChange={(val) => {
            setPrice(val);
            debouncedApplyPrice(val);
          }}
          onCommit={(val) => {
            debouncedApplyPrice.cancel();
            setPrice(val);
            const lower = Number(data.priceRange.min ?? 0);
            const upper = Number(data.priceRange.max ?? lower);
            updateFilters({ min: val[0] <= lower ? undefined : val[0], max: val[1] >= upper ? undefined : val[1] });
          }}
        />

        {/* --- Inputs --- */}
        <PriceInputs
          minLimit={Number(data.priceRange.min ?? 0)}
          maxLimit={Number(data.priceRange.max ?? 0)}
          price={price}
          setPrice={setPrice}
          updateFilters={updateFilters}
        />

        {/* --- Display --- */}
        <div className="flex justify-between items-center text-sm text-gray-600 font-medium mt-2">
          <span>MAD {price[0].toLocaleString('en-US')}</span>
          <span>MAD {price[1].toLocaleString('en-US')}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>


      {/* Category */}
     <div className="border-b border-gray-100 pb-6">
        <motion.button
          whileHover={{ backgroundColor: "#f8fafc" }}
          className="flex items-center justify-between w-full text-left p-3 rounded-xl"
          onClick={() => toggleSection("category")}
        >
          <h3 className="font-semibold text-gray-800">Categories &amp; subcategories</h3>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              openSections.category ? "rotate-180" : ""
            }`}
          />
        </motion.button>

        <AnimatePresence>
          {openSections.category && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              <CategoryTree
                nodes={data.categories || []}
                selectedIds={filters.category || []}
                onToggle={(id, node) => {
                  const selected = new Set(filters.category || []);

                  const findNode = (nodes: any[]): any =>
                    nodes
                      .map((n) =>
                        n.id === id ? n : n.children ? findNode(n.children) : null
                      )
                      .find(Boolean);

                  const currentNode = findNode(data.categories);

                  const removeDescendants = (n: any) => {
                    if (!n?.children) return;
                    for (const c of n.children) {
                      selected.delete(c.id);
                      removeDescendants(c);
                    }
                  };

                  const removeAncestors = (targetId: string, nodes: any[]): boolean => {
                    for (const n of nodes) {
                      if (n.id === targetId) return true;
                      if (n.children?.length) {
                        const found = removeAncestors(targetId, n.children);
                        if (found) {
                          selected.delete(n.id);
                          return true;
                        }
                      }
                    }
                    return false;
                  };

                  if (selected.has(id)) {
                    selected.delete(id);
                  } else {
                    selected.add(id);
                    if (currentNode?.children?.length) removeDescendants(currentNode);
                    removeAncestors(id, data.categories);
                  }

                  updateFilters({ category: Array.from(selected) });
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Brands */}
      <div className="border-b border-gray-100 pb-6">
        <motion.button
          whileHover={{ backgroundColor: "#f8fafc" }}
          className="flex items-center justify-between w-full text-left p-3 rounded-xl"
          onClick={() => toggleSection("brand")}
        >
          <h3 className="font-semibold text-gray-800">Brands</h3>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              openSections.brand ? "rotate-180" : ""
            }`}
          />
        </motion.button>
        <AnimatePresence>
          {openSections.brand && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3 max-h-60 overflow-y-auto"
            >
              {data.brands.map((b: string) => {
                const selected = new Set(filters.brand || []);
                const isChecked = selected.has(b);
                return (
                  <motion.label
                    key={b}
                    whileHover={{ x: 4 }}
                    className="flex items-center space-x-3 group cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) selected.add(b);
                        else selected.delete(b);
                        updateFilters({ brand: Array.from(selected) });
                      }}
                      className="sr-only"
                    />
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                        isChecked
                          ? "bg-black border-black text-white"
                          : "border-gray-300 group-hover:border-gray-400"
                      }`}
                    >
                      {isChecked && <CheckCircle className="w-3 h-3" />}
                    </motion.div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      {b}
                    </span>
                  </motion.label>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Colors */}
      <div className="border-b border-gray-100 pb-6">
        <motion.button
          whileHover={{ backgroundColor: "#f8fafc" }}
          className="flex items-center justify-between w-full text-left p-3 rounded-xl"
          onClick={() => toggleSection("color")}
        >
          <h3 className="font-semibold text-gray-800">Colors</h3>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              openSections.color ? "rotate-180" : ""
            }`}
          />
        </motion.button>
        <AnimatePresence>
          {openSections.color && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-2 gap-2"
            >
              {data.colors.map((col: string) => {
                const selected = new Set(filters.color || []);
                const isActive = selected.has(col);
                return (
                  <motion.button
                    key={col}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      isActive ? selected.delete(col) : selected.add(col);
                      updateFilters({ color: Array.from(selected) });
                    }}
                    type="button"
                    aria-pressed={isActive}
                    className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs font-medium transition-all ${
                      isActive
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                    title={col}
                  >
                    <span className="h-5 w-5 shrink-0 rounded-full border border-black/15" style={{ backgroundColor: colorSwatch(col) }} />
                    <span className="truncate">{col}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sizes */}
      <div className="border-b border-gray-100 pb-6">
        <motion.button
          whileHover={{ backgroundColor: "#f8fafc" }}
          className="flex items-center justify-between w-full text-left p-3 rounded-xl"
          onClick={() => toggleSection("size")}
        >
          <h3 className="font-semibold text-gray-800">Sizes</h3>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              openSections.size ? "rotate-180" : ""
            }`}
          />
        </motion.button>
        <AnimatePresence>
          {openSections.size && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex flex-wrap gap-2"
            >
              {data.sizes.map((s: string) => {
                const selected = new Set(filters.size || []);
                const isActive = selected.has(s);
                return (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      isActive ? selected.delete(s) : selected.add(s);
                      updateFilters({ size: Array.from(selected) });
                    }}
                    className={`px-4 py-2 border rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "border-black text-white bg-black shadow-sm"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:text-gray-900"
                    }`}
                  >
                    {s}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rating */}
      <div className="pb-2">
        <motion.button
          whileHover={{ backgroundColor: "#f8fafc" }}
          className="flex items-center justify-between w-full text-left p-3 rounded-xl"
          onClick={() => toggleSection("rating")}
        >
          <h3 className="font-semibold text-gray-800">Customer rating</h3>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              openSections.rating ? "rotate-180" : ""
            }`}
          />
        </motion.button>
        <AnimatePresence>
          {openSections.rating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              {[4, 3, 2, 1].map((r) => (
                <motion.button
                  type="button"
                  key={r}
                  whileHover={{ x: 4 }}
                  onClick={() => updateFilters({ rating: filters.rating === r ? undefined : r })}
                  className="flex w-full items-center space-x-3 group cursor-pointer text-left"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all ${
                      filters.rating === r
                        ? "bg-black border-black text-white"
                        : "border-gray-300 group-hover:border-gray-400"
                    }`}
                  >
                    {filters.rating === r && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </motion.div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < r
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-xs">& Up</span>
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}



function PriceInputs({
  minLimit,
  maxLimit,
  price,
  setPrice,
  updateFilters,
}: {
  minLimit: number;
  maxLimit: number;
  price: [number, number];
  setPrice: React.Dispatch<React.SetStateAction<[number, number]>>;
  updateFilters: (update: Record<string, any>) => void;
}) {
  const [localMin, setLocalMin] = useState(String(price[0]));
  const [localMax, setLocalMax] = useState(String(price[1]));

  // keep local text synced with slider value when it changes externally
  useEffect(() => {
    setLocalMin(String(price[0]));
    setLocalMax(String(price[1]));
  }, [price]);

  // apply after debounce or blur
  const debouncedApply = useDebouncedCallback((min: number, max: number) => {
    setPrice([min, max]);
    updateFilters({
      min: min <= minLimit ? undefined : min,
      max: max >= maxLimit ? undefined : max,
    });
  }, 500);

  const applyIfValid = (minText: string, maxText: string) => {
    const minVal = Number(minText);
    const maxVal = Number(maxText);
    if (!isNaN(minVal) && !isNaN(maxVal) && minVal <= maxVal) {
      const clampedMin = Math.max(minLimit, Math.min(minVal, maxLimit));
      const clampedMax = Math.min(maxLimit, Math.max(maxVal, minLimit));
      setPrice([clampedMin, clampedMax]);
      debouncedApply(clampedMin, clampedMax);
    }
  };

  const handleMinChange = (val: string) => {
    setLocalMin(val);
    if (val !== "") applyIfValid(val, localMax);
  };

  const handleMaxChange = (val: string) => {
    setLocalMax(val);
    if (val !== "") applyIfValid(localMin, val);
  };

  const handleBlur = () => {
    applyIfValid(localMin, localMax);
    debouncedApply.flush();
  };

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Min Input */}
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">Min</label>
        <input
          type="number"
          value={localMin}
          onChange={(e) => handleMinChange(e.target.value)}
          onBlur={handleBlur}
          className="text-gray-700 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          placeholder={String(minLimit)}
        />
      </div>

      <span className="text-gray-400 mt-5">→</span>

      {/* Max Input */}
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">Max</label>
        <input
          type="number"
          value={localMax}
          onChange={(e) => handleMaxChange(e.target.value)}
          onBlur={handleBlur}
          className="text-gray-700 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          placeholder={String(maxLimit)}
        />
      </div>
    </div>
  );
}
