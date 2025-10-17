"use client";

import { useEffect, useState, useTransition } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { slugify } from "@/lib/slugify";
import { upsertCategoryAction } from "./server-actions";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image, X, Sparkles } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  isActiveInHeader?: boolean | null;
};

export function CategoryForm({
  categories,
  editing,
  onSaved,
  onCancel,
}: {
  categories: Category[];
  editing?: Category | null;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [id, setId] = useState<string | undefined>(undefined);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isActiveInHeader, setIsActiveInHeader] = useState<boolean>(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | undefined>();

  // Populate form when editing changes; reset when cleared
  useEffect(() => {
    if (editing) {
      setId(editing.id);
      setName(editing.name ?? "");
      setSlug(editing.slug ?? "");
      setParentId(editing.parentId ?? undefined);
      setImageUrl(editing.imageUrl ?? "");
      setIsActiveInHeader(!!editing.isActiveInHeader);
      setMsg(undefined);
    } else {
      setId(undefined);
      setName("");
      setSlug("");
      setParentId(undefined);
      setImageUrl("");
      setIsActiveInHeader(false);
      setMsg(undefined);
    }
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const payload = {
        id,
        name,
        slug: slug || slugify(name),
        parentId: parentId || undefined,
        imageUrl: imageUrl || undefined,
        isActiveInHeader,
      };
      const res = await upsertCategoryAction(payload);
      if (res?.error) {
        setMsg(res.error);
        return;
      }
      setMsg("Category saved successfully!");
      onSaved?.();
    });
  };

  return (
    <AnimatePresence mode="wait">
      {(editing || id) && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden"
        >
          {/* Form Header */}
          <div className="p-6 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {id ? `Edit "${name || 'Category'}"` : "Create New Category"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {id ? "Update category details" : "Add a new product category"}
                  </p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">
                  Category Name *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter category name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Slug Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">
                  Slug
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="Slug (auto-generated)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Leave empty for auto-generation
                </p>
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">
                  Parent Category
                </label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                  value={parentId || ""}
                  onChange={(e) => setParentId(e.target.value || undefined)}
                >
                  <option value="" className="text-gray-500">No parent category</option>
                  {categories
                    .filter((c) => c.id !== id)
                    .map((c) => (
                      <option key={c.id} value={c.id} className="text-gray-900 dark:text-white">
                        {c.name}
                      </option>
                    ))}
                </motion.select>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-900 dark:text-white">
                Category Image
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/30">
                {/* Image Preview */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-24 h-24 rounded-xl border-2 border-dashed border-white/20 dark:border-gray-700/30 overflow-hidden bg-white/30 dark:bg-gray-700/30 flex items-center justify-center"
                >
                  {imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt="Category preview"
                        className="w-full h-full object-cover"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <X className="w-3 h-3 text-white" />
                      </motion.button>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <Image className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">No image</span>
                    </div>
                  )}
                </motion.div>

                {/* Upload Button */}
                <CldUploadWidget
                  uploadPreset="ufb48euh"
                  onSuccess={(res: any) => {
                    const url =
                      res?.info?.secure_url ||
                      (res?.info?.url || "").replace(/^http:/, "https:");
                    setImageUrl(url);
                  }}
                >
                  {({ open }) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => open?.()}
                      className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                    >
                      <Upload className="w-4 h-4" />
                      {imageUrl ? "Change Image" : "Upload Image"}
                    </motion.button>
                  )}
                </CldUploadWidget>

                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload a representative image for this category
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Recommended: 500×500px, JPG or PNG
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Toggle */}
            <motion.label 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/30 cursor-pointer group"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isActiveInHeader}
                  onChange={(e) => setIsActiveInHeader(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                  isActiveInHeader 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <motion.div
                    layout
                    className={`w-4 h-4 bg-white rounded-full shadow-lg transform transition-all duration-300 ${
                      isActiveInHeader ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">
                  Featured Category
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Show this category in the header navigation
                </div>
              </div>
              {isActiveInHeader && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.label>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/20 dark:border-gray-700/30">
              <AnimatePresence>
                {msg && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium ${
                      msg.includes("error") 
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        : "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                    }`}
                  >
                    {msg}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3 ml-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={pending}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {pending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : id ? (
                    "Update Category"
                  ) : (
                    "Create Category"
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}