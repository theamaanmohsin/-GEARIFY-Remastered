"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Lock, Mail, User, Shield, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"mechanic" | "admin">("mechanic");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          secret_key: secretKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (data.user) {
        localStorage.setItem("gearify_user", JSON.stringify(data.user));
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Create GEARIFY Account
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Join your workshop team on GEARIFY APMS v2
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Amaan Mohsin"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-500/5 border border-gray-200/50 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="amaan@gearify.pk"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-500/5 border border-gray-200/50 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-500/5 border border-gray-200/50 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Account Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "mechanic" | "admin")}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-500/5 border border-gray-200/50 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            >
              <option value="mechanic" className="dark:bg-gray-900">
                Mechanic (User)
              </option>
              <option value="admin" className="dark:bg-gray-900">
                Workshop Manager (Admin)
              </option>
            </select>
          </div>

          {/* Animated Admin Secret Key Box */}
          <AnimatePresence>
            {role === "admin" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden pt-1"
              >
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                  <label className="block text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Admin Security Key
                  </label>
                  <input
                    type="password"
                    required={role === "admin"}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter Admin Key (e.g. GearifyAPMS)"
                    className="w-full px-3 py-2 rounded-xl bg-white/60 dark:bg-gray-900/60 border border-amber-500/40 text-sm focus:outline-none"
                  />
                  <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
                    Required to verify manager permissions.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="neu-button w-full py-3.5 rounded-xl font-bold text-sm text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2 mt-6 uppercase tracking-wider"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-200/50 dark:border-white/5 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-indigo-500 hover:text-indigo-600 underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
