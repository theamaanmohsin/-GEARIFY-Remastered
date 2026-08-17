"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeMode } from "../types";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check initial preference from cookie or system preference
    const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
    const savedTheme = document.cookie
      .split("; ")
      .find((row) => row.startsWith("gearify_theme="))
      ?.split("=")[1] as ThemeMode | undefined;

    const initialTheme: ThemeMode = savedTheme || (matchMedia.matches ? "dark" : "light");
    setThemeState(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setMounted(true);
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    document.documentElement.setAttribute("data-theme", mode);
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.cookie = `gearify_theme=${mode}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Prevent flash of incorrect theme during hydration
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return safe defaults during SSR/prerender (ThemeProvider hasn't mounted)
    return {
      theme: "dark" as ThemeMode,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}
