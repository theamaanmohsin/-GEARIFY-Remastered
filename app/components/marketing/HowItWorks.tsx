"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Car, Wrench, FileText, QrCode } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    step: "01",
    title: "Vehicle Intake & Odometer",
    desc: "Technician inputs the plate number, make, model, and current mileage on the terminal.",
    icon: Car,
    accent: "#38bdf8",
  },
  {
    step: "02",
    title: "Parts & Service Logging",
    desc: "Select replaced engine oil, filters, and consumables with pre-calibrated pricing.",
    icon: Wrench,
    accent: "#fbbf24",
  },
  {
    step: "03",
    title: "Print & Issue Receipt",
    desc: "Generate a pixel-perfect printed receipt with unique cryptographic QR passport link.",
    icon: FileText,
    accent: "#10b981",
  },
  {
    step: "04",
    title: "Continuous Health Telemetry",
    desc: "Automatic 100-point decay tracking alerts the shop and owner when the next service is due.",
    icon: QrCode,
    accent: "#c084fc",
  },
];

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="how-it-works"
      data-trail-color="cyan"
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
            <span className="px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border" style={{ borderColor: "var(--card-border)", color: "var(--accent)", backgroundColor: "var(--card-bg-solid)" }}>
              PROCESS ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-4" style={{ color: "var(--text-primary)" }}>
              How It Works
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            FOUR-STEP WORKSHOP OPERATING FLOW
          </div>
        </div>

        {/* 4-Step Flow Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;

            return (
              <motion.div
                key={s.step}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ type: "spring", stiffness: 280, damping: 24, delay: idx * 0.08 }}
                className="p-6 rounded-3xl border flex flex-col justify-between space-y-6 relative group overflow-hidden shadow-lg"
                style={{
                  backgroundColor: "var(--card-bg-solid)",
                  borderColor: "var(--card-border)",
                  boxShadow: "var(--card-shadow)",
                }}
              >
                {/* Big Step Number Watermark */}
                <span className="font-mono font-black text-5xl absolute top-4 right-4 opacity-10" style={{ color: s.accent }}>
                  {s.step}
                </span>

                <div className="space-y-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                    style={{ backgroundColor: `${s.accent}18`, color: s.accent }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500">STAGE {s.step}</span>
                    <h3 className="font-extrabold text-base tracking-tight" style={{ color: "var(--text-primary)" }}>
                      {s.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {s.desc}
                  </p>
                </div>

                <div className="pt-4 border-t text-[10px] font-mono uppercase text-slate-500" style={{ borderColor: "var(--divider)" }}>
                  ZERO CALCULATION OVERHEAD
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
