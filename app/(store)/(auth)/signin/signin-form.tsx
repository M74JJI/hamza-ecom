// app/(auth)/signin/signin-form.tsx
'use client';
import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function SignInForm(){
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>){
    e.preventDefault();
    setLoading(true); 
    setError(undefined);
    
    const data = new FormData(e.currentTarget);
    const res = await fetch('/auth/signin', { 
      method: 'POST', 
      body: data 
    });
    
    if(res.redirected){ 
      window.location.href = res.url; 
      return; 
    }
    
    const j = await res.json().catch(() => null);
    if(!res.ok){ 
      setError(j?.error || 'Invalid email or password. Please try again.'); 
    }
    setLoading(false);
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
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all pr-12"
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

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input 
            type="checkbox" 
            name="remember"
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          Remember me
        </label>
        
        <a 
          href="/forgot-password" 
          className="text-sm text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
        >
          Forgot password?
        </a>
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
            : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Signing In...
          </>
        ) : (
          <>
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>

      {/* Sign Up Link */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link 
            href="/signup" 
            className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors"
          >
            Create one here
          </Link>
        </p>
      </div>
    </motion.form>
  );
}