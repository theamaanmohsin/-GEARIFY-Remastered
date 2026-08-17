"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search, Calendar, FileText, Trash2, RefreshCw } from "lucide-react";
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
  const reduceMotion = useReducedMotion();
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
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }}
      className="max-w-6xl mx-auto space-y-6 pb-12"
    >
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="btn-ghost px-4 py-2 text-xs font-semibold"
        >
          Back to Dashboard
        </Link>
        <span
          className="text-xs font-medium px-3 py-1 rounded-full border"
          style={{
            color: "var(--status-warning)",
            backgroundColor: "var(--status-warning-bg)",
            borderColor: "var(--status-warning-bg)",
          }}
        >
          Service History & Logs
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            Maintenance History Records
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Search service history by vehicle registration number, make, model, or date.
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="glass-panel rounded-2xl p-3 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by registration plate (e.g. APS-2342) or car model..."
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => fetchHistory(searchQuery)}
          className="p-2.5 rounded-xl transition-colors"
          style={{ backgroundColor: "var(--accent-muted)", color: "var(--text-secondary)" }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Records Table View */}
      <div className="glass-panel-lg rounded-3xl overflow-hidden shadow-xl" style={{ borderColor: "var(--card-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-[11px] font-black uppercase tracking-wider" style={{ borderColor: "var(--divider)", backgroundColor: "var(--bg-surface)", color: "var(--text-secondary)" }}>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Plate Reg No</th>
                <th className="py-4 px-6">Vehicle Details</th>
                <th className="py-4 px-6">Odometer</th>
                <th className="py-4 px-6">Total Cost</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm" style={{ borderColor: "var(--divider)" }}>
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-b" style={{ borderColor: "var(--divider)" }}>
                    <td colSpan={6} className="py-4 px-6">
                      <div className="h-5 rounded relative overflow-hidden animate-shimmer" style={{ backgroundColor: "var(--bg-surface)" }} />
                    </td>
                  </tr>
                ))
              ) : history.length > 0 ? (
                history.map((item, idx) => (
                  <motion.tr
                    key={item.id}
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28, delay: idx * 0.04 }}
                    className="border-b transition-colors hover:opacity-90"
                    style={{ borderColor: "var(--divider)" }}
                  >
                    <td className="py-4 px-6 font-mono text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                      {item.date}
                    </td>
                    <td className="py-4 px-6 font-mono font-black uppercase" style={{ color: "var(--text-primary)" }}>
                      {item.reg_no}
                    </td>
                    <td className="py-4 px-6 font-bold" style={{ color: "var(--text-primary)" }}>
                      {item.car}
                    </td>
                    <td className="py-4 px-6 text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                      {item.km_at_service.toLocaleString()} KM
                    </td>
                    <td className="py-4 px-6 font-black" style={{ color: "var(--status-good)" }}>
                      {item.currency} {item.total_cost.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        href={`/receipts/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border"
                        style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)", borderColor: "var(--accent-light)" }}
                      >
                        <FileText className="w-3.5 h-3.5" /> Receipt
                      </Link>

                      {userRole === "admin" && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border"
                          style={{ backgroundColor: "var(--status-danger-bg)", color: "var(--status-danger)", borderColor: "var(--status-danger)" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center font-medium" style={{ color: "var(--text-muted)" }}>
                    No service records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
