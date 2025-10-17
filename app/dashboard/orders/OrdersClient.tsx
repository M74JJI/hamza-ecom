"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  updateOrderStatusAction,
  updateOrderNoteAction,
} from "./actions";
import {
  User,
  DollarSign,
  Truck,
  Calendar,
  Eye,
  StickyNote,
  X,
  Package,
} from "lucide-react";

export function OrdersClient({
  orders,
  currentPage,
  totalPages,
  totalOrders,
  sort,
  search,
  pageSize,
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string>();
  const [viewOrder, setViewOrder] = useState<any | null>(null);
  const [customNote, setCustomNote] = useState<string>("");

  const updateQuery = (params: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, val]) =>
      val ? newParams.set(key, val) : newParams.delete(key)
    );
    router.push(`/dashboard/orders?${newParams.toString()}`);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    startTransition(async () => {
      await updateOrderStatusAction(id, status);
      setMsg("Order status updated!");
      setTimeout(() => setMsg(undefined), 2000);
      router.refresh();
    });
  };

  const handleUpdateNote = (id: string, note: string) => {
    startTransition(async () => {
      await updateOrderNoteAction(id, note);
      setMsg("Note saved!");
      setTimeout(() => setMsg(undefined), 2000);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
 <div className="flex flex-col lg:flex-row justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      Orders
    </h1>
    <p className="text-gray-500 dark:text-gray-400 mt-1">
      Total: {totalOrders} orders
    </p>
  </div>

  <div className="flex flex-col sm:flex-row gap-3">
    <input
      placeholder="Search..."
      defaultValue={search}
      onChange={(e) => updateQuery({ search: e.target.value, page: "1" })}
      className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
    />

    <select
      value={sort}
      onChange={(e) => updateQuery({ sort: e.target.value, page: "1" })}
      className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
    >
      <option value="latest">Latest</option>
      <option value="oldest">Oldest</option>
      <option value="total-desc">Total High → Low</option>
      <option value="total-asc">Total Low → High</option>
    </select>
  </div>
</div>

      {/* Message */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-3 bg-green-500/80 text-white rounded-xl"
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-700/30 shadow-xl">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <tr>
              <th className="p-4 text-left">Order ID</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Note</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
      <tbody>
  {orders.map((o: any) => (
    <tr key={o.id} className="border-t border-gray-700/20">
      <td className="p-4 font-mono">#{o.id.slice(0, 8)}</td>
      <td className="p-4">
        {o.user?.name || "—"} <br />
        <span className="text-xs text-gray-400">{o.user?.email}</span>
      </td>
      <td className="p-4">{Number(o.totalMAD).toFixed(2)} MAD</td>

      {/* ✅ STATUS COLUMN */}
      <td className="p-4">
        <select
          value={o.status}
          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
          className={`rounded-lg px-3 py-1 text-sm font-medium ${
            o.status === "DELIVERED"
              ? "bg-green-500/20 text-green-700 dark:text-green-400"
              : o.status === "SHIPPED"
              ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
              : o.status === "CONFIRMED"
              ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
              : o.status === "CANCELLED"
              ? "bg-red-500/20 text-red-700 dark:text-red-400"
              : "bg-gray-300/30 text-gray-700 dark:text-gray-300"
          } focus:ring-2 focus:ring-blue-500/50 outline-none border border-transparent transition`}
        >
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </td>

      {/* ✅ NOTE COLUMN */}
      <td className="p-4 align-top">
        <div className="flex flex-col gap-1">
          <select
            value={
              [
                "Waiting for confirmation",
                "Customer confirmed",
                "Delivery scheduled",
                "User unreachable",
                "Returned / Refused",
              ].includes(o.note || "")
                ? o.note
                : o.note
                ? "custom"
                : ""
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === "custom") {
                setCustomNote(o.id);
              } else {
                handleUpdateNote(o.id, val);
                setCustomNote("");
              }
            }}
            className="rounded-lg bg-gray-100 dark:bg-gray-800 px-2 py-1 text-sm focus:ring-2 focus:ring-pink-500/50"
          >
            <option value="">—</option>
            <option value="Waiting for confirmation">
              Waiting for confirmation
            </option>
            <option value="Customer confirmed">Customer confirmed</option>
            <option value="Delivery scheduled">Delivery scheduled</option>
            <option value="User unreachable">User unreachable</option>
            <option value="Returned / Refused">Returned / Refused</option>
            <option value="custom">Custom...</option>
          </select>

          {/* Show input for new custom entry */}
          {customNote === o.id && (
            <input
              autoFocus
              placeholder="Type a custom note..."
              defaultValue={o.note || ""}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val) handleUpdateNote(o.id, val);
                setCustomNote("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) handleUpdateNote(o.id, val);
                  setCustomNote("");
                }
              }}
              className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-600 text-sm mt-1 focus:ring-2 focus:ring-pink-500/50 outline-none"
            />
          )}

          {/* Show saved custom note text if any */}
          {o.note &&
            ![
              "Waiting for confirmation",
              "Customer confirmed",
              "Delivery scheduled",
              "User unreachable",
              "Returned / Refused",
            ].includes(o.note) &&
            customNote !== o.id && (
              <p className="text-xs text-gray-600 dark:text-gray-400 italic mt-1">
                {o.note}
              </p>
            )}
        </div>
      </td>

      {/* ✅ ACTIONS */}
      <td className="p-4">
        <button
          onClick={() => setViewOrder(o)}
          className="px-3 py-1.5 bg-purple-600/90 text-white rounded-xl hover:bg-purple-700 transition flex items-center gap-1"
        >
          <Eye className="w-4 h-4" /> View
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm mt-4">
        <span className="text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => updateQuery({ page: String(currentPage - 1) })}
            className="px-3 py-1 rounded-lg border border-gray-600 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => updateQuery({ page: String(currentPage + 1) })}
            className="px-3 py-1 rounded-lg border border-gray-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {viewOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[999]"
            onClick={() => setViewOrder(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full p-6 overflow-y-auto max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Order #{viewOrder.id.slice(0, 8)}
                </h2>
                <button
                  onClick={() => setViewOrder(null)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <b>Customer:</b> {viewOrder.user?.name} (
                  {viewOrder.user?.email})
                </p>
                <p>
                  <b>Total:</b> {Number(viewOrder.totalMAD).toFixed(2)} MAD
                </p>
                <p>
                  <b>Status:</b> {viewOrder.status}
                </p>
                <p>
                  <b>Note:</b> {viewOrder.note || "—"}
                </p>
                <p>
                  <b>Shipping Company:</b>{" "}
                  {viewOrder.shippingCompany?.name || "—"}
                </p>
                <hr className="my-3" />

                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-500" /> Products
                </h3>
                <div className="divide-y divide-gray-700/20 mt-2">
                  {viewOrder.items.map((item: any) => {
                    const variant = item.variantSize.variant;
                    const product = variant.product;
                    const image =
                      variant.images?.[0]?.url ||
                      product.imageUrl ||
                      "/placeholder.png";

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 py-3"
                      >
                        <img
                          src={image}
                          alt={variant.title}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-300/20"
                        />
                        <div className="flex-1">
                          <p className="font-medium">
                            {product.brand} — {variant.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Size: {item.variantSize.size}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right font-semibold">
                          {Number(item.unitPriceMAD).toFixed(2)} MAD
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
