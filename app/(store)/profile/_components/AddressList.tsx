// app/(store)/profile/_components/AddressList.tsx
'use client';
import { useTransition, useState } from 'react';
import { deleteAddress } from '../_actions/address.actions';
import { Pencil, Trash2, MapPin, Star, CheckCircle } from 'lucide-react';
import { AddressForm } from './AddressForm';
import { motion, AnimatePresence } from 'framer-motion';

export function AddressList({ items }: { items: any[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Addresses Yet</h3>
        <p className="text-gray-600">Add your first delivery address to get started</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AnimatePresence>
        {items.map((address, index) => (
          <motion.div
            key={address.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            layout
          >
            {editing === address.id ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200"
              >
                <AddressForm address={address} onDone={() => setEditing(null)} />
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className={`relative bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border-2 shadow-lg transition-all ${
                  address.isDefault 
                    ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {/* Default Address Badge */}
                {address.isDefault && (
                  <div className="absolute -top-3 -right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    Default
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        address.isDefault ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{address.fullName}</h3>
                        <p className="text-gray-600 text-sm">{address.phone}</p>
                      </div>
                    </div>
                    
                    {address.isDefault && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  {/* Address Details */}
                  <div className="space-y-2">
                    <div className="text-gray-800 font-medium">{address.fullAddress}</div>
                    <div className="text-gray-600">{address.city}</div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditing(address.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => start(async () => await deleteAddress(address.id))}
                      disabled={pending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      {pending ? 'Deleting...' : 'Delete'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}