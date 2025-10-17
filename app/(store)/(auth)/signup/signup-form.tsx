// app/(auth)/signup/signup-form.tsx
'use client';
import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function SignUpForm(){
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [ok, setOk] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>){
    e.preventDefault();
    setLoading(true); 
    setError(undefined);
    
    const data = new FormData(e.currentTarget);
    const res = await fetch('/auth/signup', { 
      method: 'POST', 
      body: data 
    });
    
    const j = await res.json().catch(() => null);
    if(!res.ok){ 
      setError(j?.error || 'Failed to create account. Please try again.'); 
    } else { 
      setOk(true); 
    }
    setLoading(false);
  }

  if (ok) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to the Club!</h3>
        <p className="text-gray-600 mb-4">
          We've sent a verification link to your email.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Verify your email to start shopping and unlock member benefits.
        </p>
        
        <Link href="/products">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </motion.button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name
          </label>
          <input 
            name="name" 
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            required
          />
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </label>
          <input 
            name="email" 
            type="email" 
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            required
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Password
          </label>
          <div className="relative">
            <input 
              name="password" 
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
          loading
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating Account...
          </>
        ) : (
          <>
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>

      {/* Login Link */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link 
            href="/signin" 
            className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </motion.form>
  );
}