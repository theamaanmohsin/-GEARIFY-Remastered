"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Vehicle, VehiclesResponse } from "./types";
import VehicleCard from "./components/VehicleCard";
import LoadingSkeleton from "./components/LoadingSkeleton";
import { Search, Car, AlertTriangle, AlertCircle, ShieldCheck, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

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
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Workshop Fleet Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time status tracking, predictive maintenance, and vehicle service metrics.
          </p>
        </div>

        {/* Quick Add Vehicle Floating Neumorphic Button */}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/services/new"
            className="neu-button flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md"
          >
            <Plus className="w-5 h-5 text-indigo-500" />
            New Maintenance Entry
          </Link>
        </motion.div>
      </div>

      {/* Summary KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider block font-medium">
              Total Fleet
            </span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              {totalVehicles}
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider block font-medium">
              Optimal Health
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {optimalCount}
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider block font-medium">
              Service Due Soon
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {warningCount}
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider block font-medium">
              Overdue Service
            </span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {dangerCount}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="glass-panel rounded-2xl p-3 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicle by registration plate, make, model or owner name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-500/5 border border-gray-200/50 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>

        <button
          onClick={() => fetchVehicles(searchQuery)}
          className="p-2.5 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 text-gray-600 dark:text-gray-300 transition-colors"
          title="Refresh dataset"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Error state alert */}
      {error && (
        <div className="glass-panel rounded-2xl p-5 border border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1 text-sm font-medium">{error}</div>
          <button
            onClick={() => fetchVehicles()}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-xs font-semibold hover:bg-rose-500/30 transition-colors"
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
          <div className="w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Car className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            No Vehicles Found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
            {searchQuery
              ? `No vehicle match for "${searchQuery}". Try clearing search filter.`
              : "No vehicles registered in the system database yet."}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="neu-button px-4 py-2 rounded-xl text-xs font-semibold text-indigo-500"
            >
              Clear Search Query
            </button>
          ) : (
            <Link
              href="/services/new"
              className="neu-button inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-indigo-500"
            >
              <Plus className="w-4 h-4" /> Add First Vehicle
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
