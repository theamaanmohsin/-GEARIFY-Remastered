"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function LoadingSkeleton() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((key, index) => (
        <motion.div
          key={key}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 300,
                  damping: 28,
                  delay: index * 0.05,
                }
          }
          className="glass-panel relative overflow-hidden rounded-2xl p-5"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="absolute inset-0 animate-shimmer" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: "var(--bg-surface)" }} />
              <div className="space-y-1.5">
                <div className="w-24 h-4 rounded" style={{ backgroundColor: "var(--bg-surface)" }} />
                <div className="w-16 h-3 rounded" style={{ backgroundColor: "var(--bg-surface)" }} />
              </div>
            </div>
            <div className="w-20 h-6 rounded-full" style={{ backgroundColor: "var(--bg-surface)" }} />
          </div>

          <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-surface)" }}>
            <div className="w-full h-8 rounded" style={{ backgroundColor: "var(--card-bg)" }} />
            <div className="w-full h-8 rounded" style={{ backgroundColor: "var(--card-bg)" }} />
          </div>

          <div className="space-y-2 mt-4">
            <div className="w-full h-2 rounded-full" style={{ backgroundColor: "var(--bg-surface)" }} />
            <div className="flex justify-between">
              <div className="w-28 h-3 rounded" style={{ backgroundColor: "var(--bg-surface)" }} />
              <div className="w-12 h-3 rounded" style={{ backgroundColor: "var(--bg-surface)" }} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}