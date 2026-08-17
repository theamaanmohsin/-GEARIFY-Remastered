"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Shield,
  FileText,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface CachedUser {
  id: number;
  name: string;
  email: string;
  role: "mechanic" | "admin";
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<CachedUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  // Read cached user from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("gearify_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        /* ignore invalid JSON */
      }
    }

    // Listen for storage changes (login/logout from other tabs)
    const handleStorage = () => {
      const updated = localStorage.getItem("gearify_user");
      setUser(updated ? JSON.parse(updated) : null);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* best-effort */
    }
    localStorage.removeItem("gearify_user");
    setUser(null);
    setMobileOpen(false);
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/services/new", label: "New Service", icon: PlusCircle, show: !!user },
    { href: "/services/history", label: "History", icon: FileText, show: true },
    { href: "/admin", label: "Admin", icon: Shield, show: user?.role === "admin" },
  ];

  const visibleLinks = navLinks.filter((l) => l.show);

  return (
    <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="glass-panel rounded-2xl px-6 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Wrench className="w-5 h-5 text-white logo-wrench-icon" style={{ color: "#FFFFFF", stroke: "#FFFFFF" }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-xl tracking-tight gradient-text">
                GEARIFY
              </span>
              <span
                className="text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded-md border"
                style={{
                  borderColor: "var(--card-border)",
                  color: "var(--accent)",
                  backgroundColor: "var(--accent-muted)",
                }}
              >
                REMASTERED
              </span>
            </div>
            <p className="text-[10px] font-semibold tracking-wide" style={{ color: "var(--text-muted)" }}>
              Automotive Performance Management System
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-muted)";
                  (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* User badge (desktop only) */}
          {user && (
            <div
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border"
              style={{ borderColor: "var(--card-border)", backgroundColor: "var(--accent-muted)" }}
            >
              <UserIcon className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
              <span className="text-xs font-semibold max-w-[120px] truncate" style={{ color: "var(--text-secondary)" }}>
                {user.name}
              </span>
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border"
                style={{
                  borderColor: "var(--accent-light)",
                  color: "var(--accent)",
                  backgroundColor: "var(--accent-muted)",
                }}
              >
                {user.role}
              </span>
            </div>
          )}

          <ThemeToggle />

          {/* Desktop: Contextual CTA */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <motion.div whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.96 }}>
                <Link
                  href="/services/new"
                  className="btn-accent flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Service
                </Link>
              </motion.div>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl transition-colors"
                title="Sign Out"
                style={{ backgroundColor: "var(--status-danger-bg)", color: "var(--status-danger)" }}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <motion.div whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.96 }} className="hidden sm:block">
              <Link
                href="/login"
                className="btn-accent flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold"
              >
                Sign In
              </Link>
            </motion.div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl transition-colors"
            aria-label="Toggle mobile menu"
            style={{ backgroundColor: "var(--accent-muted)", color: "var(--text-secondary)" }}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, height: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, height: "auto" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, height: 0 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
            className="md:hidden overflow-hidden mt-2"
          >
            <div className="glass-panel rounded-2xl p-4 space-y-1 shadow-xl">
              {/* User info on mobile */}
              {user && (
                <div
                  className="flex items-center gap-2 px-3 py-2.5 mb-2 rounded-xl border"
                  style={{ borderColor: "var(--card-border)", backgroundColor: "var(--accent-muted)" }}
                >
                  <UserIcon className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                    {user.name}
                  </span>
                  <span
                    className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border"
                    style={{
                      borderColor: "var(--accent-light)",
                      color: "var(--accent)",
                      backgroundColor: "var(--accent-muted)",
                    }}
                  >
                    {user.role}
                  </span>
                </div>
              )}

              {visibleLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "var(--accent)" }} />
                    {link.label}
                  </Link>
                );
              })}

              <div className="border-t pt-2 mt-2" style={{ borderColor: "var(--divider)" }}>
                {user ? (
                  <>
                    <Link
                      href="/services/new"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors"
                      style={{ color: "var(--accent)" }}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add New Service
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left"
                      style={{ color: "var(--status-danger)" }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    style={{ color: "var(--accent)" }}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
