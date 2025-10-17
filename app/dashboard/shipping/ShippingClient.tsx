"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Trash2, Plus, Search, Truck, Clock, DollarSign, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createDeliveryCompany, updateDeliveryCompany, deleteDeliveryCompanyAction } from "./actions";

type DeliveryCompany = {
  id: string;
  name: string;
  priceMAD: number;
  avgDays: number;
  active: boolean;
  createdAt: Date;
};

export function ShippingClient({ companies }: { companies: DeliveryCompany[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCompany, setEditingCompany] = useState<DeliveryCompany | null>(null);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        if (editingCompany && editingCompany.id) {
          await updateDeliveryCompany(editingCompany.id, formData);
          setMsg("Delivery company updated successfully!");
        } else {
          await createDeliveryCompany(formData);
          setMsg("Delivery company created successfully!");
        }
        
        router.refresh();
        setEditingCompany(null);
        setTimeout(() => setMsg(undefined), 3000);
        
        // Reset form
        const form = document.getElementById('company-form') as HTMLFormElement;
        if (form) form.reset();
      } catch (error) {
        setMsg("Failed to save delivery company");
        setTimeout(() => setMsg(undefined), 3000);
      }
    });
  };

  const handleDeleteCompany = (companyId: string, companyName: string) => {
    if (!confirm(`Delete delivery company "${companyName}"? This cannot be undone.`)) return;

    startTransition(async () => {
      try {
        const result = await deleteDeliveryCompanyAction(companyId);
        if (result?.error) {
          setMsg(result.error);
          setTimeout(() => setMsg(undefined), 3000);
          return;
        }
        router.refresh();
        setMsg("Delivery company deleted successfully!");
        setTimeout(() => setMsg(undefined), 3000);
        if (editingCompany?.id === companyId) {
          setEditingCompany(null);
        }
      } catch (error) {
        setMsg("Failed to delete delivery company");
        setTimeout(() => setMsg(undefined), 3000);
      }
    });
  };

  const handleEdit = (company: DeliveryCompany) => {
    setEditingCompany(company);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('company-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingCompany(null);
    const form = document.getElementById('company-form') as HTMLFormElement;
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Delivery Companies
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage shipping carriers and delivery options
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!editingCompany ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditingCompany({
                id: '',
                name: '',
                priceMAD: 0,
                avgDays: 2,
                active: true,
                createdAt: new Date()
              })}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              New Company
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
          placeholder="Search delivery companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all duration-300"
        />
      </motion.div>

      {/* Company Form */}
      <AnimatePresence mode="wait">
        {editingCompany && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingCompany.id ? `Edit Company: ${editingCompany.name}` : 'Create New Delivery Company'}
              </h3>
              <form 
                id="company-form"
                action={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
              >
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    name="name" 
                    defaultValue={editingCompany.name}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-white/20 dark:border-gray-700/30 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent" 
                    placeholder="Company Name" 
                    required 
                  />
                </div>
                
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    name="priceMAD" 
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingCompany.priceMAD}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-white/20 dark:border-gray-700/30 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent" 
                    placeholder="Price (MAD)" 
                    required 
                  />
                </div>
                
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    name="avgDays" 
                    type="number"
                    min="1"
                    defaultValue={editingCompany.avgDays}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-white/20 dark:border-gray-700/30 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent" 
                    placeholder="ETA Days" 
                    required 
                  />
                </div>
                
                <select 
                  name="active" 
                  defaultValue={editingCompany.active ? 'true' : 'false'}
                  className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-white/20 dark:border-gray-700/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                >
                  {isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {editingCompany.id ? 'Update Company' : 'Add Company'}
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

      {/* Companies Table */}
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
              All Delivery Companies ({filteredCompanies.length})
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
              <tr className="bg-gradient-to-r from-teal-500/10 to-blue-500/10">
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Name</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Price</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Delivery Time</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 dark:divide-gray-700/30">
              <AnimatePresence mode="popLayout">
                {filteredCompanies.map((company, index) => (
                  <motion.tr
                    key={company.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center">
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {company.name}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {Number(company.priceMAD).toFixed(2)} MAD
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {company.avgDays} days
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {company.active ? (
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
                          onClick={() => handleEdit(company)}
                          className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all duration-300"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          disabled={isPending}
                          onClick={() => handleDeleteCompany(company.id, company.name)}
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
          {filteredCompanies.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <Truck className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No delivery companies found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Add your first delivery company to get started"}
              </p>
              {!searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingCompany({
                    id: '',
                    name: '',
                    priceMAD: 0,
                    avgDays: 2,
                    active: true,
                    createdAt: new Date()
                  })}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300"
                >
                  Add Company
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}