"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, FileText, Trash2, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface HistoryItem {
  id: number;
  date: string;
  reg_no: string;
  car: string;
  mechanic_name: string;
  total_cost: number;
  currency: string;
  km_at_service: number;
  next_service_km: number;
  items_count: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<string>("mechanic");

  const fetchHistory = async (query = "") => {
    setLoading(true);
    try {
      const url = query
        ? `/api/services/history?q=${encodeURIComponent(query)}`
        : "/api/services/history";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to load service history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Read cached user role
    const savedUser = localStorage.getItem("gearify_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role) setUserRole(parsed.role);
      } catch (e) {}
    }
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service record?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Failed to delete record. Requires Admin permissions.");
      }
    } catch (err) {
      alert("Error deleting record");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          Service History & Logs
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Maintenance History Records
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Search service history by vehicle registration number, make, model, or date.
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="glass-panel rounded-2xl p-3 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by registration plate (e.g. APS-2342) or car model..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-500/5 border border-gray-200/50 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <button
          onClick={() => fetchHistory(searchQuery)}
          className="p-2.5 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Records Table View */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-white/10 bg-gray-500/5 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Plate Reg No</th>
                <th className="py-4 px-6">Vehicle Details</th>
                <th className="py-4 px-6">Odometer</th>
                <th className="py-4 px-6">Total Cost</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/40 dark:divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Loading records...
                  </td>
                </tr>
              ) : history.length > 0 ? (
                history.map((item, idx) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-gray-500">
                      {item.date}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-gray-900 dark:text-white uppercase">
                      {item.reg_no}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-800 dark:text-gray-200">
                      {item.car}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {item.km_at_service.toLocaleString()} KM
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-600 dark:text-emerald-400">
                      {item.currency} {item.total_cost.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        href={`/receipts/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> Receipt
                      </Link>

                      {userRole === "admin" && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No service records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
