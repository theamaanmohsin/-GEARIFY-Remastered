"use client";

import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      onClick={toggleTheme}
      className="neu-button focus-ring relative flex items-center justify-center w-10 h-10 rounded-xl transition-all"
      style={{
        backgroundColor: isDark ? "rgba(15, 23, 42, 0.85)" : "#ffffff",
        borderColor: isDark ? "rgba(56, 189, 248, 0.3)" : "rgba(217, 119, 6, 0.3)",
        boxShadow: isDark
          ? "0 0 14px rgba(56, 189, 248, 0.2)"
          : "0 2px 8px rgba(217, 119, 6, 0.15)",
      }}
      whileHover={reduceMotion ? undefined : { scale: 1.08 }}
      whileTap={reduceMotion ? undefined : { scale: 0.92 }}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={reduceMotion ? { opacity: 1 } : { scale: 0.5, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { scale: 0.5, rotate: 90, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 350, damping: 20 }
            }
            className="flex items-center justify-center text-sky-400"
          >
            <Moon className="w-5 h-5 fill-sky-400/20 stroke-sky-400" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={reduceMotion ? { opacity: 1 } : { scale: 0.5, rotate: 90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { scale: 0.5, rotate: -90, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 350, damping: 20 }
            }
            className="flex items-center justify-center text-amber-500"
          >
            <Sun className="w-5 h-5 fill-amber-500/20 stroke-amber-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
