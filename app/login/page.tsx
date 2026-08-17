"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Wrench, Lock, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { error: text.includes("Internal") ? "Server is starting up. Please try again in a few seconds." : text || `Server error (${res.status})` };
      }

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.token) {
        localStorage.setItem("gearify_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("gearify_user", JSON.stringify(data.user));
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-8 px-4 relative">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link
          href="/"
          className="btn-ghost px-4 py-2 text-xs font-semibold"
        >
          Back to Home
        </Link>
        <ThemeToggle />
      </div>

      {/* Form Container */}
      <div className="flex-1 flex items-center justify-center my-8 z-10">
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }}
          className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Top Accent Line */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: "var(--accent)" }}
          />

          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <Wrench className="w-7 h-7 logo-wrench-icon" />
            </div>
            <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
              Welcome Back
            </h2>
            <p className="text-xs font-medium mt-1" style={{ color: "var(--text-muted)" }}>
              Sign in to access workshop performance tools
            </p>
          </div>

          {error && (
            <motion.div
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 25 }}
              className="mb-6 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border"
              style={{
                backgroundColor: "var(--status-danger-bg)",
                borderColor: "var(--status-danger)",
                color: "var(--status-danger)",
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Work Email
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>
            </div>

            <motion.button
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-accent w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-6 uppercase tracking-wider"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </motion.button>
          </form>

          <div
            className="mt-8 pt-6 border-t text-center text-xs font-medium"
            style={{ borderColor: "var(--divider)", color: "var(--text-muted)" }}
          >
            Need a workshop account?{" "}
            <Link
              href="/register"
              className="font-bold underline underline-offset-4"
              style={{ color: "var(--accent)" }}
            >
              Register Here
            </Link>
          </div>
        </motion.div>
      </div>

      <footer
        className="text-center text-xs font-medium py-2 z-10"
        style={{ color: "var(--text-muted)" }}
      >
        GEARIFY REMASTERED v2.0
      </footer>
    </div>
  );
}
