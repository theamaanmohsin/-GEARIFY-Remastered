"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Wrench, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "#features", label: "Capabilities" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#status-system", label: "Status System" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Reviews" },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={reduceMotion ? { opacity: 1 } : { y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3"
    >
      <motion.div
        className="mx-auto max-w-7xl rounded-2xl px-5 py-3 transition-all duration-300"
        animate={{
          backgroundColor: scrolled ? "var(--card-bg)" : "rgba(0,0,0,0)",
          boxShadow: scrolled ? "var(--card-shadow-lg)" : "0 0 0 rgba(0,0,0,0)",
          borderColor: scrolled ? "var(--card-border)" : "rgba(0,0,0,0)",
        }}
        style={{
          borderWidth: 1,
          borderStyle: "solid",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: "var(--accent)" }}>
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight gradient-text">GEARIFY</span>
              <span className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded-md border hidden sm:inline-block" style={{ borderColor: "var(--card-border)", color: "var(--accent)", backgroundColor: "var(--accent-muted)" }}>
                REMASTERED
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent)";
                  e.currentTarget.style.backgroundColor = "var(--accent-muted)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.backgroundColor = "var(--accent-muted)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Sign In
            </Link>

            <motion.div whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }} className="hidden sm:block">
              <Link
                href="/register"
                className="btn-accent text-xs sm:text-sm px-5 py-2.5 rounded-xl"
              >
                Get Started
              </Link>
            </motion.div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2.5 rounded-xl transition-colors"
              style={{ backgroundColor: "var(--accent-muted)", color: "var(--text-secondary)" }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
            className="lg:hidden overflow-hidden mt-3"
          >
            <div className="space-y-1 pb-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t" style={{ borderColor: "var(--divider)" }}>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-accent w-full justify-center py-2.5 rounded-xl text-sm font-bold"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.header>
  );
}