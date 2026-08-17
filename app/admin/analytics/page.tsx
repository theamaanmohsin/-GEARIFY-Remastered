"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, DollarSign, Wrench, BarChart2, Users, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface AnalyticsData {
  revenue_trend: { month: string; year: number; revenue: number; services: number }[];
  top_parts: { name: string; count: number; revenue: number }[];
  mechanic_stats: { name: string; services: number; revenue: number }[];
  summary: {
    total_revenue: number;
    total_services: number;
    total_vehicles: number;
    avg_per_service: number;
    most_replaced: { name: string; count: number; revenue: number } | null;
    currency: string;
  };
}

export default function AnalyticsPage() {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || `HTTP ${res.status}`);
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error("Analytics fetch error:", err);
        setError(err.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded animate-shimmer" style={{ backgroundColor: "var(--bg-surface)" }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="glass-panel relative overflow-hidden rounded-xl p-5 space-y-2"
              style={{ borderColor: "var(--card-border)" }}
            >
              <div className="absolute inset-0 animate-shimmer" />
              <div className="h-3 w-20 rounded" style={{ backgroundColor: "var(--bg-surface)" }} />
              <div className="h-7 w-28 rounded" style={{ backgroundColor: "var(--bg-surface)" }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel relative overflow-hidden rounded-3xl p-6 h-72" style={{ borderColor: "var(--card-border)" }}>
            <div className="absolute inset-0 animate-shimmer" />
          </div>
          <div className="glass-panel relative overflow-hidden rounded-3xl p-6 h-72" style={{ borderColor: "var(--card-border)" }}>
            <div className="absolute inset-0 animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="btn-ghost px-4 py-2 text-xs font-semibold">
            Back to Admin Console
          </Link>
        </div>
        <div
          className="glass-panel rounded-2xl p-8 text-center space-y-3 border"
          style={{
            borderColor: "var(--status-danger)",
            backgroundColor: "var(--status-danger-bg)",
          }}
        >
          <AlertCircle className="w-8 h-8 mx-auto" style={{ color: "var(--status-danger)" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--status-danger)" }}>
            {error || "Failed to load analytics"}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Analytics requires admin authentication. Please log in as an admin user.
          </p>
        </div>
      </div>
    );
  }

  const { summary, revenue_trend, top_parts, mechanic_stats } = data;
  const currency = summary.currency;

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }}
      className="max-w-6xl mx-auto space-y-6 pb-12"
    >
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="btn-ghost px-4 py-2 text-xs font-semibold"
        >
          Back to Admin Console
        </Link>
        <span
          className="text-xs font-medium px-3 py-1 rounded-full border"
          style={{
            color: "var(--accent-secondary)",
            backgroundColor: "var(--accent-secondary-muted)",
            borderColor: "var(--accent-secondary-light)",
          }}
        >
          Executive Workshop Analytics
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <TrendingUp className="w-6 h-6" style={{ color: "var(--accent-secondary)" }} /> Revenue & Service Analytics
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Live aggregated workshop metrics from the database — revenue trends and inventory consumption.
          </p>
        </div>
      </div>

      {/* KPI Cards — driven by real summary data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28, delay: 0.05 }}
          className="glass-panel glass-hover-border rounded-xl p-5 space-y-1"
          style={{ borderColor: "var(--card-border)" }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Total Gross Revenue
          </span>
          <div className="text-2xl font-black font-mono" style={{ color: "var(--text-primary)" }}>
            {currency} {summary.total_revenue.toLocaleString()}
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28, delay: 0.1 }}
          className="glass-panel glass-hover-border rounded-xl p-5 space-y-1"
          style={{ borderColor: "var(--card-border)" }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Services Performed
          </span>
          <div className="text-2xl font-black font-mono" style={{ color: "var(--accent)" }}>
            {summary.total_services} Visits
          </div>
          <span className="text-[11px] font-bold" style={{ color: "var(--accent)" }}>
            Average {currency} {summary.avg_per_service.toLocaleString()} per visit
          </span>
        </motion.div>

        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28, delay: 0.15 }}
          className="glass-panel glass-hover-border rounded-xl p-5 space-y-1"
          style={{ borderColor: "var(--card-border)" }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Registered Vehicles
          </span>
          <div className="text-2xl font-black font-mono" style={{ color: "var(--status-good)" }}>
            {summary.total_vehicles}
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28, delay: 0.2 }}
          className="glass-panel glass-hover-border rounded-xl p-5 space-y-1"
          style={{ borderColor: "var(--card-border)" }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Most Replaced Item
          </span>
          <div className="text-lg font-extrabold truncate" style={{ color: "var(--text-primary)" }}>
            {summary.most_replaced?.name || "N/A"}
          </div>
          <span className="text-[11px] font-bold" style={{ color: "var(--accent-secondary)" }}>
            {summary.most_replaced ? `${summary.most_replaced.count} units installed` : "No data yet"}
          </span>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Area Chart */}
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28, delay: 0.25 }}
          className="glass-panel rounded-3xl p-6 space-y-4"
          style={{ borderColor: "var(--card-border)" }}
        >
          <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <DollarSign className="w-4 h-4" style={{ color: "var(--status-good)" }} /> Monthly Revenue Trend ({currency})
          </h3>
          <div className="h-64 w-full">
            {revenue_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue_trend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--status-good)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--status-good)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="var(--divider-strong)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card-bg-solid)",
                      borderColor: "var(--card-border)",
                      borderRadius: "12px",
                      color: "var(--text-primary)",
                      boxShadow: "var(--card-shadow-lg)",
                    }}
                    formatter={(value: number) => [`${currency} ${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--status-good)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
                No revenue data available yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Parts Bar Chart */}
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28, delay: 0.3 }}
          className="glass-panel rounded-3xl p-6 space-y-4"
          style={{ borderColor: "var(--card-border)" }}
        >
          <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <BarChart2 className="w-4 h-4" style={{ color: "var(--accent-secondary)" }} /> Top Replaced Inventory Items
          </h3>
          <div className="h-64 w-full">
            {top_parts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top_parts}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="var(--divider-strong)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card-bg-solid)",
                      borderColor: "var(--card-border)",
                      borderRadius: "12px",
                      color: "var(--text-primary)",
                      boxShadow: "var(--card-shadow-lg)",
                    }}
                  />
                  <Bar dataKey="count" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
                No parts data available yet
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Mechanic Performance Table */}
      {mechanic_stats.length > 0 && (
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28, delay: 0.35 }}
          className="glass-panel rounded-3xl overflow-hidden"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="px-6 pt-5 pb-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Users className="w-4 h-4" style={{ color: "var(--accent)" }} /> Mechanic Performance Breakdown
            </h3>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b uppercase text-[11px]" style={{ borderColor: "var(--divider)", backgroundColor: "var(--bg-surface)", color: "var(--text-muted)" }}>
                <th className="py-3 px-6">Mechanic Name</th>
                <th className="py-3 px-6">Services Completed</th>
                <th className="py-3 px-6">Revenue Generated ({currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--divider)" }}>
              {mechanic_stats.map((m, i) => (
                <motion.tr
                  key={m.name}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28, delay: 0.4 + i * 0.05 }}
                  style={{ borderColor: "var(--divider)" }}
                >
                  <td className="py-3.5 px-6 font-bold" style={{ color: "var(--text-primary)" }}>{m.name}</td>
                  <td className="py-3.5 px-6 font-mono font-bold" style={{ color: "var(--accent)" }}>{m.services}</td>
                  <td className="py-3.5 px-6 font-mono font-bold" style={{ color: "var(--status-good)" }}>
                    {currency} {m.revenue.toLocaleString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}
