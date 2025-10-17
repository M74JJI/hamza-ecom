"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Trash2, Star, Plus, Search, Filter, Folder } from "lucide-react";
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

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Categories
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your product categories and organization
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
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
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
              className="flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
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
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
        />
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
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-6 shadow-lg">
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
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden"
      >
        {/* Table Header */}
        <div className="p-6 border-b border-white/20 dark:border-gray-700/30">
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
              <tr className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
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
                {filteredCategories.map((category, index) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300"
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
                          className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all duration-300"
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
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                >
                  Create Category
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}