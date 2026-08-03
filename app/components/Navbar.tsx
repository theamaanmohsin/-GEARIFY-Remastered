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
import { motion, AnimatePresence } from "framer-motion";

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
    { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-indigo-500", show: true },
    { href: "/services/new", label: "New Service", icon: PlusCircle, color: "text-emerald-500", show: !!user },
    { href: "/services/history", label: "History", icon: FileText, color: "text-amber-500", show: true },
    { href: "/admin", label: "Admin", icon: Shield, color: "text-purple-500", show: user?.role === "admin" },
  ];

  const visibleLinks = navLinks.filter((l) => l.show);

  return (
    <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="glass-panel rounded-2xl px-6 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                GEARIFY
              </span>
              <span className="text-[10px] font-semibold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/20 dark:text-indigo-300 border border-indigo-500/20">
                v2
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide">
              Automotive Performance Management
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
              >
                <Icon className={`w-4 h-4 ${link.color}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: User Info + Theme Toggle + Actions */}
        <div className="flex items-center gap-3">
          {/* User badge (desktop only) */}
          {user && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-500/5 border border-gray-200/50 dark:border-white/10">
              <UserIcon className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                {user.name}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                  user.role === "admin"
                    ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                    : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                }`}
              >
                {user.role}
              </span>
            </div>
          )}

          <ThemeToggle />

          {/* Desktop: Contextual CTA */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/services/new"
                  className="neu-button flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider"
                >
                  <PlusCircle className="w-4 h-4 text-indigo-500" />
                  Add Service
                </Link>
              </motion.div>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="hidden sm:block">
              <Link
                href="/login"
                className="neu-button flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider"
              >
                Sign In
              </Link>
            </motion.div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl bg-gray-500/10 text-gray-600 dark:text-gray-300 hover:bg-gray-500/20 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden mt-2"
          >
            <div className="glass-panel rounded-2xl p-4 space-y-1 shadow-xl">
              {/* User info on mobile */}
              {user && (
                <div className="flex items-center gap-2 px-3 py-2.5 mb-2 rounded-xl bg-gray-500/5 border border-gray-200/40 dark:border-white/10">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {user.name}
                  </span>
                  <span
                    className={`ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                      user.role === "admin"
                        ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                        : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                    }`}
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
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                  >
                    <Icon className={`w-4 h-4 ${link.color}`} />
                    {link.label}
                  </Link>
                );
              })}

              <div className="border-t border-gray-200/50 dark:border-white/10 pt-2 mt-2">
                {user ? (
                  <>
                    <Link
                      href="/services/new"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add New Service
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
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
