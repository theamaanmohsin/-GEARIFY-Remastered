"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Vehicle, VehiclesResponse } from "../types";
import VehicleCard from "../components/VehicleCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { Search, Car, AlertTriangle, AlertCircle, ShieldCheck, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const fetchVehicles = async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = query
        ? `/api/vehicles?q=${encodeURIComponent(query)}`
        : "/api/vehicles";
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: VehiclesResponse = await res.json();
      setVehicles(data.vehicles || []);
    } catch (err: any) {
      console.error("Error fetching vehicles:", err);
      setError("Unable to connect to the backend server. Make sure Flask API is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Filter vehicles client-side for fast instant search filter
  const filteredVehicles = vehicles.filter(
    (v) =>
      v.registration_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.owner_name && v.owner_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Statistics calculation
  const totalVehicles = vehicles.length;
  const optimalCount = vehicles.filter((v) => v.status === "good").length;
  const warningCount = vehicles.filter((v) => v.status === "warning").length;
  const dangerCount = vehicles.filter((v) => v.status === "danger").length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            Workshop Fleet Overview
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: "var(--text-secondary)" }}>
            Real-time status tracking, predictive maintenance, and vehicle service metrics.
          </p>
        </div>

        {/* Quick Add Vehicle Button */}
        <motion.div whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
          <Link
            href="/services/new"
            className="btn-accent flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm"
          >
            <Plus className="w-5 h-5" />
            New Maintenance Entry
          </Link>
        </motion.div>
      </div>

      {/* Summary KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel glass-hover-border rounded-xl p-4 flex items-center gap-3">
          <div
            className="p-3 rounded-xl"
            style={{
              backgroundColor: "#F4F4F5",
              color: "#18181B",
            }}
          >
            <Car className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider block font-bold" style={{ color: "var(--text-muted)" }}>
              Total Fleet
            </span>
            <span className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
              {totalVehicles}
            </span>
          </div>
        </div>

        <div className="glass-panel glass-hover-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--status-good-bg)", color: "var(--status-good)" }}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider block font-bold" style={{ color: "var(--text-muted)" }}>
              Optimal Health
            </span>
            <span className="text-2xl font-black" style={{ color: "var(--status-good)" }}>
              {optimalCount}
            </span>
          </div>
        </div>

        <div className="glass-panel glass-hover-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--status-warning-bg)", color: "var(--status-warning)" }}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider block font-bold" style={{ color: "var(--text-muted)" }}>
              Service Due Soon
            </span>
            <span className="text-2xl font-black" style={{ color: "var(--status-warning)" }}>
              {warningCount}
            </span>
          </div>
        </div>

        <div className="glass-panel glass-hover-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--status-danger-bg)", color: "var(--status-danger)" }}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider block font-bold" style={{ color: "var(--text-muted)" }}>
              Overdue Service
            </span>
            <span className="text-2xl font-black" style={{ color: "var(--status-danger)" }}>
              {dangerCount}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="glass-panel rounded-2xl p-3 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicle by registration plate, make, model or owner name..."
            className="input-field"
          />
        </div>

        <button
          onClick={() => fetchVehicles(searchQuery)}
          className="p-2.5 rounded-xl transition-colors"
          style={{ backgroundColor: "var(--accent-muted)", color: "var(--text-secondary)" }}
          title="Refresh dataset"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Error state alert */}
      {error && (
        <div className="glass-panel rounded-2xl p-5 flex items-center gap-3" style={{ borderColor: "var(--status-danger)", backgroundColor: "var(--status-danger-bg)", color: "var(--status-danger)" }}>
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1 text-sm font-medium">{error}</div>
          <button
            onClick={() => fetchVehicles()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ backgroundColor: "var(--status-danger-bg)" }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Grid Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle, index) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--accent-muted)", color: "var(--text-muted)" }}>
            <Car className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            No Vehicles Found
          </h3>
          <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-muted)" }}>
            {searchQuery
              ? `No vehicle match for "${searchQuery}". Try clearing search filter.`
              : "No vehicles registered in the system database yet."}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="btn-ghost px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Clear Search Query
            </button>
          ) : (
            <Link
              href="/services/new"
              className="btn-accent inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold"
            >
              <Plus className="w-4 h-4" /> Add First Vehicle
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
