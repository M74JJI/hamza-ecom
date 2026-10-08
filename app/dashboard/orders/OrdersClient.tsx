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

function readAttributes(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function OrdersClient({
  orders,
  currentPage,
  totalPages,
  totalOrders,
  sort,
  search,
  pageSize,
  status,
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string>();
  const [msgError, setMsgError] = useState(false);
  const [viewOrder, setViewOrder] = useState<any | null>(null);
  const [customNote, setCustomNote] = useState<string>("");

  const updateQuery = (params: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, val]) =>
      val ? newParams.set(key, val) : newParams.delete(key)
    );
    router.push(`/dashboard/orders?${newParams.toString()}`);
  };

  const allowedStatuses = (current: string) => {
    const transitions: Record<string, string[]> = {
      PENDING: ["PENDING", "CONFIRMED", "CANCELLED"],
      CONFIRMED: ["CONFIRMED", "SHIPPED", "CANCELLED"],
      SHIPPED: ["SHIPPED", "DELIVERED"],
      DELIVERED: ["DELIVERED"],
      CANCELLED: ["CANCELLED"],
    };
    return transitions[current] ?? [current];
  };

  const handleUpdateStatus = (id: string, status: string) => {
    startTransition(async () => {
      const result = await updateOrderStatusAction(id, status);
      if (result?.error) {
        setMsgError(true);
        setMsg(result.error);
      } else {
        setMsgError(false);
        setMsg("Order status updated!");
        router.refresh();
      }
      setTimeout(() => setMsg(undefined), 2500);
    });
  };

  const handleUpdateNote = (id: string, note: string) => {
    startTransition(async () => {
      const result = await updateOrderNoteAction(id, note);
      if (result?.error) {
        setMsgError(true);
        setMsg(result.error);
      } else {
        setMsgError(false);
        setMsg("Note saved!");
        router.refresh();
      }
      setTimeout(() => setMsg(undefined), 2500);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
 <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 lg:flex-row lg:items-end">
  <div>
    <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
      Orders
    </h1>
    <p className="mt-1 text-sm text-neutral-500">
      Review and manage {totalOrders} orders
    </p>
  </div>

  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <input
      placeholder="Search order or customer"
      defaultValue={search}
      onChange={(e) => updateQuery({ search: e.target.value, page: "1" })}
      className="h-10 min-w-64 px-3 text-sm"
    />

    <select
      value={sort}
      onChange={(e) => updateQuery({ sort: e.target.value, page: "1" })}
      className="h-10 px-3 text-sm"
    >
      <option value="latest">Latest</option>
      <option value="oldest">Oldest</option>
      <option value="total-desc">Total High → Low</option>
      <option value="total-asc">Total Low → High</option>
    </select>
    <select
      value={status}
      onChange={(e) => updateQuery({ status: e.target.value, page: "1" })}
      className="h-10 px-3 text-sm"
      aria-label="Filter orders by status"
    >
      <option value="all">All statuses</option>
      {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((value) => (
        <option key={value} value={value}>{value.charAt(0) + value.slice(1).toLowerCase()}</option>
      ))}
    </select>
    <select
      value={pageSize}
      onChange={(e) => updateQuery({ pageSize: e.target.value, page: "1" })}
      className="h-10 px-3 text-sm"
      aria-label="Orders per page"
    >
      <option value="10">10 per page</option>
      <option value="20">20 per page</option>
      <option value="50">50 per page</option>
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
            className={`rounded-md border px-4 py-3 text-sm ${msgError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full">
          <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="p-4 text-left">Order ID</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Note</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
      <tbody>
  {orders.map((o: any) => (
    <tr key={o.id} className="border-t border-neutral-200 text-sm hover:bg-neutral-50/70">
      <td className="p-4 font-mono">#{o.id.slice(0, 8)}</td>
      <td className="p-4">
        {o.shippingFullNameSnapshot || o.user?.name || "—"} <br />
        <span className="text-xs text-neutral-500">{o.user?.email}</span>
      </td>
      <td className="p-4">
        {o.shippingPhoneSnapshot ? (
          <a href={`tel:${o.shippingPhoneSnapshot}`} className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900">
            {o.shippingPhoneSnapshot}
          </a>
        ) : <span className="text-neutral-400">—</span>}
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
          {allowedStatuses(o.status).map((status) => (
            <option key={status} value={status}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </option>
          ))}
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
            className="px-2 py-1 text-sm"
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
              className="mt-1 px-2 py-1 text-sm"
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
              <p className="mt-1 text-xs italic text-neutral-500">
                {o.note}
              </p>
            )}
        </div>
      </td>

      {/* ✅ ACTIONS */}
      <td className="p-4">
        <button
          onClick={() => setViewOrder(o)}
          className="flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-100"
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
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => updateQuery({ page: String(currentPage - 1) })}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 disabled:opacity-40"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter((value) => value === 1 || value === totalPages || Math.abs(value - currentPage) <= 1)
            .map((value, index, values) => (
              <span key={value} className="flex items-center gap-1">
                {index > 0 && value - values[index - 1] > 1 && <span className="px-1 text-neutral-400">…</span>}
                <button
                  onClick={() => updateQuery({ page: String(value) })}
                  aria-current={value === currentPage ? 'page' : undefined}
                  className={`min-w-9 rounded-md border px-2 py-1.5 ${value === currentPage ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 bg-white'}`}
                >{value}</button>
              </span>
            ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => updateQuery({ page: String(currentPage + 1) })}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 disabled:opacity-40"
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
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4"
            onClick={() => setViewOrder(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-neutral-200 bg-white p-6 shadow-xl"
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

              <div className="space-y-3 text-sm text-neutral-700">
                <p>
                  <b>Customer:</b> {viewOrder.user?.name} (
                  {viewOrder.user?.email})
                </p>
                <p><b>Phone:</b>{" "}{viewOrder.shippingPhoneSnapshot ? <a className="underline" href={`tel:${viewOrder.shippingPhoneSnapshot}`}>{viewOrder.shippingPhoneSnapshot}</a> : "—"}</p>
                <p><b>Delivery name:</b> {viewOrder.shippingFullNameSnapshot || "—"}</p>
                <p><b>Delivery address:</b> {[viewOrder.shippingAddressSnapshot, viewOrder.shippingCitySnapshot].filter(Boolean).join(', ') || "—"}</p>
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
                  {viewOrder.shippingCompanyNameSnapshot ||
                    viewOrder.shippingCompany?.name ||
                    "—"}
                </p>
                <hr className="my-3" />

                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-500" /> Products
                </h3>
                <div className="divide-y divide-gray-700/20 mt-2">
                  {viewOrder.items.map((item: any) => {
                    const variant = item.variantSize.variant;
                    const product = variant.product;
                    const attributes = readAttributes(item.attributesSnapshot);
                    const brand =
                      item.productBrandSnapshot ||
                      product?.brand ||
                      "Product";
                    const title = item.titleSnapshot || variant.title;
                    const size =
                      typeof attributes.size === "string"
                        ? attributes.size
                        : item.variantSize.size;
                    const image =
                      item.imageSnapshot ||
                      variant.images?.[0]?.url ||
                      variant.variantStyleImg ||
                      "/placeholder.svg";

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 py-3"
                      >
                        <img
                          src={image}
                          alt={title}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-300/20"
                        />
                        <div className="flex-1">
                          <p className="font-medium">
                            {brand} — {title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Size: {size}
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
