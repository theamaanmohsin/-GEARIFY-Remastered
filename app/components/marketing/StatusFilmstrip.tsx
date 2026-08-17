"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, AlertTriangle, AlertCircle, Sparkles, Disc, Film } from "lucide-react";

interface StatusFrame {
  id: string;
  name: string;
  code: string;
  scoreRange: string;
  color: string;
  borderColor: string;
  bgGlow: string;
  statusIcon: React.ElementType;
  badgeLabel: string;
  meaning: string;
  systemAction: string;
  simulatedDisplay: {
    kmStatus: string;
    actionPrompt: string;
    lubricantLife: string;
  };
}

const STATUS_FRAMES: StatusFrame[] = [
  {
    id: "optimal",
    name: "Optimal Health",
    code: "EMERALD #10b981",
    scoreRange: "85 — 100 PTS",
    color: "#10b981",
    borderColor: "rgba(16, 185, 129, 0.4)",
    bgGlow: "rgba(16, 185, 129, 0.15)",
    statusIcon: ShieldCheck,
    badgeLabel: "STATUS: OPTIMAL",
    meaning: "All engine lubricants, filtration media, and consumables operating well within factory tolerances.",
    systemAction: "Normal operations. QR passport renders verified green badge. Next service countdown active.",
    simulatedDisplay: {
      kmStatus: "12,400 KM Remaining until next service",
      actionPrompt: "No immediate workshop visit required",
      lubricantLife: "94% Viscosity & Thermal Stability",
    },
  },
  {
    id: "warning",
    name: "Service Due Soon",
    code: "AMBER #fbbf24",
    scoreRange: "50 — 84 PTS",
    color: "#fbbf24",
    borderColor: "rgba(251, 191, 36, 0.4)",
    bgGlow: "rgba(251, 191, 36, 0.15)",
    statusIcon: AlertTriangle,
    badgeLabel: "STATUS: WARNING",
    meaning: "Odometer mileage within 1,000 KM of expiration or filter particulate saturation threshold reached.",
    systemAction: "Automated booking alert flagged on terminal. Customer notified via digital passport portal.",
    simulatedDisplay: {
      kmStatus: "650 KM Remaining (Schedule Inspection)",
      actionPrompt: "Recommended lube & oil filter swap this week",
      lubricantLife: "58% Remaining Filter Particulate Capacity",
    },
  },
  {
    id: "emergency",
    name: "Critical Overdue",
    code: "ROSE #f43f5e",
    scoreRange: "< 50 PTS",
    color: "#f43f5e",
    borderColor: "rgba(244, 63, 94, 0.4)",
    bgGlow: "rgba(244, 63, 94, 0.15)",
    statusIcon: AlertCircle,
    badgeLabel: "STATUS: EMERGENCY",
    meaning: "Operating interval exceeded. Significant risk of cylinder friction wear and valve carbonization.",
    systemAction: "Emergency danger highlight across all workshop monitors. Immediate service entry recommended.",
    simulatedDisplay: {
      kmStatus: "-1,850 KM Overdue (Service Expired)",
      actionPrompt: "Urgent engine flush & full filter replacement",
      lubricantLife: "12% Viscosity Breakdown Risk",
    },
  },
];

export default function StatusFilmstrip() {
  const reduceMotion = useReducedMotion();
  const [selectedFrame, setSelectedFrame] = useState<StatusFrame>(STATUS_FRAMES[0]);

  const StatusIcon = selectedFrame.statusIcon;

  return (
    <section
      id="status-system"
      data-trail-color="emerald"
      className="py-24 px-4 sm:px-6 lg:px-12 border-b overflow-hidden"
      style={{
        borderColor: "var(--divider-strong)",
        backgroundColor: "var(--bg-surface)",
      }}
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="border-b pb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4" style={{ borderColor: "var(--divider)" }}>
          <div>
            <span className="px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border" style={{ borderColor: "var(--card-border)", color: "var(--status-good)", backgroundColor: "var(--status-good-bg)" }}>
              TELEMETRY LOGIC
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-4" style={{ color: "var(--text-primary)" }}>
              Status Intelligence In Action
            </h2>
          </div>
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--accent)" }}>
            35MM FILMSTRIP SCRUBBER · COLOR TELEMETRY MEANINGS
          </div>
        </div>

        {/* 35mm Filmstrip Component */}
        <div
          className="rounded-3xl border shadow-2xl relative overflow-hidden p-6 sm:p-10"
          style={{
            backgroundColor: "var(--card-bg-solid)",
            borderColor: "var(--card-border)",
          }}
        >
          {/* Top Filmstrip Sprockets */}
          <div className="h-6 w-full filmstrip-sprockets opacity-40 mb-6" />

          {/* Scannable Frames */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
            {STATUS_FRAMES.map((frame, idx) => {
              const isSelected = selectedFrame.id === frame.id;
              const Icon = frame.statusIcon;

              return (
                <motion.div
                  key={frame.id}
                  onClick={() => setSelectedFrame(frame)}
                  whileHover={reduceMotion ? undefined : { y: -4, scale: 1.02 }}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 relative space-y-4 ${
                    isSelected ? "ring-2" : "hover:border-[var(--card-border-hover)]"
                  }`}
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: isSelected ? frame.color : "var(--card-border)",
                    boxShadow: isSelected ? `0 0 28px ${frame.bgGlow}` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold" style={{ color: "var(--text-secondary)" }}>FRAME 0{idx + 1}</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: `${frame.color}20`, color: frame.color }}
                    >
                      {frame.scoreRange}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                      style={{ backgroundColor: `${frame.color}25`, color: frame.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base tracking-tight" style={{ color: "var(--text-primary)" }}>
                        {frame.name}
                      </h4>
                      <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{frame.code}</span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {frame.meaning}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Filmstrip Sprockets */}
          <div className="h-6 w-full filmstrip-sprockets opacity-40 mt-6" />
        </div>

        {/* Selected Frame Action Matrix Preview */}
        <motion.div
          key={selectedFrame.id}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-8 rounded-3xl border space-y-6"
          style={{
            backgroundColor: "var(--card-bg-solid)",
            borderColor: selectedFrame.borderColor,
            boxShadow: `0 0 30px ${selectedFrame.bgGlow}`,
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--divider)" }}>
            <div className="flex items-center gap-3">
              <StatusIcon className="w-6 h-6" style={{ color: selectedFrame.color }} />
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest" style={{ color: "var(--text-muted)" }}>
                  IN-APP TELEMETRY ACTION PROTOCOL
                </span>
                <h3 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
                  {selectedFrame.badgeLabel}
                </h3>
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-3 py-1 rounded-full border" style={{ color: selectedFrame.color, borderColor: selectedFrame.borderColor }}>
              {selectedFrame.scoreRange}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
              <span className="text-[10px] uppercase block font-semibold" style={{ color: "var(--text-muted)" }}>ODOMETER THRESHOLD</span>
              <span className="font-bold text-sm" style={{ color: selectedFrame.color }}>
                {selectedFrame.simulatedDisplay.kmStatus}
              </span>
            </div>
            <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
              <span className="text-[10px] uppercase block font-semibold" style={{ color: "var(--text-muted)" }}>WORKSHOP ACTION</span>
              <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                {selectedFrame.simulatedDisplay.actionPrompt}
              </span>
            </div>
            <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
              <span className="text-[10px] uppercase block font-semibold" style={{ color: "var(--text-muted)" }}>FLUID DEGRADATION</span>
              <span className="font-bold text-sm" style={{ color: "var(--text-secondary)" }}>
                {selectedFrame.simulatedDisplay.lubricantLife}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
