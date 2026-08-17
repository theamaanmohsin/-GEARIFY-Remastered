"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Wrench, Lock, Mail, User, Shield, AlertCircle } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"mechanic" | "admin">("mechanic");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const reduceMotion = useReducedMotion();

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

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { error: text.includes("Internal") ? "Server is starting up. Please try again in a few seconds." : text || `Server error (${res.status})` };
      }

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
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
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-secondary))" }}
          />

          <div className="text-center mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))" }}
            >
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
              Create Account
            </h2>
            <p className="text-xs font-medium mt-1" style={{ color: "var(--text-muted)" }}>
              Join your workshop team on GEARIFY REMASTERED v2.0
            </p>
          </div>

          {error && (
            <motion.div
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 25 }}
              className="mb-5 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border"
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
                className="block text-xs font-bold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Full Name
              </label>
              <div className="relative">
                <User
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Amaan Mohsin"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Email Address
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
                  placeholder="amaan@gearify.pk"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-1"
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

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "mechanic" | "admin")}
                className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:outline-none transition-all"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--card-border)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="mechanic">Mechanic (User)</option>
                <option value="admin">Workshop Manager (Admin)</option>
              </select>
            </div>

            {/* Animated Admin Secret Key Box */}
            <AnimatePresence>
              {role === "admin" && (
                <motion.div
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 25 }}
                  className="overflow-hidden pt-1"
                >
                  <div
                    className="p-3.5 rounded-2xl border space-y-1.5"
                    style={{
                      backgroundColor: "var(--status-warning-bg)",
                      borderColor: "var(--status-warning)",
                    }}
                  >
                    <label
                      className="block text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                      style={{ color: "var(--status-warning)" }}
                    >
                      <Shield className="w-4 h-4" /> Admin Security Key
                    </label>
                    <input
                      type="password"
                      required={role === "admin"}
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder="Enter Admin Key (e.g. GearifyAPMS)"
                      className="w-full px-3 py-2 rounded-xl text-sm font-bold border focus:outline-none"
                      style={{
                        backgroundColor: "var(--bg-main)",
                        borderColor: "var(--card-border)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <p className="text-[10px] font-semibold" style={{ color: "var(--status-warning)" }}>
                      Required to verify manager permissions.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-accent w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-6 uppercase tracking-wider"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <span>Complete Registration</span>
              )}
            </motion.button>
          </form>

          <div
            className="mt-6 pt-5 border-t text-center text-xs font-medium"
            style={{ borderColor: "var(--divider)", color: "var(--text-muted)" }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold underline underline-offset-4"
              style={{ color: "var(--accent)" }}
            >
              Sign In
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
