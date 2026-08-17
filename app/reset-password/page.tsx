"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Lock, KeyRound, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const queryToken = searchParams.get("token");
    if (queryToken) {
      setToken(queryToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError("Password reset token is required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          new_password: newPassword,
        }),
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
        throw new Error(data.detail || data.error || "Password reset failed");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <ShieldCheck className="w-7 h-7 logo-wrench-icon" />
        </div>
        <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
          Set New Password
        </h2>
        <p className="text-xs font-medium mt-1" style={{ color: "var(--text-muted)" }}>
          Choose a secure password of at least 8 characters
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

      {success ? (
        <div className="space-y-6">
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
              <span>Password Updated Successfully</span>
            </div>
            <p className="leading-relaxed opacity-95">
              Your password has been securely reset. All previous sessions across devices have been revoked.
            </p>
          </div>

          <Link
            href="/login"
            className="btn-accent w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            Sign In with New Password
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Reset Security Token
            </label>
            <div className="relative">
              <KeyRound
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter 15-minute reset token"
                className="input-field font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              New Password
            </label>
            <div className="relative">
              <Lock
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Confirm New Password
            </label>
            <div className="relative">
              <Lock
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="input-field"
              />
            </div>
          </div>

          {newPassword && (
            <div className="p-3 rounded-xl border text-[11px] font-medium space-y-1" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--text-secondary)" }}>Length Check (≥ 8 chars):</span>
                <span className={newPassword.length >= 8 ? "font-bold text-emerald-600" : "font-bold text-amber-600"}>
                  {newPassword.length >= 8 ? "✓ Valid" : `${newPassword.length}/8`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--text-secondary)" }}>Matching Passwords:</span>
                <span className={confirmPassword && newPassword === confirmPassword ? "font-bold text-emerald-600" : "font-bold text-amber-600"}>
                  {confirmPassword && newPassword === confirmPassword ? "✓ Match" : "Pending match"}
                </span>
              </div>
            </div>
          )}

          <motion.button
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-accent w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-6 uppercase tracking-wider"
          >
            {loading ? <span>Updating Password...</span> : <span>Confirm & Update Password</span>}
          </motion.button>

          <div
            className="mt-6 pt-5 border-t text-center text-xs font-medium"
            style={{ borderColor: "var(--divider)", color: "var(--text-muted)" }}
          >
            Remembered your credentials?{" "}
            <Link
              href="/login"
              className="font-bold underline underline-offset-4"
              style={{ color: "var(--accent)" }}
            >
              Sign In
            </Link>
          </div>
        </form>
      )}
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between py-8 px-4 relative">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link
          href="/login"
          className="btn-ghost px-4 py-2 text-xs font-semibold"
        >
          Back to Sign In
        </Link>
        <ThemeToggle />
      </div>

      {/* Form Container */}
      <div className="flex-1 flex items-center justify-center my-8 z-10">
        <Suspense fallback={<div className="glass-panel p-8 rounded-3xl text-xs font-bold">Loading reset form...</div>}>
          <ResetPasswordForm />
        </Suspense>
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
