"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, Zap, Shield, Crown } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  badge?: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  popular?: boolean;
  accent: string;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter Garage",
    price: "PKR 0",
    period: "Free Forever",
    description: "Essential terminal tools for independent mechanic shops and single-bay garages.",
    features: [
      "Single-bay workshop terminal",
      "43+ pre-seeded Pakistan parts catalog",
      "Unlimited digital & thermal receipt generation",
      "Public QR vehicle passports",
      "Standard vehicle health index calculations",
    ],
    ctaLabel: "Deploy Free Terminal",
    ctaHref: "/register",
    accent: "#38bdf8",
  },
  {
    id: "pro",
    name: "Multi-Bay Pro",
    badge: "MOST POPULAR",
    price: "PKR 4,500",
    period: "per month / billed annually",
    description: "Advanced telemetry and financial margin governance for high-volume service centers.",
    features: [
      "Unlimited technician & advisor accounts",
      "Dynamic single-item SKU price updating",
      "Recharts revenue curves & mechanic performance analytics",
      "Predictive emergency health degradation flags",
      "Before & after photographic evidence uploads",
      "Admin security key governance",
    ],
    ctaLabel: "Start 14-Day Free Trial",
    ctaHref: "/register",
    popular: true,
    accent: "#fbbf24",
  },
  {
    id: "enterprise",
    name: "Fleet Enterprise",
    price: "Custom",
    period: "tailored multi-location SLA",
    description: "Enterprise network management for dealership networks and nationwide fleet operators.",
    features: [
      "Multi-branch sync across Karachi, Lahore & Islamabad",
      "Custom ERP & accounting integration webhooks",
      "Dedicated database connection pooling",
      "Custom PDF branding & bespoke receipt templates",
      "24/7 SLA & dedicated workshop onboarding engineer",
    ],
    ctaLabel: "Contact Enterprise Team",
    ctaHref: "/register",
    accent: "#c084fc",
  },
];

export default function PricingPlans() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="pricing"
      data-trail-color="amber"
      className="py-24 px-4 sm:px-6 lg:px-12 border-b overflow-hidden"
      style={{
        borderColor: "var(--divider-strong)",
        backgroundColor: "var(--bg-main)",
      }}
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="border-b pb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4" style={{ borderColor: "var(--divider)" }}>
          <div>
            <span className="px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border" style={{ borderColor: "var(--card-border)", color: "var(--status-warning)", backgroundColor: "var(--status-warning-bg)" }}>
              COMMERCIAL TIERS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-4" style={{ color: "var(--text-primary)" }}>
              Transparent Workshop Pricing
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            SIMPLE MONTHLY BILLING · ZERO SURPRISES
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan, idx) => {
            return (
              <motion.div
                key={plan.id}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ type: "spring", stiffness: 280, damping: 24, delay: idx * 0.08 }}
                className={`p-8 rounded-3xl border flex flex-col justify-between space-y-8 relative shadow-xl transition-all duration-300 ${
                  plan.popular ? "ring-2 ring-[var(--accent)]" : ""
                }`}
                style={{
                  backgroundColor: "var(--card-bg-solid)",
                  borderColor: plan.popular ? "var(--accent)" : "var(--card-border)",
                  boxShadow: plan.popular ? "0 20px 40px -10px rgba(56, 189, 248, 0.2)" : "var(--card-shadow)",
                }}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-[var(--accent)] text-slate-950 shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                      {plan.name}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="pt-4 border-t" style={{ borderColor: "var(--divider)" }}>
                    <div className="text-3xl sm:text-4xl font-black font-mono" style={{ color: "var(--text-primary)" }}>
                      {plan.price}
                    </div>
                    <span className="text-xs font-mono text-slate-500">{plan.period}</span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 pt-2">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={plan.ctaHref}
                  className={`w-full py-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-center transition-all ${
                    plan.popular ? "btn-accent shadow-lg" : "btn-ghost"
                  }`}
                >
                  {plan.ctaLabel}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
