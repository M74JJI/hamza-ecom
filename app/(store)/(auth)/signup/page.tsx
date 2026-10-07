// app/(auth)/signup/page.tsx
"use client"
import { SignUpForm } from "./signup-form";
import { motion } from 'framer-motion';
import { ShoppingBag, Tag, Truck, Clock, Shield, Star, Award, Zap } from 'lucide-react';
import { AnimatedBackground } from "../../profile/_components/AnimatedBackground";

export default function SignUp(){
  return (
    <div className="h-[calc(100v-50px)] bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-8 flex items-center justify-center">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left Side - E-commerce Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* E-commerce Focused Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold">
                <ShoppingBag className="w-5 h-5" />
                START SHOPPING TODAY
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                Ready to
                <br />
                <span className="text-blue-600">Shop Smarter?</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Join thousands of savvy shoppers who get exclusive deals, faster checkout, 
                plus saved addresses, order history, wishlists, and reviews.
              </p>
            </motion.div>

          </motion.div>

          {/* Right Side - Sign Up Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
              >
                {/* Form Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
                  >
                    <ShoppingBag className="w-8 h-8" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
                  <p className="text-gray-300">Start your shopping journey</p>
                </div>

                {/* Form Content */}
                <div className="p-8">
                  <SignUpForm />
                </div>

                {/* Security & Trust */}
                <div className="px-8 pb-8">
                  <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">Secure Registration</div>
                      <div className="text-gray-600">Your data is protected</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 grid grid-cols-3 gap-4 text-center"
              >
                {[
                  { icon: Zap, label: "Fast", value: "Checkout" },
                  { icon: Award, label: "Premium", value: "Quality" },
                  { icon: Truck, label: "Free", value: "Delivery" },
                ].map((item, index) => (
                  <div key={item.label} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <item.icon className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                    <div className="text-xs font-semibold text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-600">{item.value}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
