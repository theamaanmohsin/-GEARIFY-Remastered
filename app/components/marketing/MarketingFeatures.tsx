"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  Gauge,
  Car,
  Bike,
  ShieldCheck,
  QrCode,
  DollarSign,
  Users,
  Layers,
  CheckCircle,
  TrendingUp,
  Activity,
  Zap,
  Lock,
} from "lucide-react";

interface FeatureSpread {
  id: string;
  trailColor: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  metric: { value: string; label: string };
  illustrationType: "gauge" | "dualFleet" | "pricing" | "qr" | "rbac";
}

const FEATURE_SPREADS: FeatureSpread[] = [
  {
    id: "feature-telemetry",
    trailColor: "emerald",
    tag: "CAPABILITY 01 / HEALTH ENGINE",
    title: "Precision Service Telemetry & 100-Point Degradation Algorithm",
    subtitle: "Real-time mathematical vehicle health scoring based on elapsed odometer mileage, operating duration, and technician inspections.",
    description:
      "Legacy shops rely on sticker notes or unverified memory. Gearify continuously calculates a dynamic 0–100 health index for every vehicle. As maintenance intervals elapse, the platform highlights the status in amber; when critical, it triggers urgent emergency flags.",
    bullets: [
      "Dynamic 0–100 health index recomputed on every logged odometer milestone",
      "Automatic 15,000 KM passenger car and 3,000 KM motorcycle lube interval targets",
      "Instant color-coded status badges for shop floor prioritization",
      "Zero guesswork for service advisors during customer intake",
    ],
    metric: { value: "98.4%", label: "Breakdown prevention rate across monitored fleets" },
    illustrationType: "gauge",
  },
  {
    id: "feature-dual-fleet",
    trailColor: "charcoal",
    tag: "CAPABILITY 02 / FLEET ARCHITECTURE",
    title: "Unified Motorcycle & Passenger Automotive Support",
    subtitle: "Engineered specifically for mixed mobility: 70cc–150cc motorcycles, passenger sedans, and light commercial vehicles in one terminal.",
    description:
      "High-heat urban stop-and-go motorcycle engines require frequent 3,000 KM oil changes, while modern Japanese and European car engines run on 15,000 KM synthetic regimes. Gearify intelligently segregates parts, intervals, and inspection checklists per chassis category.",
    bullets: [
      "One-click chassis switching: Car, Light Commercial (LCV), and Motorcycle",
      "Automatic catalog filtering: Prevents accidental car lubricant assignment to bikes",
      "Specialized motorcycle consumables: Spark plugs, chain lubricants, and brake pads",
      "Unified workshop view regardless of vehicle type",
    ],
    metric: { value: "12,000 KM", label: "Predictive variance automatically managed per chassis" },
    illustrationType: "dualFleet",
  },
  {
    id: "feature-parts",
    trailColor: "amber",
    tag: "CAPABILITY 03 / PARTS GOVERNANCE",
    title: "Item-Level Parts Catalog & Dynamic Margin Governance",
    subtitle: "Standardized catalog management with real-time single-item price updating without breaking historical invoice records.",
    description:
      "Rapid market price shifts can create severe margin leakage. Gearify gives workshop owners granular control over catalog unit pricing, brand categories, and vehicle scopes with zero calculation overhead for mechanics.",
    bullets: [
      "Granular unit price updating for oils, air filters, oil filters, and consumables",
      "Historical invoices remain permanently price-locked for accounting integrity",
      "Support for multi-currency operations with configurable workshop defaults",
      "Custom shop SKU addition in seconds with vehicle scope tagging",
    ],
    metric: { value: "100%", label: "Price accuracy on digital invoices with zero dispute rate" },
    illustrationType: "pricing",
  },
  {
    id: "feature-qr",
    trailColor: "emerald",
    tag: "CAPABILITY 04 / VERIFICATION",
    title: "Verifiable QR Passports & Thermal Receipt Engine",
    subtitle: "Tamper-evident digital vehicle passports accessible via dynamic QR codes on printable workshop receipts.",
    description:
      "Provide vehicle owners and prospective buyers with an unalterable service record. Every generated receipt carries a unique QR code pointing to a public, read-only vehicle passport detailing certified maintenance history and part replacements.",
    bullets: [
      "Instant QR generation linking directly to the vehicle's public passport",
      "Zero-auth public verification: Buyers and owners inspect logs on any mobile device",
      "CSS paged media engine for standard A4 and 80mm thermal receipt printing",
      "Before and after photographic evidence attachment support",
    ],
    metric: { value: "0 Auth Required", label: "For customers to verify past workshop records" },
    illustrationType: "qr",
  },
  {
    id: "feature-rbac",
    trailColor: "charcoal",
    tag: "CAPABILITY 05 / ACCESS CONTROL",
    title: "Multi-Tier Role Control & Workshop Command Hub",
    subtitle: "Strict separation of concerns between shop floor mechanics, managers, and executive auditors.",
    description:
      "Floor mechanics need speed: fast plate lookup, part toggling, and receipt generation. Workshop managers need financial oversight: revenue trends, inventory velocity, and security key settings. Gearify protects each level with role-based JWT claims.",
    bullets: [
      "Mechanic Terminal: Fast vehicle registration, service entry, and receipt printing",
      "Manager Console: Item price edits, user administration, and security key settings",
      "Executive Analytics: Live Recharts monthly revenue curves and technician volume",
      "HTTP-only cookie security tokens protecting sensitive workshop endpoints",
    ],
    metric: { value: "3 Roles", label: "Floor Mechanic, Workshop Manager, and Public Verifier" },
    illustrationType: "rbac",
  },
];

