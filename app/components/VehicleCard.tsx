"use client";

import React from "react";
import { motion } from "framer-motion";
import { Vehicle } from "../types";
import { Car, Bike, Truck, Calendar, Gauge, ShieldCheck, AlertTriangle, AlertCircle, ChevronRight } from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
  index: number;
}

export default function VehicleCard({ vehicle, index }: VehicleCardProps) {
  // Vehicle type icon mapper
  const getVehicleIcon = () => {
    switch (vehicle.vehicle_type) {
      case "motorcycle":
        return <Bike className="w-5 h-5 text-indigo-400" />;
      case "lcv":
        return <Truck className="w-5 h-5 text-amber-400" />;
      default:
        return <Car className="w-5 h-5 text-purple-400" />;
    }
  };

  // Status visual styles
  const getStatusBadge = () => {
    switch (vehicle.status) {
      case "good":
        return {
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
          label: "Optimal",
          glow: "group-hover:shadow-emerald-500/10",
        };
      case "warning":
        return {
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: "Service Soon",
          glow: "group-hover:shadow-amber-500/10",
        };
      case "danger":
        return {
          bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: "Overdue",
          glow: "group-hover:shadow-rose-500/10",
        };
    }
  };

  const statusInfo = getStatusBadge();
  const latestService = vehicle.latest_service;

  // Calculate KM remaining
  const kmRemaining = latestService
    ? latestService.next_service_km - vehicle.current_km
    : null;

  return (
    <motion.div
      layoutId={`vehicle-card-${vehicle.id}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`glass-panel group relative rounded-2xl p-5 cursor-pointer transition-shadow duration-300 ${statusInfo.glow} hover:shadow-xl`}
    >
      {/* Top Bar: Plate Registration & Vehicle Type Icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10">
            {getVehicleIcon()}
          </div>
          <div>
            <span className="font-mono font-bold text-lg tracking-wider text-gray-900 dark:text-white uppercase">
              {vehicle.registration_no}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {vehicle.make} {vehicle.model}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg}`}
        >
          {statusInfo.icon}
          <span>{statusInfo.label}</span>
        </div>
      </div>

      {/* Vehicle Specs Grid */}
      <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl bg-gray-500/5 border border-white/10">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Model Year</span>
            <span className="text-xs font-semibold">{vehicle.year}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-gray-400" />
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Odometer</span>
            <span className="text-xs font-semibold">{vehicle.current_km.toLocaleString()} KM</span>
          </div>
        </div>
      </div>

      {/* Health Score Bar */}
      <div className="mt-3">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-gray-500 dark:text-gray-400 font-medium">Health Score</span>
          <span className="font-bold text-gray-800 dark:text-gray-200">
            {vehicle.health_score}/100
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700/60 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${vehicle.health_score}%` }}
            transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}
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

      {/* Bottom Footer Details */}
      <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-white/5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {kmRemaining !== null ? (
            kmRemaining > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Next due in {kmRemaining.toLocaleString()} KM
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                Overdue by {Math.abs(kmRemaining).toLocaleString()} KM
              </span>
            )
          ) : (
            "No service history"
          )}
        </span>

        <span className="flex items-center gap-0.5 text-indigo-500 group-hover:translate-x-1 transition-transform font-medium">
          Details <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </motion.div>
  );
}
