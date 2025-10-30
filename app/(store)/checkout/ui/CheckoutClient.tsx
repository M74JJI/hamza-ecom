'use client';

import { useMemo, useState, useTransition } from 'react';
import { MA_CITIES } from '@/lib/ma-cities';
import { isValidMoroccanPhone } from '@/lib/ma-phone';
import { applyCouponAction, placeOrderAction } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Package, CreditCard, Lock, Gift, Sparkles, 
  CheckCircle, MapPin, Phone, Home, ArrowRight, Zap,
  Shield, Clock, Award, Heart, Star, ChevronRight
} from 'lucide-react';
import { AddressForm } from '../../profile/_components/AddressForm';

// Color scheme constants for consistency
const COLORS = {
  primary: {
    bg: 'bg-black',
    text: 'text-white',
    hover: 'hover:bg-gray-800',
    border: 'border-black'
  },
  secondary: {
    bg: 'bg-white',
    text: 'text-gray-800',
    hover: 'hover:bg-gray-50',
    border: 'border-gray-300'
  },
  accent: {
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    hover: 'hover:bg-blue-700',
    border: 'border-blue-600'
  }
} as const;

function fmt(n:number){ return n.toFixed(2) + ' MAD'; }

export default function CheckoutClient({ companies, dbCart, addresses = [] }: { 
  companies: any[], 
  dbCart: any,  
  addresses?: any[];
}) {
  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || 'new'
  );
  const [addingNew, setAddingNew] = useState(addresses.length === 0);

const [newAddress, setNewAddress] = useState({
  id: 'new',
  fullName: '',
  phone: '',
  city: MA_CITIES[0],
  fullAddress: '',
  isDefault: true,
});
  const [companyId, setCompanyId] = useState(companies[0]?.id || '');
  const [couponCode, setCouponCode] = useState('');
  const [couponPercent, setCouponPercent] = useState<number>(0);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const items = dbCart.items as any[];
  const subtotal = useMemo(()=> items.reduce((s,it)=> {
    const base = it.variantSize.priceMAD;
    const pct = it.variantSize.discountPercent || 0;
    const final = pct ? Number((base * (100-pct)/100).toFixed(2)) : base;
    return s + final * it.quantity;
  }, 0), [items]);

  const allFree = useMemo(()=> items.every(it => it.variantSize.variant.freeDelivery === true), [items]);
  const company = companies.find(c => c.id === companyId);
  const shipping = allFree ? 0 : Number(company?.priceMAD || 0);
  const discount = couponPercent > 0 ? Number((subtotal * couponPercent / 100).toFixed(2)) : 0;
  const total = Number((subtotal - discount + shipping).toFixed(2));

  async function onApplyCoupon(e: React.FormEvent){
    e.preventDefault();
    setErr(null); setOk(null);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const res = await applyCouponAction(null, fd);
    if(!res.ok){ setErr(res.error || 'Invalid coupon'); setCouponPercent(0); }
    else{ setCouponPercent(res.percent || 0); setCouponCode(res.code || couponCode); setOk('Coupon applied successfully!'); }
  }

