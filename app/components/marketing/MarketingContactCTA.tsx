"use client";

import React from "react";
import Link from "next/link";
import { Wrench, Shield, Mail, Phone, MapPin, Terminal } from "lucide-react";

export default function MarketingContactCTA() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      id="contact"
      data-trail-color="cyan"
      className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-12 border-t overflow-hidden"
      style={{
        borderColor: "var(--divider-strong)",
        backgroundColor: "var(--bg-main)",
      }}
    >
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Massive Pre-Login CTA Card */}
        <div
          className="rounded-3xl border p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
          style={{
            backgroundColor: "var(--card-bg-solid)",
            borderColor: "var(--card-border)",
            boxShadow: "var(--card-shadow-lg)",
          }}
        >
          <div className="space-y-4 max-w-2xl">
            <span
              className="px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border"
              style={{
                borderColor: "var(--accent)",
                color: "var(--accent)",
                backgroundColor: "var(--accent-muted)",
              }}
            >
              DEPLOY CLOUD TERMINAL
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>
              Ready to modernize your workshop operations?
            </h2>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Open your free terminal account today. Pre-seeded with 43+ Pakistan inventory items, live health decay telemetry, and printable QR receipts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            <Link
              href="/register"
              className="btn-accent px-8 py-4 rounded-xl text-center font-mono font-bold uppercase tracking-wider shadow-lg text-sm"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="btn-ghost px-6 py-4 rounded-xl text-center font-mono font-bold uppercase tracking-wider text-sm"
            >
              Terminal Sign In
            </Link>
          </div>
        </div>

        {/* Directory Ledger Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t text-xs font-mono" style={{ borderColor: "var(--divider)" }}>
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              <Wrench className="w-4 h-4 text-[var(--accent)]" />
              <span>GEARIFY APMS</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Automotive Performance Management System engineered for modern independent workshops and commercial fleet operators.
            </p>
            <div className="text-[10px] text-slate-500 pt-2">
              VERSION 2.0 · PRODUCTION CLOUD
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <div className="font-bold text-slate-300 uppercase tracking-widest text-[10px]">
              PLATFORM CAPABILITIES
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li><Link href="#feature-telemetry" className="hover:text-[var(--accent)] transition-colors">· 100-Point Health Engine</Link></li>
              <li><Link href="#feature-dual-fleet" className="hover:text-[var(--accent)] transition-colors">· Dual Motorcycle & Auto Fleet</Link></li>
              <li><Link href="#feature-parts" className="hover:text-[var(--accent)] transition-colors">· 43+ Parts Margin Governance</Link></li>
              <li><Link href="#feature-qr" className="hover:text-[var(--accent)] transition-colors">· Immutable QR Passports</Link></li>
              <li><Link href="#feature-rbac" className="hover:text-[var(--accent)] transition-colors">· RBAC Role Security</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <div className="font-bold text-slate-300 uppercase tracking-widest text-[10px]">
              WORKSHOP ONBOARDING
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li><Link href="/register" className="hover:text-[var(--accent)] transition-colors">· Register New Workshop</Link></li>
              <li><Link href="/login" className="hover:text-[var(--accent)] transition-colors">· Existing Terminal Login</Link></li>
              <li><Link href="#pricing" className="hover:text-[var(--accent)] transition-colors">· Workshop Subscription Tiers</Link></li>
              <li><Link href="#status-system" className="hover:text-[var(--accent)] transition-colors">· Status Telemetry Guide</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <div className="font-bold text-slate-300 uppercase tracking-widest text-[10px]">
              OPERATIONAL HUBS
            </div>
            <ul className="space-y-1 text-slate-400 text-[11px]">
              <li>· Karachi: PECHS Block 6 & DHA Phase 6</li>
              <li>· Lahore: Gulberg III & Cavalry Ground</li>
              <li>· Islamabad: I-9 Industrial & Blue Area</li>
              <li>· Rawalpindi: Saddar Auto Market</li>
            </ul>
          </div>
        </div>

        {/* Bottom Folio & Copyright */}
        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-500" style={{ borderColor: "var(--divider)" }}>
          <div>
            © 2026 GEARIFY REMASTERED. ALL RIGHTS RESERVED. REGISTERED IN PAKISTAN.
          </div>

          <button
            onClick={scrollToTop}
            className="btn-ghost px-4 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
          >
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
}
