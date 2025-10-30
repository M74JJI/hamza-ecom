'use client';

import { motion } from "framer-motion";
import { Package, Plus, Edit, Eye, TrendingUp } from "lucide-react";
import Link from "next/link";

type Product = {
  id: string;
  slug: string;
  status: string;
  isFeaturedInHero: boolean;
  categories: Array<{
    categoryId: string;
    category: {
      name: string;
    };
  }>;
};

interface ProductsClientProps {
  products: Product[];
}

export function ProductsClient({ products }: ProductsClientProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'DRAFT':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your product catalog and inventory
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            New Product
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {products.filter(p => p.status === 'PUBLISHED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {products.filter(p => p.status === 'DRAFT').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {products.filter(p => p.isFeaturedInHero).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Featured</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Products Table */}
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
              Product Catalog ({products.length})
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Sorted by Newest
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Product</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Categories</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 dark:divide-gray-700/30">
              {products.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                      {product.status === 'PUBLISHED' && (
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse" />
                      )}
                      {product.status}
                    </span>
                    {product.isFeaturedInHero && (
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                        Featured
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {product.categories.slice(0, 2).map((pc, idx) => (
                        <span
                          key={pc.categoryId}
                          className="px-2 py-1 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-xs border border-white/20 dark:border-gray-700/30"
                        >
                          {pc.category.name}
                        </span>
                      ))}
                      {product.categories.length > 2 && (
                        <span className="px-2 py-1 bg-white/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 rounded-lg text-xs">
                          +{product.categories.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                    </motion.div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {products.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No products yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Get started by creating your first product
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/dashboard/products/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  Create Product
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

