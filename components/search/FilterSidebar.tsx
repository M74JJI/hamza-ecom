'use client';
import { useEffect, useState } from "react";
import { RangeSlider,  } from "@/components/ui/slider";
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
export function FilterSidebar({
  onChange,
}: {
  onChange: (filters: Record<string, any>) => void;
}) {
  const [filters, setFilters] = useState<Record<string, any>>({
    category: [],
    brand: [],
    color: [],
    size: [],
  });
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
  const [isSliding, setIsSliding] = useState(false);

  /* 🧠 Fetch filters dynamically */
  const fetchFilters = async (cats?: string[]) => {
    try {
      const params = new URLSearchParams();
      if (cats && cats.length)
        cats.forEach((c) => params.append("category", c));

      const res = await fetch(`/api/filters${params.toString() ? `?${params.toString()}` : ""}`, {
        cache: "no-store",
      });
      const json = await res.json();
      setData(json);
      if (json.priceRange)
        setPrice([
          json.priceRange.min || 0,
          json.priceRange.max || 10000,
        ]);
    } catch (err) {
      console.error("Failed to fetch filters:", err);
    }
  };

  useEffect(() => {
    fetchFilters(filters.category);
  }, [filters.category]);

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
    setPrice([0, 10000]);
    onChange({});
    fetchFilters();
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };


const debouncedApplyPrice = useDebouncedCallback((val: [number, number]) => {
  updateFilters({ min: val[0], max: val[1] });
  setIsSliding(false);
}, 500);

  /* ---------------------- Render ---------------------- */
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Refine Results</h2>
     
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
          min={data.priceRange.min || 0}
          max={data.priceRange.max || 10000}
          step={100}
          value={price}
          onChange={(val) => setPrice(val)} // live UI
          onCommit={(val) => {
            setPrice(val);
            updateFilters({ min: val[0], max: val[1] }); // apply after drag
          }}
        />

        {/* --- Inputs --- */}
        <PriceInputs
          minLimit={data.priceRange.min || 0}
          maxLimit={data.priceRange.max || 10000}
          price={price}
          setPrice={setPrice}
          updateFilters={updateFilters}
        />

        {/* --- Display --- */}
        <div className="flex justify-between items-center text-sm text-gray-600 font-medium mt-2">
          <span>MAD {price[0].toLocaleString()}</span>
          <span>MAD {price[1].toLocaleString()}</span>
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
          <h3 className="font-semibold text-gray-800">Collections</h3>
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
          <h3 className="font-semibold text-gray-800">Designer Brands</h3>
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
          <h3 className="font-semibold text-gray-800">Color Palette</h3>
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
              className="mt-4 grid grid-cols-6 gap-3"
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
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      isActive
                        ? "ring-2 ring-blue-500 ring-offset-2 border-white shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: col.toLowerCase() }}
                    title={col}
                  />
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
          <h3 className="font-semibold text-gray-800">Size Guide</h3>
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
          <h3 className="font-semibold text-gray-800">Excellence Rating</h3>
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
              {[4, 3, 2].map((r) => (
                <motion.label
                  key={r}
                  whileHover={{ x: 4 }}
                  className="flex items-center space-x-3 group cursor-pointer"
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === r}
                    onChange={(e) =>
                      updateFilters({ rating: e.target.checked ? r : undefined })
                    }
                    className="sr-only"
                  />
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
                </motion.label>
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
    updateFilters({ min, max });
  }, 800);

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
    setLocalMin(val); // user typing freely
  };

  const handleMaxChange = (val: string) => {
    setLocalMax(val);
  };

  const handleBlur = () => applyIfValid(localMin, localMax);

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
