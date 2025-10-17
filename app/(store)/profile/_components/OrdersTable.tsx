// app/(store)/profile/_components/OrdersTable.tsx
'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Clock, Truck, CheckCircle, XCircle, ArrowRight, Eye } from 'lucide-react';

type OrderRow = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  itemsCount: number;
};

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSING: { color: 'bg-blue-100 text-blue-800', icon: Package },
  SHIPPED: { color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle },
};

export function OrdersTable({ rows }: { rows: OrderRow[] }){
  if(rows.length === 0){
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</h3>
        <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
        <Link href="/products">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {rows.map((row, index) => {
        const statusInfo = statusConfig[row.status as keyof typeof statusConfig] || statusConfig.PENDING;
        const StatusIcon = statusInfo.icon;
        
        return (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className="bg-white/80 backdrop-blur-2xl rounded-2xl border-2 border-gray-300 p-6 hover:shadow-xl transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Order Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      Order #{row.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(row.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {row.status}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package className="w-4 h-4" />
                    <span className="text-sm font-medium">{row.itemsCount} item{row.itemsCount > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-gray-800">
                      {row.total.toFixed(2)} MAD
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <Link href={`/profile/orders/${row.id}`}>
                <motion.button
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
            
            {/* Progress Indicator for active orders */}
            {(row.status === 'PROCESSING' || row.status === 'SHIPPED') && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>Order Progress</span>
                  <span>
                    {row.status === 'PROCESSING' ? 'Processing' : 'Shipped'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: row.status === 'PROCESSING' ? '50%' : '80%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  />
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}