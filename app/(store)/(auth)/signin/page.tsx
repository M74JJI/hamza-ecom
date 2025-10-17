// app/(auth)/signin/page.tsx
"use client"
import { SignInForm } from "./signin-form";
import { motion } from 'framer-motion';
import { ShoppingBag, Tag, Truck, Clock, Shield, Star, Zap, Key } from 'lucide-react';
import { AnimatedBackground } from "../../profile/_components/AnimatedBackground";

export default function SignIn(){
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-8 flex items-center justify-center">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left Side - Welcome Back & Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Welcome Back Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold">
                <Key className="w-5 h-5" />
                WELCOME BACK
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                Good to
                <br />
                <span className="text-green-600">See You!</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Continue your shopping journey with personalized recommendations, 
                saved preferences, and exclusive member benefits.
              </p>
            </motion.div>

            {/* Returning Member Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {[
                {
                  icon: ShoppingBag,
                  title: "Quick Checkout",
                  description: "Your saved details for faster purchases",
                  color: "text-blue-600 bg-blue-100"
                },
                {
                  icon: Tag,
                  title: "Active Offers",
                  description: "Personalized deals waiting for you",
                  color: "text-green-600 bg-green-100"
                },
                {
                  icon: Clock,
                  title: "Order History",
                  description: "Track and reorder your favorites",
                  color: "text-purple-600 bg-purple-100"
                },
                {
                  icon: Star,
                  title: "Saved Preferences",
                  description: "Your size, style, and brand preferences",
                  color: "text-yellow-600 bg-yellow-100"
                },
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className={`w-12 h-12 ${benefit.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Security & Trust */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Secure Sign In</h3>
                  <p className="text-gray-600">Your account is protected</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Encrypted connection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>No password sharing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure session management</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Sign In Form */}
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
                    <Key className="w-8 h-8" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                  <p className="text-gray-300">Sign in to your account</p>
                </div>

                {/* Form Content */}
                <div className="p-8">
                  <SignInForm />
                </div>

                {/* Quick Recovery */}
                <div className="px-8 pb-8">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">
                      <a href="/forgot-password" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
                        Forgot your password?
                      </a>
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Member Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 grid grid-cols-3 gap-4 text-center"
              >
                {[
                  { icon: Star, label: "50K+", value: "Members" },
                  { icon: Zap, label: "4.8★", value: "Rating" },
                  { icon: Truck, label: "Free", value: "Shipping" },
                ].map((item, index) => (
                  <div key={item.label} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <item.icon className="w-5 h-5 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-gray-900">{item.label}</div>
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