/* ── Crisp, High-Contrast Interactive Vector / UI Constructs (Zero Overlap / Zero Distortion) ── */
function VectorConstruct({ type }: { type: FeatureSpread["illustrationType"] }) {
  const reduceMotion = useReducedMotion();

  if (type === "gauge") {
    return (
      <div className="w-full aspect-square max-w-sm mx-auto flex flex-col items-center justify-center p-6 select-none relative">
        {/* Glow backdrop */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* Circular Gauge Dial */}
        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r="78"
              fill="none"
              stroke="var(--divider-strong)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Glowing Sweep Arc */}
            <motion.circle
              cx="100"
              cy="100"
              r="78"
              fill="none"
              stroke="#10b981"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="490"
              initial={reduceMotion ? { strokeDashoffset: 50 } : { strokeDashoffset: 490 }}
              whileInView={{ strokeDashoffset: 49 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />
          </svg>

          {/* Center Clean Typography Readout (No Line Overlap) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-emerald-400">
              OPTIMAL
            </span>
            <div className="text-4xl font-black font-mono tracking-tight text-emerald-400 drop-shadow-sm">
              92.0
            </div>
            <span className="text-[9px] font-mono uppercase font-semibold text-slate-400 tracking-wider">
              HEALTH SCORE
            </span>
          </div>
        </div>

        {/* Bottom Telemetry Ticker Strip */}
        <div className="w-full mt-4 grid grid-cols-2 gap-2 text-center font-mono text-[10px]">
          <div className="p-2 rounded-lg border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
            <span className="text-slate-400 block">LUBRICANT DECAY</span>
            <span className="font-bold text-emerald-400">96% CLEAN</span>
          </div>
          <div className="p-2 rounded-lg border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
            <span style={{ color: "var(--text-muted)" }} className="block">ODOMETER INTERVAL</span>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>12.4K KM LEFT</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "dualFleet") {
    return (
      <div className="w-full aspect-square max-w-sm mx-auto flex flex-col justify-between p-4 select-none space-y-4">
        {/* Sedan Spec Card */}
        <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
              <span className="font-bold text-xs font-mono" style={{ color: "var(--text-primary)" }}>PASSENGER CAR REGIME</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold" style={{ backgroundColor: "var(--accent-muted)", color: "var(--text-secondary)", border: "1px solid var(--card-border)" }}>
              15,000 KM
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Synthetic 5W-30 / 0W-20</span>
            <span className="text-slate-500">Full Filter Set</span>
          </div>
        </div>

        {/* Motorcycle Spec Card */}
        <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bike className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
              <span className="font-bold text-xs font-mono" style={{ color: "var(--text-primary)" }}>MOTORCYCLE REGIME</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold" style={{ backgroundColor: "var(--accent-muted)", color: "var(--text-secondary)", border: "1px solid var(--card-border)" }}>
              3,000 KM
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Mineral 4T 20W-50</span>
            <span className="text-slate-500">Spark & Chain Clean</span>
          </div>
        </div>

        {/* Fleet Variance Badge */}
        <div className="p-3 rounded-xl border text-center font-mono text-[10px]" style={{ backgroundColor: "var(--card-bg-solid)", borderColor: "var(--card-border)" }}>
          <span className="text-slate-400">AUTOMATIC CHASSIS ISOLATION · </span>
          <span className="font-bold text-emerald-400">ZERO PART MISMATCH</span>
        </div>
      </div>
    );
  }

  if (type === "pricing") {
    return (
      <div className="w-full aspect-square max-w-sm mx-auto flex flex-col justify-between p-5 select-none space-y-3">
        {/* Header Strip */}
        <div className="flex items-center justify-between pb-2 border-b text-[10px] font-mono" style={{ borderColor: "var(--divider)" }}>
          <span className="font-bold text-slate-400 uppercase">PARTS CATALOG LEDGER</span>
          <span className="px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            PRICE LOCKED
          </span>
        </div>

        {/* Clean Responsive Rows with No Overlap */}
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl border flex items-center justify-between font-mono" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
            <div>
              <span className="block text-xs font-bold" style={{ color: "var(--text-primary)" }}>ENGINE OIL 5W-30 (4L)</span>
              <span className="text-[10px] text-slate-400">SKU #LUB-5W30-4L</span>
            </div>
            <span className="text-xs font-bold text-amber-400">PKR 11,500</span>
          </div>

          <div className="p-3 rounded-xl border flex items-center justify-between font-mono" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
            <div>
              <span className="block text-xs font-bold" style={{ color: "var(--text-primary)" }}>AIR FILTER ELEMENT</span>
              <span className="text-[10px] text-slate-400">SKU #FLT-AIR-01</span>
            </div>
            <span className="text-xs font-bold text-amber-400">PKR 1,850</span>
          </div>

          <div className="p-3 rounded-xl border flex items-center justify-between font-mono" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
            <div>
              <span className="block text-xs font-bold" style={{ color: "var(--text-primary)" }}>OIL FILTER HIGH-FLOW</span>
              <span className="text-[10px] text-slate-400">SKU #FLT-OIL-02</span>
            </div>
            <span className="text-xs font-bold text-amber-400">PKR 1,250</span>
          </div>
        </div>

        {/* Dynamic Margin Footer Bar */}
        <div className="p-3 rounded-xl border flex items-center justify-between font-mono text-[10px]" style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", borderColor: "rgba(251, 191, 36, 0.3)" }}>
          <span className="font-bold text-amber-400">DYNAMIC MARGIN CONTROL</span>
          <span className="font-black text-amber-300">+28.5% TARGET</span>
        </div>
      </div>
    );
  }

  if (type === "qr") {
    return (
      <div className="w-full aspect-square max-w-sm mx-auto flex flex-col justify-between p-5 select-none space-y-3">
        {/* Receipt Header */}
        <div className="p-4 rounded-2xl border space-y-3 relative overflow-hidden" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
          <div className="flex items-center justify-between border-b pb-2 text-[10px] font-mono" style={{ borderColor: "var(--divider)" }}>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>GEARIFY RECEIPT #0412</span>
            <span className="text-emerald-400 font-bold">VERIFIED AUTH</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Visual QR Code Box with Laser Scan */}
            <div className="w-20 h-20 bg-white rounded-xl p-2 relative flex items-center justify-center shadow-md flex-shrink-0">
              <QrCode className="w-full h-full text-slate-950" />
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <span className="block font-bold" style={{ color: "var(--text-primary)" }}>HONDA CIVIC 1.8</span>
              <span className="block text-slate-400">PLATE: APS-2342</span>
              <span className="block text-emerald-400 text-[10px] font-bold">PASSPORT ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Scan Status Prompt */}
        <div className="p-3 rounded-xl border text-center font-mono text-[10px]" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.3)" }}>
          <span className="text-slate-300">SCAN QR ON RECEIPT TO OPEN </span>
          <span className="font-bold text-emerald-400">PUBLIC SERVICE PASSPORT</span>
        </div>
      </div>
    );
  }

  // RBAC Shield
  return (
    <div className="w-full aspect-square max-w-sm mx-auto flex flex-col justify-between p-5 select-none space-y-3">
      {/* 3 Role Node Cards */}
      <div className="space-y-2.5">
        <div className="p-3 rounded-xl border flex items-center justify-between font-mono" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>ADMINISTRATOR</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: "var(--text-secondary)", backgroundColor: "var(--accent-muted)", border: "1px solid var(--card-border)" }}>
            FULL GOVERNANCE
          </span>
        </div>

        <div className="p-3 rounded-xl border flex items-center justify-between font-mono" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>WORKSHOP MECHANIC</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: "var(--text-secondary)", backgroundColor: "var(--accent-muted)", border: "1px solid var(--card-border)" }}>
            INTAKE & RECEIPTS
          </span>
        </div>

        <div className="p-3 rounded-xl border flex items-center justify-between font-mono" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>CUSTOMER & VERIFIER</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            READ-ONLY PASSPORT
          </span>
        </div>
      </div>

      {/* Security Token Status */}
      <div className="p-3 rounded-xl border text-center font-mono text-[10px]" style={{ backgroundColor: "var(--accent-muted)", borderColor: "var(--card-border)" }}>
        <span style={{ color: "var(--text-muted)" }}>HTTP-ONLY JWT TOKENS · </span>
        <span className="font-bold" style={{ color: "var(--text-primary)" }}>ZERO DATA LEAKAGE</span>
      </div>
    </div>
  );
}

