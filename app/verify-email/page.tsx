"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { MailCheck, KeyRound, AlertCircle, CheckCircle2, RefreshCw, Mail } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendMode, setResendMode] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const handleVerify = async (tokenToVerify: string) => {
    if (!tokenToVerify.trim()) {
      setError("Please provide an email verification token.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToVerify.trim() }),
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
        throw new Error(data.detail || data.error || "Email verification failed");
      }

      if (data.token) {
        localStorage.setItem("gearify_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("gearify_user", JSON.stringify(data.user));
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queryToken = searchParams.get("token");
    if (queryToken) {
      setToken(queryToken);
      handleVerify(queryToken);
    }
  }, [searchParams]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendLoading(true);
    setResendMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });

      const data = await res.json();
      setResendMessage(data.message || "Verification instructions sent.");
      if (data.verification_token) {
        setToken(data.verification_token);
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend verification");
    } finally {
      setResendLoading(false);
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
          <MailCheck className="w-7 h-7 logo-wrench-icon" />
        </div>
        <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
          Email Verification
        </h2>
        <p className="text-xs font-medium mt-1" style={{ color: "var(--text-muted)" }}>
          Confirm your account email address for full system security
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
              <span>Email Verified Successfully</span>
            </div>
            <p className="leading-relaxed opacity-95">
              Your account email address is confirmed. You now have full access to workshop tools.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="btn-accent w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : resendMode ? (
        <form onSubmit={handleResend} className="space-y-4">
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Account Email
            </label>
            <div className="relative">
              <Mail
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="email"
                required
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="name@example.com"
                className="input-field"
              />
            </div>
          </div>

          {resendMessage && (
            <div
              className="p-3.5 rounded-xl border text-xs font-medium"
              style={{
                backgroundColor: "var(--status-good-bg)",
                borderColor: "var(--status-good)",
                color: "var(--status-good)",
              }}
            >
              {resendMessage}
            </div>
          )}

          <motion.button
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            type="submit"
            disabled={resendLoading}
            className="btn-accent w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-4 uppercase tracking-wider"
          >
            {resendLoading ? <span>Sending...</span> : <span>Send New Verification Token</span>}
          </motion.button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setResendMode(false)}
              className="text-xs font-bold underline"
              style={{ color: "var(--accent)" }}
            >
              Have a verification token? Enter it here
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(token);
          }}
          className="space-y-4"
        >
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Verification Token
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
                placeholder="Enter 24-hour verification token"
                className="input-field font-mono text-xs"
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
            {loading ? <span>Verifying...</span> : <span>Verify Email Address</span>}
          </motion.button>

          <div
            className="mt-6 pt-5 border-t flex items-center justify-between text-xs font-medium"
            style={{ borderColor: "var(--divider)", color: "var(--text-muted)" }}
          >
            <button
              type="button"
              onClick={() => setResendMode(true)}
              className="hover:underline flex items-center gap-1 font-semibold"
              style={{ color: "var(--accent)" }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Resend Token
            </button>
            <Link
              href="/dashboard"
              className="font-bold underline underline-offset-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Skip for now
            </Link>
          </div>
        </form>
      )}
    </motion.div>
  );
}

export default function VerifyEmailPage() {
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
        <Suspense fallback={<div className="glass-panel p-8 rounded-3xl text-xs font-bold">Loading verification...</div>}>
          <VerifyEmailForm />
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
