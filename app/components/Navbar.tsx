"use client";

import React from "react";
import Link from "next/link";
import { Wrench, Shield, FileText, PlusCircle, LayoutDashboard } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";

export default function Navbar() {
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

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-500" />
            Dashboard
          </Link>
          <Link
            href="/services/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-emerald-500" />
            New Service
          </Link>
          <Link
            href="/services/history"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
          >
            <FileText className="w-4 h-4 text-amber-500" />
            History
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
          >
            <Shield className="w-4 h-4 text-purple-500" />
            Admin
          </Link>
        </nav>

        {/* Right Section: Neumorphic Theme Toggle & Action */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/services/new"
              className="neu-button hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider"
            >
              <PlusCircle className="w-4 h-4 text-indigo-500" />
              Add Service
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
