// app/(store)/profile/_components/AddressForm.tsx
'use client';
import { useState, useTransition } from 'react';
import { createAddress, updateAddress } from '../_actions/address.actions';
import { CheckCircle2, Loader2, Plus, MapPin, User, Phone, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { MA_CITIES } from '@/lib/ma-cities';

export function AddressForm({ address, onDone }: { address?: any; onDone?: () => void }) {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    fullName: address?.fullName ?? '',
    phone: address?.phone ?? '',
    city: address?.city ?? MA_CITIES[0],
    fullAddress: address?.fullAddress ?? '',
    isDefault: address?.isDefault ?? false,
  });

  function submit() {
    start(async () => {
      if (address) {
        await updateAddress(address.id, form);
      } else {
        await createAddress(form);
      }
      onDone?.();
    });
  }

  const isFormValid = form.fullName.length > 1 && form.phone.length > 5 && form.fullAddress.length > 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <Input 
          label="Full Name" 
          icon={User}
          value={form.fullName} 
          onChange={e => setForm({ ...form, fullName: e.target.value })}
          placeholder="Enter your full name"
        />
        <Input 
          label="Phone Number" 
          icon={Phone}
          value={form.phone} 
          onChange={e => setForm({ ...form, phone: e.target.value })}
          placeholder="+212 XXX XXX XXX"
        />
        
        <div className="md:col-span-2">
          <SelectInput 
            label="City" 
            icon={MapPin}
            value={form.city} 
            onChange={e => setForm({ ...form, city: e.target.value })}
            options={MA_CITIES}
          />
        </div>
        
        <div className="md:col-span-2">
          <Input 
            label="Full Address" 
            icon={Home}
            value={form.fullAddress} 
            onChange={e => setForm({ ...form, fullAddress: e.target.value })}
            placeholder="Enter your complete address with building number, street, etc."
          />
        </div>
      </div>

      <motion.label 
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 cursor-pointer"
      >
        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
          form.isDefault 
            ? 'bg-blue-500 border-blue-500 text-white' 
            : 'border-gray-400'
        }`}>
          {form.isDefault && <CheckCircle2 className="w-4 h-4" />}
        </div>
        <div>
          <div className="font-semibold text-gray-800">Set as default shipping address</div>
          <div className="text-sm text-gray-600">This address will be used for all future orders</div>
        </div>
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={e => setForm({ ...form, isDefault: e.currentTarget.checked })}
          className="sr-only"
        />
      </motion.label>

      <motion.button
        onClick={submit}
        disabled={pending || !isFormValid}
        whileHover={{ scale: !pending && isFormValid ? 1.02 : 1 }}
        whileTap={{ scale: !pending && isFormValid ? 0.98 : 1 }}
        className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
          pending || !isFormValid
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-black text-white hover:bg-gray-800 shadow-lg'
        }`}
      >
        {pending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Plus className="w-5 h-5" />
        )}
        {address ? 'Update Address' : 'Add New Address'}
      </motion.button>
    </motion.div>
  );
}

function Input({ label, icon: Icon, ...props }: { label: string; icon: any } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 text-black bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
      />
    </div>
  );
}

function SelectInput({ label, icon: Icon, options, ...props }: { 
  label: string; 
  icon: any; 
  options: string[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </label>
      <select
        {...props}
        className="w-full px-4 py-3 text-black bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
      >
        {options.map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  );
}