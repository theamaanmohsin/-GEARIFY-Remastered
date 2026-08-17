"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Gauge, Wrench, QrCode, Cpu, Layers } from "lucide-react";

export default function MarketingHero() {
  const reduceMotion = useReducedMotion();
  const titleLetters = ["G", "E", "A", "R", "I", "F", "Y"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 35, rotateX: -25 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <section
      data-trail-color="charcoal"
      className="relative min-h-[92vh] flex flex-col justify-between pt-32 pb-20 px-4 sm:px-6 lg:px-12 border-b overflow-hidden"
      style={{
        borderColor: "var(--divider-strong)",
        backgroundColor: "var(--bg-main)",
      }}
    >
      {/* Subtle Mesh Glows */}
      <div
        className="absolute -top-36 -left-36 w-[560px] h-[560px] rounded-full blur-[150px] opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
      />
      <div
        className="absolute -bottom-36 -right-36 w-[580px] h-[580px] rounded-full blur-[160px] opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent-muted), transparent 70%)" }}
      />

      {/* Top Header Tag Strip */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b text-xs font-mono" style={{ borderColor: "var(--divider)", color: "var(--text-muted)" }}>
        <div className="flex items-center gap-3">
          <span
            className="px-2.5 py-0.5 rounded font-bold uppercase tracking-wider border"
            style={{
              borderColor: "var(--accent)",
              color: "var(--accent)",
              backgroundColor: "var(--accent-muted)",
            }}
          >
            APMS v2.0
          </span>
          <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
            AUTOMOTIVE PERFORMANCE MANAGEMENT SYSTEM
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 font-bold" style={{ color: "var(--status-good)" }}>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            STANDALONE CLOUD TERMINAL
          </span>
          <span className="text-slate-500 hidden sm:inline">·</span>
          <span className="hidden sm:inline text-slate-400">ENGINEERED FOR WORKSHOPS</span>
        </div>
      </div>

      {/* Main Centerpiece Typography */}
      <div className="relative z-10 w-full max-w-7xl mx-auto my-auto py-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
            <span>MODERN WORKSHOP INFRASTRUCTURE</span>
          </div>

          {/* Kinetic Display "GEARIFY" */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full flex items-baseline justify-between select-none tracking-tighter"
            style={{ perspective: 1000 }}
          >
            {titleLetters.map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="font-black text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] leading-none inline-block drop-shadow-xl"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>

          {/* Editorial Subtitle & Value Proposition Grid */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t" style={{ borderColor: "var(--divider)" }}>
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-snug" style={{ color: "var(--text-primary)" }}>
                The high-contrast, type-led operating platform for professional automotive service centers, mechanics, and fleet managers.
              </h2>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Eliminate spreadsheet decay and billing disputes. Gearify brings precision service telemetry, item-level parts margin governance, verified QR passports, and dual-regime vehicle schedules into a unified workshop environment.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              {/* Feature Highlights Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl border" style={{ backgroundColor: "var(--card-bg-solid)", borderColor: "var(--card-border)" }}>
                  <span className="block text-[10px] text-slate-500 uppercase">HEALTH ENGINE</span>
                  <span className="font-bold text-sm text-[var(--status-good)]">100-Pt Telemetry</span>
                </div>
                <div className="p-3.5 rounded-xl border" style={{ backgroundColor: "var(--card-bg-solid)", borderColor: "var(--card-border)" }}>
                  <span className="block text-[10px] text-slate-500 uppercase">FLEET SCOPE</span>
                  <span className="font-bold text-sm text-[var(--accent)]">Auto & Motorcycle</span>
                </div>
                <div className="p-3.5 rounded-xl border" style={{ backgroundColor: "var(--card-bg-solid)", borderColor: "var(--card-border)" }}>
                  <span className="block text-[10px] text-slate-500 uppercase">PARTS PRICING</span>
                  <span className="font-bold text-sm text-[var(--status-warning)]">Dynamic Margins</span>
                </div>
                <div className="p-3.5 rounded-xl border" style={{ backgroundColor: "var(--card-bg-solid)", borderColor: "var(--card-border)" }}>
                  <span className="block text-[10px] text-slate-500 uppercase">VERIFICATION</span>
                  <span className="font-bold text-sm text-[var(--accent-secondary)]">Immutable QR</span>
                </div>
              </div>

              {/* Action Buttons (Strictly Pre-Login) */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/register"
                  className="btn-accent w-full sm:w-auto px-8 py-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-center"
                >
                  Get Started Free
                </Link>
                <Link
                  href="#features"
                  className="btn-ghost w-full sm:w-auto px-6 py-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-center"
                >
                  Explore Capabilities
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Feature Anchor Bar */}
      <div className="relative z-10 w-full max-w-7xl mx-auto pt-6 border-t flex flex-wrap items-center justify-between gap-4 text-xs font-mono" style={{ borderColor: "var(--divider)", color: "var(--text-muted)" }}>
        <div className="flex items-center gap-4 overflow-x-auto py-1">
          <Link href="#feature-telemetry" className="hover:text-[var(--accent)] transition-colors whitespace-nowrap">
            [01] SERVICE TELEMETRY
          </Link>
          <span>·</span>
          <Link href="#feature-dual-fleet" className="hover:text-[var(--accent)] transition-colors whitespace-nowrap">
            [02] DUAL FLEET
          </Link>
          <span>·</span>
          <Link href="#feature-parts" className="hover:text-[var(--accent)] transition-colors whitespace-nowrap">
            [03] PARTS PRICING
          </Link>
          <span>·</span>
          <Link href="#feature-qr" className="hover:text-[var(--accent)] transition-colors whitespace-nowrap">
            [04] QR PASSPORTS
          </Link>
          <span>·</span>
          <Link href="#feature-rbac" className="hover:text-[var(--accent)] transition-colors whitespace-nowrap">
            [05] RBAC COMMAND
          </Link>
        </div>
        <span className="text-[10px] text-slate-500 font-bold uppercase">
          MARKETING OVERVIEW
        </span>
      </div>
    </section>
  );
}
