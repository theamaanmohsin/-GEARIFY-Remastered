"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Wrench, BarChart2, ArrowLeft, Users, AlertCircle } from "lucide-react";
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
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="glass-panel rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto animate-pulse">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-sm text-gray-400 font-medium">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Admin Console
          </Link>
        </div>
        <div className="glass-panel rounded-2xl p-8 border border-rose-500/20 bg-rose-500/5 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
            {error || "Failed to load analytics"}
          </p>
          <p className="text-xs text-gray-500">
            Analytics requires admin authentication. Please log in as an admin user.
          </p>
        </div>
      </div>
    );
  }

  const { summary, revenue_trend, top_parts, mechanic_stats } = data;
  const currency = summary.currency;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Console
        </Link>
        <span className="text-xs font-medium text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
          Executive Workshop Analytics
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-500" /> Revenue & Service Analytics
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Live aggregated workshop metrics from the database — revenue trends and inventory consumption.
          </p>
        </div>
      </div>

      {/* KPI Cards — driven by real summary data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-panel rounded-2xl p-5 space-y-1 border border-white/10"
        >
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Total Gross Revenue
          </span>
          <div className="text-2xl font-black text-gray-900 dark:text-white font-mono">
            {currency} {summary.total_revenue.toLocaleString()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-2xl p-5 space-y-1 border border-white/10"
        >
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Services Performed
          </span>
          <div className="text-2xl font-black text-indigo-500 font-mono">
            {summary.total_services} Visits
          </div>
          <span className="text-[11px] text-indigo-400 font-bold">
            Average {currency} {summary.avg_per_service.toLocaleString()} per visit
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel rounded-2xl p-5 space-y-1 border border-white/10"
        >
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Registered Vehicles
          </span>
          <div className="text-2xl font-black text-emerald-500 font-mono">
            {summary.total_vehicles}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-2xl p-5 space-y-1 border border-white/10"
        >
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Most Replaced Item
          </span>
          <div className="text-lg font-extrabold text-gray-900 dark:text-white truncate">
            {summary.most_replaced?.name || "N/A"}
          </div>
          <span className="text-[11px] text-purple-400 font-bold">
            {summary.most_replaced ? `${summary.most_replaced.count} units installed` : "No data yet"}
          </span>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4"
        >
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" /> Monthly Revenue Trend ({currency})
          </h3>
          <div className="h-64 w-full">
            {revenue_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue_trend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#374151",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [`${currency} ${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No revenue data available yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Parts Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4"
        >
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-500" /> Top Replaced Inventory Items
          </h3>
          <div className="h-64 w-full">
            {top_parts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top_parts}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#374151",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" fill="#818cf8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No parts data available yet
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Mechanic Performance Table */}
      {mechanic_stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-panel rounded-3xl overflow-hidden border border-white/10"
        >
          <div className="px-6 pt-5 pb-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> Mechanic Performance Breakdown
            </h3>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-white/10 bg-gray-500/5 uppercase text-gray-500 text-[11px]">
                <th className="py-3 px-6">Mechanic Name</th>
                <th className="py-3 px-6">Services Completed</th>
                <th className="py-3 px-6">Revenue Generated ({currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
              {mechanic_stats.map((m, i) => (
                <motion.tr
                  key={m.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="hover:bg-white/5"
                >
                  <td className="py-3.5 px-6 font-bold text-gray-900 dark:text-white">{m.name}</td>
                  <td className="py-3.5 px-6 font-mono text-indigo-500 font-bold">{m.services}</td>
                  <td className="py-3.5 px-6 font-mono text-emerald-500 font-bold">
                    {currency} {m.revenue.toLocaleString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