export default function MarketingFeatures() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="features" className="space-y-0">
      {FEATURE_SPREADS.map((spread, index) => {
        const isReversed = index % 2 === 1;

        return (
          <div
            key={spread.id}
            id={spread.id}
            data-trail-color={spread.trailColor}
            className="min-h-[90vh] flex items-center justify-center py-24 px-4 sm:px-6 lg:px-12 border-b relative overflow-hidden"
            style={{
              borderColor: "var(--divider-strong)",
              backgroundColor: index % 2 === 0 ? "var(--bg-main)" : "var(--bg-surface)",
            }}
          >
            <div className="w-full max-w-7xl mx-auto">
              <div
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center ${
                  isReversed ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Text Content Column */}
                <motion.div
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: isReversed ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ type: "spring", stiffness: 280, damping: 25 }}
                  className={`space-y-6 ${isReversed ? "lg:col-span-7 lg:col-start-6" : "lg:col-span-7"}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border"
                      style={{
                        borderColor: "var(--card-border)",
                        backgroundColor: "var(--card-bg-solid)",
                        color: "var(--accent)",
                      }}
                    >
                      {spread.tag}
                    </span>
                  </div>

                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]" style={{ color: "var(--text-primary)" }}>
                    {spread.title}
                  </h3>

                  <p className="text-base sm:text-lg font-bold leading-relaxed" style={{ color: "var(--accent)" }}>
                    {spread.subtitle}
                  </p>

                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {spread.description}
                  </p>

                  {/* Bullet Highlights */}
                  <ul className="space-y-2.5 pt-2">
                    {spread.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Metric Bar */}
                  <div className="p-4 rounded-2xl border flex items-center justify-between font-mono text-xs mt-6" style={{ backgroundColor: "var(--card-bg-solid)", borderColor: "var(--card-border)" }}>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">SYSTEM PERFORMANCE</span>
                      <span className="font-black text-xl" style={{ color: "var(--text-primary)" }}>{spread.metric.value}</span>
                    </div>
                    <span className="text-xs text-right text-slate-400 max-w-xs">{spread.metric.label}</span>
                  </div>
                </motion.div>

                {/* Vector Construct Column */}
                <motion.div
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9, x: isReversed ? -30 : 30 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ type: "spring", stiffness: 280, damping: 25 }}
                  className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative ${
                    isReversed ? "lg:col-span-5 lg:col-start-1" : "lg:col-span-5"
                  }`}
                  style={{
                    backgroundColor: "var(--card-bg-solid)",
                    borderColor: "var(--card-border)",
                    boxShadow: "var(--card-shadow-lg)",
                  }}
                >
                  <VectorConstruct type={spread.illustrationType} />
                </motion.div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
