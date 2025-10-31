"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, CheckCircle2, Key, Shield, Zap, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AnimatedBackground } from "@/app/(store)/profile/_components/AnimatedBackground";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(undefined);

    const res = await fetch("/api/auth/reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const j = await res.json().catch(() => null);
    if (!res.ok) {
      setError(j?.error || "Something went wrong. Try again.");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-8 flex items-center justify-center">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left Side - Recovery Info & Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Recovery Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold">
                <Key className="w-5 h-5" />
                PASSWORD RECOVERY
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                No worries,
                <br />
                <span className="text-green-600">We Got You!</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Get back to your shopping journey quickly. We'll send you a secure 
                reset link to restore your account access in no time.
              </p>
            </motion.div>

            {/* Recovery Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {[
                {
                  icon: Zap,
                  title: "Instant Delivery",
                  description: "Reset links arrive in seconds",
                  color: "text-yellow-600 bg-yellow-100"
                },
                {
                  icon: Clock,
                  title: "Quick Recovery",
                  description: "Back to shopping in minutes",
                  color: "text-blue-600 bg-blue-100"
                },
                {
                  icon: Shield,
                  title: "Secure Process",
                  description: "Encrypted and protected",
                  color: "text-green-600 bg-green-100"
                },
                {
                  icon: Mail,
                  title: "Easy Steps",
                  description: "Follow the simple instructions",
                  color: "text-purple-600 bg-purple-100"
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

            {/* Security Assurance */}
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
                  <h3 className="font-semibold text-gray-900 text-lg">Secure Recovery</h3>
                  <p className="text-gray-600">Your account safety is our priority</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>One-time use reset links</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Links expire after 1 hour</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>No password revealed in email</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Recovery Form */}
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
                  <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
                  <p className="text-gray-300">Enter your email to get started</p>
                </div>

                {/* Form Content */}
                <div className="p-8">
                  {success ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center space-y-6"
                    >
                      <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold text-gray-900">Check Your Email!</h3>
                        <p className="text-gray-600">
                          If an account exists for <b>{email}</b>, you'll receive a password reset link shortly.
                        </p>
                      </div>
                      <Link
                        href="/signin"
                        className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Sign In
                      </Link>
                    </motion.div>
                  ) : (
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
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50 border border-red-200 rounded-xl p-4"
                          >
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
                          loading
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700 shadow-lg"
                        }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>Send Reset Link</>
                        )}
                      </motion.button>
                    </motion.form>
                  )}
                </div>

                {/* Back to Sign In */}
                <div className="px-8 pb-8 border-t border-gray-100 pt-6">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">
                      Remember your password?{" "}
                      <Link href="/signin" className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Recovery Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 grid grid-cols-3 gap-4 text-center"
              >
                {[
                  { icon: Zap, label: "Instant", value: "Delivery" },
                  { icon: Shield, label: "Secure", value: "Process" },
                  { icon: Clock, label: "1 Hour", value: "Expiry" },
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