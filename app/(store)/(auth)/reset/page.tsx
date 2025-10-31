"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Key, Shield, Zap, Clock, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatedBackground } from "@/app/(store)/profile/_components/AnimatedBackground";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Invalid reset link");
      return;
    }

    setLoading(true);
    setError(undefined);

    const res = await fetch("/api/auth/reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const j = await res.json().catch(() => null);
    if (!res.ok) setError(j?.error || "Reset failed. Try again.");
    else setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-8 flex items-center justify-center">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left Side - Security Info & Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Security Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold">
                <Lock className="w-5 h-5" />
                NEW PASSWORD
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                Fresh Start,
                <br />
                <span className="text-green-600">Secure Future!</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Create a strong new password to protect your account and continue 
                your secure shopping experience with enhanced protection.
              </p>
            </motion.div>

            {/* Password Security Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {[
                {
                  icon: Shield,
                  title: "Strong Protection",
                  description: "Mix letters, numbers & symbols",
                  color: "text-green-600 bg-green-100"
                },
                {
                  icon: Zap,
                  title: "Instant Access",
                  description: "Get back to shopping immediately",
                  color: "text-yellow-600 bg-yellow-100"
                },
                {
                  icon: Lock,
                  title: "Unique Password",
                  description: "Don't reuse old passwords",
                  color: "text-blue-600 bg-blue-100"
                },
                {
                  icon: CheckCircle,
                  title: "Secure Storage",
                  description: "Encrypted and protected",
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

            {/* Security Standards */}
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
                  <h3 className="font-semibold text-gray-900 text-lg">Password Standards</h3>
                  <p className="text-gray-600">Keep your account secure</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Minimum 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Letters and numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Case sensitivity enabled</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Reset Form */}
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
                    <Lock className="w-8 h-8" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">New Password</h2>
                  <p className="text-gray-300">Create your secure new password</p>
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
                        <h3 className="text-xl font-bold text-gray-900">Password Updated!</h3>
                        <p className="text-gray-600">
                          Your password has been reset successfully. You can now sign in with your new password.
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
                      onSubmit={onSubmit}
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
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
                          <Lock className="w-4 h-4" />
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={show ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShow(!show)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Confirm Password
                        </label>
                        <input
                          type={show ? "text" : "password"}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder="Confirm new password"
                          required
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
                            Resetting...
                          </>
                        ) : (
                          <>Reset Password</>
                        )}
                      </motion.button>
                    </motion.form>
                  )}
                </div>

                {/* Password Tips */}
                <div className="px-8 pb-8 border-t border-gray-100 pt-6">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">
                      Make it strong! Use a mix of letters, numbers, and symbols.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Security Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 grid grid-cols-3 gap-4 text-center"
              >
                {[
                  { icon: Shield, label: "256-bit", value: "Encryption" },
                  { icon: Lock, label: "Secure", value: "Storage" },
                  { icon: Zap, label: "Instant", value: "Update" },
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