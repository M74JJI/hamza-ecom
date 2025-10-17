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
                and personalized recommendations.
              </p>
            </motion.div>

            {/* E-commerce Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {[
                {
                  icon: Tag,
                  title: "Exclusive Deals",
                  description: "Members-only discounts and early access to sales",
                  color: "text-green-600 bg-green-100"
                },
                {
                  icon: Truck,
                  title: "Free Shipping",
                  description: "Free delivery on orders over 500 MAD",
                  color: "text-blue-600 bg-blue-100"
                },
                {
                  icon: Clock,
                  title: "Faster Checkout",
                  description: "Save your details for quick, easy purchases",
                  color: "text-purple-600 bg-purple-100"
                },
                {
                  icon: Star,
                  title: "Earn Rewards",
                  description: "Collect points with every purchase",
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

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full border-2 border-white" />
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">5,000+</span> shoppers joined this week
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">4.8/5</span>
                </div>
                <div className="text-gray-600">Based on 2,500+ reviews</div>
              </div>
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