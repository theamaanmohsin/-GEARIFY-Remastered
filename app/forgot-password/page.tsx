"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setDevToken(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { error: text || `Server error (${res.status})` };
      }

      if (!res.ok) {
        throw new Error(data.detail || data.error || "Password reset request failed");
      }

      setSuccessMessage(
        data.message || "If an account with that email exists, a password reset link has been generated."
      );
      if (data.reset_token) {
        setDevToken(data.reset_token);
      }
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
          href="/login"
          className="btn-ghost px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
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

          <div className="text-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <KeyRound className="w-7 h-7 logo-wrench-icon" />
            </div>
            <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
              Reset Password
            </h2>
            <p className="text-xs font-medium mt-1" style={{ color: "var(--text-muted)" }}>
              Enter your account email to receive a secure, 15-minute reset token
            </p>
          </div>

          {error && (
            <motion.div
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
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

          {successMessage ? (
            <div className="space-y-5">
              <div
                className="p-4 rounded-2xl border text-xs font-medium space-y-2"
                style={{
                  backgroundColor: "var(--status-good-bg)",
                  borderColor: "var(--status-good)",
                  color: "var(--status-good)",
                }}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Reset Link Generated</span>
                </div>
                <p className="leading-relaxed opacity-95">{successMessage}</p>
                <p className="text-[11px] opacity-80">
                  Note: Tokens expire after 15 minutes and can only be used once.
                </p>
              </div>

              {devToken && (
                <div
                  className="p-4 rounded-2xl border space-y-3"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                    Development Mode Reset Token:
                  </p>
                  <div
                    className="p-2.5 rounded-xl text-[11px] font-mono break-all border"
                    style={{
                      backgroundColor: "var(--bg-main)",
                      borderColor: "var(--card-border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {devToken}
                  </div>
                  <Link
                    href={`/reset-password?token=${encodeURIComponent(devToken)}`}
                    className="btn-accent w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Set New Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="btn-ghost text-xs font-bold px-4 py-2"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Work Email Address
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

              <motion.button
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-accent w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-6 uppercase tracking-wider"
              >
                {loading ? <span>Generating Token...</span> : <span>Send Reset Instructions</span>}
              </motion.button>

              <div
                className="mt-6 pt-5 border-t text-center text-xs font-medium"
                style={{ borderColor: "var(--divider)", color: "var(--text-muted)" }}
              >
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-bold underline underline-offset-4"
                  style={{ color: "var(--accent)" }}
                >
                  Sign In Here
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      <footer
        className="text-center text-xs font-medium py-2 z-10"
        style={{ color: "var(--text-muted)" }}
      >
        GEARIFY REMASTERED v2.0 • Security Protected
      </footer>
    </div>
  );
}
