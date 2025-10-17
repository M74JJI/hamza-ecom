"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  ShoppingBag,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
} from "lucide-react";

type Customer = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
};

type SortOption =
  | "newest"
  | "oldest"
  | "alpha-asc"
  | "alpha-desc"
  | "orders-desc"
  | "spent-desc";

export function CustomersClient({ customers }: { customers: Customer[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // --- FILTER + SORT ---
  const filtered = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    let list = customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(lower) ||
        c.email.toLowerCase().includes(lower)
    );

    switch (sortOption) {
      case "newest":
        return list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
      case "oldest":
        return list.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );
      case "alpha-asc":
        return list.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
      case "alpha-desc":
        return list.sort((a, b) =>
          (b.name || "").localeCompare(a.name || "")
        );
      case "orders-desc":
        return list.sort((a, b) => b.totalOrders - a.totalOrders);
      case "spent-desc":
        return list.sort((a, b) => b.totalSpent - a.totalSpent);
      default:
        return list;
    }
  }, [customers, searchQuery, sortOption]);

  // --- PAGINATION ---
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
            Customers
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage all registered customers and their order activity
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-72 px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all duration-300"
          />

          {/* Sort */}
          <motion.select
            whileFocus={{ scale: 1.02 }}
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value as SortOption);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/30 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all duration-300"
          >
            <option value="newest">🕒 Newest First</option>
            <option value="oldest">⏳ Oldest First</option>
            <option value="alpha-asc">🔤 Name (A → Z)</option>
            <option value="alpha-desc">🔡 Name (Z → A)</option>
            <option value="orders-desc">📦 Most Orders</option>
            <option value="spent-desc">💰 Highest Spent</option>
          </motion.select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/20 dark:border-gray-700/30 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Customers ({filtered.length})
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-transparent border border-gray-300/20 dark:border-gray-700/30 rounded-xl px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-sky-500/10 to-indigo-500/10">
                <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">Name</th>
                <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">Email</th>
                <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">Orders</th>
                <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">Total Spent</th>
                <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 dark:divide-gray-700/30">
              <AnimatePresence mode="popLayout">
                {paginated.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                  >
                    <td className="p-4 flex items-center gap-2 text-gray-900 dark:text-white">
                      <User className="w-4 h-4 text-sky-500" />
                      {c.name || "Unknown"}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {c.email}
                    </td>
                    <td className="p-4 flex items-center gap-2 text-gray-900 dark:text-white">
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      {c.totalOrders}
                    </td>
                    <td className="p-4 flex items-center gap-2 text-gray-900 dark:text-white">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      {c.totalSpent.toFixed(2)} MAD
                    </td>
                    <td className="p-4 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {paginated.length === 0 && (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
              No customers found.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 dark:border-gray-700/30 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-300/20 dark:border-gray-700/30 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(page - 2, 0), Math.min(page + 1, totalPages))
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-3 py-1 rounded-lg transition font-semibold ${
                      p === page
                        ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white"
                        : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-300/20 dark:border-gray-700/30 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
