"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../providers/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      className="neu-button relative flex items-center justify-center w-11 h-11 rounded-full text-amber-500 dark:text-indigo-400 focus:outline-none"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      <svg
        className="w-5 h-5 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          animate={{
            d: isDark
              ? "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" // Moon path
              : "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z", // Sun path
            rotate: isDark ? 0 : 180,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          stroke="currentColor"
          strokeWidth={isDark ? "0" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
}
