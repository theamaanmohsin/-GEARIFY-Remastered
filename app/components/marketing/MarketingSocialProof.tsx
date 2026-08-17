"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Users, Star, Quote, Shield } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  workshop: string;
  city: string;
  metricHighlight: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Tracking mixed fleets used to mean keeping two different notebooks. With Gearify, our technicians log 70cc bikes and 2022 Honda Civics into the same terminal in under 45 seconds.",
    author: "Hamid Raza",
    role: "Head Technician",
    workshop: "Precision Auto Care",
    city: "Gulberg III, Lahore",
    metricHighlight: "45s Service Intake Time",
  },
  {
    quote:
      "The QR passport feature completely transformed customer pickup. Car owners scan the receipt on their phone, see their oil change timeline, and trust our maintenance advice without hesitation.",
    author: "Amaan Mohsin",
    role: "Operations Director",
    workshop: "Apex Fleet Hub",
    city: "PECHS Block 6, Karachi",
    metricHighlight: "100% Billing Trust Score",
  },
  {
    quote:
      "We adjusted parts prices in the Admin Console when lubricant distributor rates shifted. Our historical receipts remained 100% locked, and our month-end reconciliation took 20 minutes.",
    author: "Ali Hassan",
    role: "Workshop Owner",
    workshop: "Capital Motor Works",
    city: "I-9 Industrial Area, Islamabad",
    metricHighlight: "Zero Reconciliation Errors",
  },
];

export default function MarketingSocialProof() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="testimonials"
      data-trail-color="charcoal"
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
            <span className="px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border" style={{ borderColor: "var(--card-border)", color: "var(--accent)", backgroundColor: "var(--card-bg-solid)" }}>
              FIELD OBSERVATIONS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-4" style={{ color: "var(--text-primary)" }}>
              Trusted on the Workshop Floor
            </h2>
          </div>
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--accent)" }}>
            OPERATOR CASE STUDIES · INDEPENDENT FEEDBACK
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.author}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 280, damping: 24, delay: idx * 0.08 }}
              className="p-8 rounded-3xl border flex flex-col justify-between space-y-6 shadow-lg relative"
              style={{
                backgroundColor: "var(--card-bg-solid)",
                borderColor: "var(--card-border)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--accent)] font-bold">{t.city}</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {t.metricHighlight}
                  </span>
                </div>

                <p className="text-sm leading-relaxed italic" style={{ color: "var(--text-secondary)" }}>
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t space-y-0.5" style={{ borderColor: "var(--divider)" }}>
                <h4 className="font-extrabold text-sm" style={{ color: "var(--text-primary)" }}>
                  {t.author}
                </h4>
                <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {t.role} · {t.workshop}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