function validAddress() {
  if (!addingNew) return !!selectedAddressId && selectedAddressId !== 'new';
  return (
    newAddress.fullName.length > 1 &&
    isValidMoroccanPhone(newAddress.phone) &&
    newAddress.fullAddress.length > 5 &&
    MA_CITIES.includes(newAddress.city)
  );
}


  function place(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!validAddress()){ setErr('Please fill a valid address'); return; }
    if(!companyId){ setErr('Select a delivery company'); return; }
    const fd = new FormData();

  if (addingNew) {
  fd.set('addressId', 'new');
  fd.set('fullName', newAddress.fullName);
  fd.set('phone', newAddress.phone);
  fd.set('city', newAddress.city);
  fd.set('fullAddress', newAddress.fullAddress);
} else {
  fd.set('addressId', selectedAddressId);
}

    fd.set('shippingCompanyId', companyId);
    if(couponPercent>0 && couponCode) fd.set('couponCode', couponCode);
    start(async ()=>{
      const res = await placeOrderAction(null, fd);
      if(!res?.ok && res?.error){
        setErr(res.error);
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rotate-45"
          animate={{ rotate: [45, 90, 45] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-24 h-24 bg-purple-500/10 -rotate-12"
          animate={{ scale: [1, 1.2, 1], rotate: [-12, 12, -12] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-8 sm:mb-12"
        >
          <div className="flex items-center gap-4 sm:gap-8 flex-wrap justify-center">
            {['Cart', 'Checkout', 'Payment', 'Confirmation'].map((step, index) => (
              <div key={step} className="flex items-center gap-2 sm:gap-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${
                    index <= 1 
                      ? 'bg-black text-white shadow-lg' 
                      : 'bg-white text-gray-400 border border-gray-300'
                  }`}
                >
                  {index <= 1 ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : index + 1}
                </motion.div>
                <span className={`font-medium text-sm sm:text-base ${index <= 1 ? 'text-black' : 'text-gray-500'}`}>
                  {step}
                </span>
                {index < 3 && (
                  <div className="w-6 sm:w-12 h-0.5 bg-gray-300" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
          {/* Left Column - Checkout Form */}
          <div className="xl:col-span-8 space-y-6">
            {/* Order Items Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Order Items</h2>
              </div>
              
              <div className="space-y-4">
                {items.map((it, index) => (
                  <motion.div
                    key={it.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={it.variantSize.variant.variantStyleImg} 
                          alt={it.variantSize.variant.title}
                          className="w-full h-full object-cover"
                        />
                        {it.variantSize.discountPercent && (
                          <div className="absolute -top-2 -left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                            -{it.variantSize.discountPercent}%
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{it.variantSize.variant.title}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Size: {it.variantSize.size} · SKU: {it.variantSize.sku}
                        </div>
                        <div className="text-sm text-gray-600">
                          {it.quantity} × {fmt((it.variantSize.discountPercent? 
                            Number((it.variantSize.priceMAD*(100-it.variantSize.discountPercent)/100).toFixed(2)): 
                            it.variantSize.priceMAD))}
                        </div>
                      </div>
                    </div>
                    {it.variantSize.variant.freeDelivery && (
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                      >
                        <Truck className="w-3 h-3" />
                        Free delivery
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Address Selection */}
          <motion.section
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
>
  <div className="flex items-center gap-3 mb-6">
    <MapPin className="w-6 h-6 text-blue-600" />
    <h2 className="text-2xl font-bold text-gray-800">Shipping Address</h2>
  </div>

  {/* Existing addresses */}
  {addresses.length > 0 && !addingNew && (
    <div className="space-y-4">
      {addresses.map((addr) => (
        <motion.label
          key={addr.id}
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedAddressId === addr.id
              ? 'border-black bg-blue-50/50'
              : 'border-gray-200 hover:border-gray-400'
          }`}
        >
          <input
            type="radio"
            name="address"
            className="sr-only"
            checked={selectedAddressId === addr.id}
            onChange={() => setSelectedAddressId(addr.id)}
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-800">{addr.fullName}</div>
            <div className="text-gray-600">{addr.phone}</div>
            <div className="text-gray-600">{addr.city}</div>
            <div className="text-gray-600">{addr.fullAddress}</div>
          </div>
        </motion.label>
      ))}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setAddingNew(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2"
      >
        <MapPin className="w-5 h-5" />
        Add New Address
      </motion.button>
    </div>
  )}

  {/* New Address Form */}
  {(addingNew || addresses.length === 0) && (
    <AddressForm
      onDone={() => {
        setAddingNew(false);
       // handleAddressCreated();
         window.location.reload();

      }}
    />
  )}
</motion.section>

            {/* Delivery Company */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Truck className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Delivery Company</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {companies.map((c, index) => {
                  const free = items.every(it => it.variantSize.variant.freeDelivery);
                  const label = free ? 'FREE' : fmt(Number(c.priceMAD));
                  return (
                    <motion.label
                      key={c.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        companyId === c.id 
                          ? 'border-black bg-blue-50/50' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          companyId === c.id ? 'bg-black border-black' : 'border-gray-400'
                        }`}>
                          {companyId === c.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{c.name}</div>
                          <div className="text-sm text-gray-600">ETA: {c.avgDays} days</div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        free ? 'text-green-600' : 'text-gray-800'
                      }`}>
                        {label}
                      </div>
                      <input 
                        type="radio" 
                        name="company" 
                        className="sr-only"
                        checked={companyId === c.id} 
                        onChange={() => setCompanyId(c.id)} 
                      />
                    </motion.label>
                  );
                })}
              </div>
            </motion.section>

            {/* Coupon Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Gift className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Apply Coupon</h2>
              </div>
              
              <form onSubmit={onApplyCoupon} className="flex gap-3">
                <input 
                  name="code" 
                  className="flex-1 px-4 py-3 text-black rounded-xl bg-gray-50 border border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 transition-colors" 
                  placeholder="Enter coupon code" 
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                >
                  Apply
                </motion.button>
              </form>
              
              <AnimatePresence>
                {err && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-600 text-sm mt-3 font-medium"
                  >
                    {err}
                  </motion.p>
                )}
                {ok && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-green-600 text-sm mt-3 font-medium"
                  >
                    {ok}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Payment Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Payment Method</h2>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">Cash on Delivery</div>
                    <div className="text-gray-600">Pay when you receive your order</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Shield className="w-4 h-4" />
                  Secure and convenient payment upon delivery
                </div>
              </div>
            </motion.section>
          </div>

          {/* Right Column - Order Summary */}
          <div className="xl:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-8 space-y-6"
            >
              {/* Order Summary */}
              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">Order Summary</h2>
                  <p className="text-blue-100">Review your order details</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-semibold">{fmt(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={`font-semibold ${allFree ? 'text-green-600' : 'text-gray-800'}`}>
                      {allFree ? 'FREE' : fmt(Number(company?.priceMAD || 0))}
                    </span>
                  </div>
                  
                  {couponPercent > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount ({couponPercent}%)</span>
                      <span className="font-semibold">-{fmt(discount)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span>{fmt(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <div className="p-6 border-t border-gray-100">
                  <form onSubmit={place}>
                    <motion.button
                      disabled={pending}
                      whileHover={{ scale: pending ? 1 : 1.02, y: pending ? 0 : -2 }}
                      whileTap={{ scale: pending ? 1 : 0.98 }}
                      className={`w-full ${COLORS.primary.bg} ${COLORS.primary.text} py-4 rounded-xl font-semibold text-lg ${pending ? 'opacity-70 cursor-not-allowed' : COLORS.primary.hover} transition-all flex items-center justify-center gap-3 shadow-lg`}
                    >
                      <Lock className="w-5 h-5" />
                      {pending ? 'Placing Order...' : 'Place Order'}
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </form>

                  {/* Security & Trust */}
                  <div className="flex items-center justify-center gap-4 mt-4 text-gray-500 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Secure Checkout · </span>
                    <CreditCard className="w-4 h-4" />
                    <span>COD Available</span>
                  </div>
                </div>
              </div>

              {/* Trust Features */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { icon: Shield, label: "Secure", desc: "Payment", color: "text-blue-600" },
                  { icon: Truck, label: "Fast", desc: "Delivery", color: "text-green-600" },
                  { icon: Clock, label: "24/7", desc: "Support", color: "text-purple-600" },
                  { icon: Award, label: "2-Year", desc: "Warranty", color: "text-yellow-600" },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color} mx-auto mb-2`} />
                    <div className="font-semibold text-gray-800 text-sm">{feature.label}</div>
                    <div className="text-gray-600 text-xs">{feature.desc}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Need Help */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Need Help?</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Our support team is here to help with your order
                </p>
                <div className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2">
                  Contact Support
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Trust Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gray-300"
        >
          {[
            { icon: Shield, value: "Secure", label: "PAYMENT", color: "text-blue-600" },
            { icon: Truck, value: "Fast", label: "DELIVERY", color: "text-green-600" },
            { icon: Clock, value: "24/7", label: "SUPPORT", color: "text-purple-600" },
            { icon: Award, value: "2-Year", label: "WARRANTY", color: "text-yellow-600" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-300 shadow-lg"
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <div className="text-xl font-black text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs font-medium text-gray-700">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}