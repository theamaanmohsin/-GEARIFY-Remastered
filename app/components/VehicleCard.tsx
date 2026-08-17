"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Vehicle } from "../types";
import { Car, Bike, Truck, Calendar, Gauge, ShieldCheck, AlertTriangle, AlertCircle } from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
  index: number;
}

/** §3/§5: Only enable hover transforms on fine-pointer devices */
function useCanHover() {
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);
  return canHover;
}

export default function VehicleCard({ vehicle, index }: VehicleCardProps) {
  const reduceMotion = useReducedMotion();
  const canHover = useCanHover();

  // Vehicle type icon mapper
  const getVehicleIcon = () => {
    switch (vehicle.vehicle_type) {
      case "motorcycle":
        return <Bike className="w-5 h-5" style={{ color: "var(--text-primary)" }} />;
      case "lcv":
        return <Truck className="w-5 h-5" style={{ color: "var(--text-primary)" }} />;
      default:
        return <Car className="w-5 h-5" style={{ color: "var(--text-primary)" }} />;
    }
  };

  // Status visual styles
  const getStatusBadge = () => {
    switch (vehicle.status) {
      case "good":
        return {
          color: "var(--status-good)",
          bg: "var(--status-good-bg)",
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
          label: "Optimal",
        };
      case "warning":
        return {
          color: "var(--status-warning)",
          bg: "var(--status-warning-bg)",
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: "Service Soon",
        };
      case "danger":
        return {
          color: "var(--status-danger)",
          bg: "var(--status-danger-bg)",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: "Overdue",
        };
    }
  };

  const statusInfo = getStatusBadge();
  const latestService = vehicle.latest_service;

  // Calculate KM remaining
  const kmRemaining = latestService
    ? latestService.next_service_km - vehicle.current_km
    : null;

  // Health bar color
  const healthBarColor =
    vehicle.status === "good"
      ? "var(--status-good)"
      : vehicle.status === "warning"
      ? "var(--status-warning)"
      : "var(--status-danger)";

  return (
    <motion.div
      layoutId={`vehicle-card-${vehicle.id}`}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 300,
              damping: 28,
              delay: index * 0.07,
            }
      }
      whileHover={canHover && !reduceMotion ? { y: -4, scale: 1.01 } : undefined}
      className="glass-panel glass-hover-border group relative rounded-2xl p-5 cursor-pointer"
    >
      {/* Top Bar: Plate Registration & Vehicle Type Icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-xl border"
            style={{ borderColor: "var(--card-border)", backgroundColor: "var(--bg-surface)" }}
          >
            {getVehicleIcon()}
          </div>
          <div>
            <span className="font-mono font-bold text-lg tracking-wider uppercase" style={{ color: "var(--text-primary)" }}>
              {vehicle.registration_no}
            </span>
            <p className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
              {vehicle.make} {vehicle.model}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
          style={{
            color: statusInfo.color,
            backgroundColor: statusInfo.bg,
            borderColor: `${statusInfo.color}30`,
          }}
        >
          {statusInfo.icon}
          <span>{statusInfo.label}</span>
        </div>
      </div>

      {/* Vehicle Specs Grid */}
      <div
        className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl border"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--card-border)" }}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
          <div>
            <span className="text-[10px] uppercase tracking-wider block font-semibold" style={{ color: "var(--text-muted)" }}>Model Year</span>
            <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{vehicle.year}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
          <div>
            <span className="text-[10px] uppercase tracking-wider block font-semibold" style={{ color: "var(--text-muted)" }}>Odometer</span>
            <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{vehicle.current_km.toLocaleString()} KM</span>
          </div>
        </div>
      </div>

      {/* Health Score Bar — §2: spring instead of duration-based */}
      <div className="mt-3">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>Health Score</span>
          <span className="font-extrabold" style={{ color: "var(--text-primary)" }}>
            {vehicle.health_score}/100
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-surface)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${vehicle.health_score}%` }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 80, damping: 20, delay: 0.2 + index * 0.05 }
            }
            className="h-full rounded-full"
            style={{ backgroundColor: healthBarColor }}
          />
        </div>
      </div>

      {/* Bottom Footer Details */}
      <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: "var(--divider)" }}>
        <span>
          {kmRemaining !== null ? (
            kmRemaining > 0 ? (
              <span className="font-semibold" style={{ color: "var(--status-good)" }}>
                Next due in {kmRemaining.toLocaleString()} KM
              </span>
            ) : (
              <span className="font-extrabold" style={{ color: "var(--status-danger)" }}>
                Overdue by {Math.abs(kmRemaining).toLocaleString()} KM
              </span>
            )
          ) : (
            <span style={{ color: "var(--text-muted)" }}>No service history</span>
          )}
        </span>

        <span
          className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors border"
          style={{
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--card-border)",
          }}
        >
          View Passport
        </span>
      </div>
    </motion.div>
  );
}
