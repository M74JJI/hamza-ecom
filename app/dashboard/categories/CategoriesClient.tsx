"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2, Star, Plus, Search, Filter, Folder } from "lucide-react";
import { CategoryForm } from "./category-form";
import { deleteCategoryAction } from "./server-actions";
import { motion, AnimatePresence } from "framer-motion";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  isActiveInHeader?: boolean | null;
  parent?: { name: string | null } | null;
};

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Category | null>(null);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredCategories = useMemo(() => categories.filter(category =>
    (category.name.toLowerCase().includes(searchQuery.toLowerCase()) || category.slug.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (status === "all" || (status === "featured" ? category.isActiveInHeader : !category.isActiveInHeader))
  ).slice().sort((a, b) => sort === "name-desc" ? b.name.localeCompare(a.name) : sort === "slug-asc" ? a.slug.localeCompare(b.slug) : a.name.localeCompare(b.name)), [categories, searchQuery, sort, status]);
  const pages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const safePage = Math.min(page, pages);
  const visibleCategories = filteredCategories.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 lg:flex-row lg:items-end"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Categories
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Organize catalog navigation and storefront collections.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!editing ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing({
                id: '',
                name: '',
                slug: '',
                parentId: null,
                imageUrl: null,
                isActiveInHeader: false
              })}
              className="hz-admin-primary"
            >
              <Plus className="w-5 h-5" />
              New Category
            </motion.button>
          ) : (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(null)}
              className="hz-admin-secondary h-10 px-4 text-sm"
            >
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
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <label className="relative"><Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          className="h-11 w-full pl-12 pr-4 text-sm"
        /></label>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="h-11 px-3 text-sm"><option value="all">All placements</option><option value="featured">Featured</option><option value="standard">Standard</option></select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="h-11 px-3 text-sm"><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="slug-asc">Slug A–Z</option></select>
        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="h-11 px-3 text-sm"><option value="10">10 per page</option><option value="25">25 per page</option><option value="50">50 per page</option></select>
      </motion.div>

      {/* Category Form */}
      <AnimatePresence mode="wait">
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="hz-admin-panel p-5">
              <CategoryForm
                categories={categories}
                editing={editing}
                onSaved={() => {
                  setEditing(null);
                  router.refresh();
                  setMsg("Category saved successfully!");
                  setTimeout(() => setMsg(undefined), 3000);
                }}
                onCancel={() => setEditing(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-sm font-medium shadow-lg"
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="hz-admin-panel overflow-hidden"
      >
        {/* Table Header */}
        <div className="border-b border-neutral-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              All Categories ({filteredCategories.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Filter className="w-4 h-4" />
              Sorted by Name
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Image</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Name</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Slug</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Parent</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 dark:divide-gray-700/30">
              <AnimatePresence mode="popLayout">
                {visibleCategories.map((category, index) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group border-t border-neutral-200 text-sm hover:bg-neutral-50"
                  >
                    <td className="p-4">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 rounded-xl border border-white/20 dark:border-gray-700/30 overflow-hidden bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                      >
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">No image</span>
                          </div>
                        )}
                      </motion.div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                        {category.slug}
                      </code>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        {category.parent?.name ?? (
                          <span className="text-gray-400 dark:text-gray-500 italic">None</span>
                        )}
                      </span>
                    </td>
                    <td className="p-4">
                      {category.isActiveInHeader ? (
                        <motion.span
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold shadow-lg shadow-green-500/25"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          Featured
                        </motion.span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs font-medium border border-white/20 dark:border-gray-700/30">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditing(category)}
                          className="hz-admin-icon"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          disabled={pending}
                          onClick={() =>
                            start(async () => {
                              if (!confirm(`Delete category "${category.name}"? This cannot be undone.`))
                                return;
                              const res = await deleteCategoryAction(category.id);
                              if (res?.error) {
                                alert(res.error);
                                return;
                              }
                              if (editing?.id === category.id) setEditing(null);
                              router.refresh();
                            })
                          }
                          className="hz-admin-icon border-red-200 text-red-700 hover:bg-red-50"
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
          {filteredCategories.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <Folder className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No categories found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first category"}
              </p>
              {!searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditing({
                    id: '',
                    name: '',
                    slug: '',
                    parentId: null,
                    imageUrl: null,
                    isActiveInHeader: false
                  })}
                  className="hz-admin-primary"
                >
                  Create Category
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-3 text-sm"><span className="text-neutral-500">Page {safePage} of {pages}</span><div className="flex items-center gap-1"><button className="hz-admin-icon" disabled={safePage === 1} onClick={() => setPage(safePage - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>{Array.from({ length: pages }, (_, i) => i + 1).map((value) => <button key={value} onClick={() => setPage(value)} className={`min-w-9 rounded-md border px-2 py-1.5 ${value === safePage ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white"}`}>{value}</button>)}<button className="hz-admin-icon" disabled={safePage === pages} onClick={() => setPage(safePage + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div></div>
      </motion.div>
    </div>
  );
}
