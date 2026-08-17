"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!regNo) return;
    const fetchPassport = async () => {
      try {
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
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="glass-panel relative overflow-hidden rounded-3xl p-8 space-y-6" style={{ borderColor: "var(--card-border)" }}>
          <div className="absolute inset-0 animate-shimmer" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl" style={{ backgroundColor: "var(--bg-surface)" }} />
            <div className="space-y-2">
              <div className="h-4 w-24 rounded" style={{ backgroundColor: "var(--bg-surface)" }} />
              <div className="h-6 w-36 rounded" style={{ backgroundColor: "var(--bg-surface)" }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 rounded-2xl" style={{ backgroundColor: "var(--bg-surface)" }} />
            <div className="h-16 rounded-2xl" style={{ backgroundColor: "var(--bg-surface)" }} />
            <div className="h-16 rounded-2xl" style={{ backgroundColor: "var(--bg-surface)" }} />
          </div>
          <div className="h-20 rounded-2xl" style={{ backgroundColor: "var(--bg-surface)" }} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 space-y-3">
        <AlertCircle className="w-10 h-10 mx-auto" style={{ color: "var(--status-danger)" }} />
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Passport Not Found</h2>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {error || `No vehicle registered with plate "${regNo}".`}
        </p>
      </div>
    );
  }

  const { vehicle, history } = data;

  const statusStyle =
    vehicle.status === "good"
      ? { color: "var(--status-good)", bg: "var(--status-good-bg)" }
      : vehicle.status === "warning"
      ? { color: "var(--status-warning)", bg: "var(--status-warning-bg)" }
      : { color: "var(--status-danger)", bg: "var(--status-danger-bg)" };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Public Header Card */}
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }}
        className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6"
        style={{ borderColor: "var(--card-border)" }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: "var(--accent)" }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <Wrench className="w-6 h-6 logo-wrench-icon" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--accent)" }}>
                Official QR Passport
              </span>
              <h1 className="text-2xl font-black font-mono tracking-wider uppercase" style={{ color: "var(--text-primary)" }}>
                {vehicle.registration_no}
              </h1>
            </div>
          </div>

          <div
            className="px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 border"
            style={{
              color: statusStyle.color,
              backgroundColor: statusStyle.bg,
              borderColor: `${statusStyle.color}30`,
            }}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="capitalize">{vehicle.status} Health</span>
          </div>
        </div>

        {/* Specs Overview */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl border text-center" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>Make / Model</span>
            <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
              {vehicle.make} {vehicle.model}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>Model Year</span>
            <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{vehicle.year}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>Recorded Odometer</span>
            <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
              {vehicle.current_km.toLocaleString()} KM
            </span>
          </div>
        </div>

        {/* Owner info if available */}
        {vehicle.owner_name && (
          <div className="text-xs text-center font-medium" style={{ color: "var(--text-secondary)" }}>
            Registered Owner: <span className="font-bold" style={{ color: "var(--text-primary)" }}>{vehicle.owner_name}</span>
          </div>
        )}

        {/* Health Score Gauge Bar */}
        <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: "var(--accent-muted)", borderColor: "var(--accent-light)" }}>
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
              GEARIFY Health Index
            </span>
            <span className="font-mono font-black text-lg" style={{ color: "var(--text-primary)" }}>
              {vehicle.health_score}/100
            </span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-surface)" }}>
            <motion.div
              initial={reduceMotion ? { width: `${vehicle.health_score}%` } : { width: 0 }}
              animate={{ width: `${vehicle.health_score}%` }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 80, damping: 20 }}
              className="h-full rounded-full"
              style={{ backgroundColor: statusStyle.color }}
            />
          </div>
        </div>

        {/* History Timeline */}
        <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--divider)" }}>
          <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
            <FileText className="w-4 h-4" style={{ color: "var(--accent)" }} /> Verified Workshop Service Logs
          </h3>

          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((record, idx) => (
                <motion.div
                  key={record.id}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28, delay: 0.1 + idx * 0.05 }}
                  className="p-3.5 rounded-xl border space-y-1.5"
                  style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono block text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>{record.date}</span>
                      <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                        Service at {record.km_at_service.toLocaleString()} KM
                      </span>
                    </div>
                    <div className="font-mono font-black" style={{ color: "var(--accent)" }}>
                      {record.currency} {record.total_cost.toLocaleString()}
                    </div>
                  </div>
                  {record.parts && record.parts.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {record.parts.map((part, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold border"
                          style={{
                            backgroundColor: "var(--accent-muted)",
                            color: "var(--accent)",
                            borderColor: "var(--accent-light)",
                          }}
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
            <p className="text-xs italic py-4 text-center" style={{ color: "var(--text-muted)" }}>
              No service records found for this vehicle.
            </p>
          )}
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="text-center text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        Verified by GEARIFY REMASTERED Automotive Performance Management System
      </div>
    </div>
  );
}
