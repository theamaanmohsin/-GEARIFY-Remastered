"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Wrench, FileText, AlertCircle } from "lucide-react";

interface TrackData {
  vehicle: {
    registration_no: string;
    make: string;
    model: string;
    year: number;
    vehicle_type: string;
    current_km: number;
    owner_name: string | null;
    health_score: number;
    status: "good" | "warning" | "danger";
  };
  history: {
    id: number;
    date: string;
    km_at_service: number;
    next_service_km: number;
    total_cost: number;
    currency: string;
    parts: string[];
  }[];
}

export default function PublicVehiclePassportPage() {
  const params = useParams();
  const regNo = params.regNo as string;
  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!regNo) return;
    const fetchPassport = async () => {
      try {
        // Use the dedicated public tracking API endpoint
        const res = await fetch(`/api/track/${encodeURIComponent(regNo)}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || "Vehicle not found");
        }
      } catch (err) {
        console.error("Failed to load vehicle passport:", err);
        setError("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchPassport();
  }, [regNo]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="glass-panel rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto animate-pulse">
            <Wrench className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading Digital Vehicle Passport...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Passport Not Found</h2>
        <p className="text-xs text-gray-500">
          {error || `No vehicle registered with plate "${regNo}".`}
        </p>
      </div>
    );
  }

  const { vehicle, history } = data;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Public Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-indigo-500 uppercase">
                Official QR Passport
              </span>
              <h1 className="text-2xl font-black font-mono tracking-wider uppercase text-gray-900 dark:text-white">
                {vehicle.registration_no}
              </h1>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 border ${
              vehicle.status === "good"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : vehicle.status === "warning"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="capitalize">{vehicle.status} Health</span>
          </div>
        </div>

        {/* Specs Overview */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-500/5 border border-white/10 text-center">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Make / Model</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {vehicle.make} {vehicle.model}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Model Year</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">{vehicle.year}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Recorded Odometer</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {vehicle.current_km.toLocaleString()} KM
            </span>
          </div>
        </div>

        {/* Owner info if available */}
        {vehicle.owner_name && (
          <div className="text-xs text-center text-gray-500">
            Registered Owner: <span className="font-semibold text-gray-700 dark:text-gray-300">{vehicle.owner_name}</span>
          </div>
        )}

        {/* Health Score Gauge Bar */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              GEARIFY Health Index
            </span>
            <span className="font-mono font-black text-lg text-gray-900 dark:text-white">
              {vehicle.health_score}/100
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${vehicle.health_score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                vehicle.status === "good"
                  ? "bg-emerald-500"
                  : vehicle.status === "warning"
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
            />
          </div>
        </div>

        {/* History Timeline */}
        <div className="space-y-3 pt-4 border-t border-gray-200/50 dark:border-white/10">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Verified Workshop Service Logs
          </h3>

          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((record, idx) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className="p-3.5 rounded-xl bg-gray-500/5 border border-gray-200/40 dark:border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-gray-400 block text-[10px]">{record.date}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Service at {record.km_at_service.toLocaleString()} KM
                      </span>
                    </div>
                    <div className="font-mono font-bold text-indigo-500">
                      {record.currency} {record.total_cost.toLocaleString()}
                    </div>
                  </div>
                  {/* Show parts replaced */}
                  {record.parts && record.parts.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {record.parts.map((part, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[9px] font-semibold border border-indigo-500/20"
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic py-4 text-center">
              No service records found for this vehicle.
            </p>
          )}
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
        Verified by GEARIFY Automotive Performance Management System
      </div>
    </div>
  );
}
