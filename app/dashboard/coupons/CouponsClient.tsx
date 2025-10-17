"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Trash2, Plus, Search, Calendar, Percent, Tag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createCoupon, updateCoupon, deleteCouponAction } from "./actions";

type Coupon = {
  id: string;
  code: string;
  percent: number;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean;
  createdAt: Date;
};

export function CouponsClient({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return "No date";
    return new Date(date).toLocaleDateString();
  };

  const isCouponActive = (coupon: Coupon) => {
    if (!coupon.active) return false;
    const now = new Date();
    const startsAt = coupon.startsAt ? new Date(coupon.startsAt) : null;
    const endsAt = coupon.endsAt ? new Date(coupon.endsAt) : null;
    
    if (startsAt && now < startsAt) return false;
    if (endsAt && now > endsAt) return false;
    return true;
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        if (editingCoupon) {
          await updateCoupon(editingCoupon.id, formData);
          setMsg("Coupon updated successfully!");
        } else {
          await createCoupon(formData);
          setMsg("Coupon created successfully!");
        }
        
        router.refresh();
        setEditingCoupon(null);
        setTimeout(() => setMsg(undefined), 3000);
        
        // Reset form
        const form = document.getElementById('coupon-form') as HTMLFormElement;
        if (form) form.reset();
      } catch (error) {
        setMsg("Failed to save coupon");
        setTimeout(() => setMsg(undefined), 3000);
      }
    });
  };

  const handleDeleteCoupon = (couponId: string, couponCode: string) => {
    if (!confirm(`Delete coupon "${couponCode}"? This cannot be undone.`)) return;

    startTransition(async () => {
      try {
        const result = await deleteCouponAction(couponId);
        if (result?.error) {
          setMsg(result.error);
          setTimeout(() => setMsg(undefined), 3000);
          return;
        }
        router.refresh();
        setMsg("Coupon deleted successfully!");
        setTimeout(() => setMsg(undefined), 3000);
        if (editingCoupon?.id === couponId) {
          setEditingCoupon(null);
        }
      } catch (error) {
        setMsg("Failed to delete coupon");
        setTimeout(() => setMsg(undefined), 3000);
      }
    });
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('coupon-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingCoupon(null);
    const form = document.getElementById('coupon-form') as HTMLFormElement;
    if (form) form.reset();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Coupons
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage discount coupons and promotions
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!editingCoupon ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditingCoupon({
                id: '',
                code: '',
                percent: 0,
                startsAt: null,
                endsAt: null,
                active: true,
                createdAt: new Date()
              })}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              New Coupon
            </motion.button>
          ) : (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCancelEdit}
              className="flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
            >
              <X className="w-5 h-5" />
              Cancel
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search coupons by code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300"
        />
      </motion.div>

      {/* Coupon Form */}
      <AnimatePresence mode="wait">
        {editingCoupon && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingCoupon.id ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon'}
              </h3>
              <form 
                id="coupon-form"
                action={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
              >
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    name="code" 
                    defaultValue={editingCoupon.code}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-white/20 dark:border-gray-700/30 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent" 
                    placeholder="CODE" 
                    required 
                  />
                </div>
                
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    name="percent" 
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={editingCoupon.percent}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-white/20 dark:border-gray-700/30 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent" 
                    placeholder="% off" 
                    required 
                  />
                </div>
                
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    name="startsAt" 
                    type="datetime-local" 
                    defaultValue={formatDateForInput(editingCoupon.startsAt)}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-white/20 dark:border-gray-700/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent" 
                  />
                </div>
                
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    name="endsAt" 
                    type="datetime-local" 
                    defaultValue={formatDateForInput(editingCoupon.endsAt)}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-white/20 dark:border-gray-700/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent" 
                  />
                </div>
                
                <select 
                  name="active" 
                  defaultValue={editingCoupon.active ? 'true' : 'false'}
                  className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-white/20 dark:border-gray-700/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                >
                  {isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {editingCoupon.id ? 'Update Coupon' : 'Add Coupon'}
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success/Error Message */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-lg ${
              msg.includes("successfully") 
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                : "bg-gradient-to-r from-red-500 to-orange-600 text-white"
            }`}
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupons Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden"
      >
        {/* Table Header */}
        <div className="p-6 border-b border-white/20 dark:border-gray-700/30">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              All Coupons ({filteredCoupons.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              Sorted by Latest
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Code</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Discount</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Starts At</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Ends At</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 dark:divide-gray-700/30">
              <AnimatePresence mode="popLayout">
                {filteredCoupons.map((coupon, index) => (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                  >
                    <td className="p-4">
                      <code className="text-lg font-bold text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                        {coupon.code}
                      </code>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {coupon.percent}% off
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatDateForDisplay(coupon.startsAt)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatDateForDisplay(coupon.endsAt)}
                      </span>
                    </td>
                    <td className="p-4">
                      {isCouponActive(coupon) ? (
                        <motion.span
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold shadow-lg shadow-green-500/25"
                        >
                          Active
                        </motion.span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs font-medium border border-white/20 dark:border-gray-700/30">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(coupon)}
                          className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all duration-300"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          disabled={isPending}
                          onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                          className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-all duration-300"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {/* Empty State */}
          {filteredCoupons.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <Tag className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No coupons found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Create your first discount coupon to get started"}
              </p>
              {!searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingCoupon({
                    id: '',
                    code: '',
                    percent: 0,
                    startsAt: null,
                    endsAt: null,
                    active: true,
                    createdAt: new Date()
                  })}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
                >
                  Create Coupon
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}