"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ServicePart, Vehicle } from "../../types";
import { Wrench, Car, Bike, Truck, PlusCircle, CheckCircle2, DollarSign } from "lucide-react";
import Link from "next/link";

export default function NewServicePage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  // Vehicle Details
  const [regNo, setRegNo] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number | "">(2022);
  const [currentKm, setCurrentKm] = useState<number | "">("");
  const [vehicleType, setVehicleType] = useState<"car" | "lcv" | "motorcycle">("car");

  // Parts Catalog fetched from API
  const [allParts, setAllParts] = useState<ServicePart[]>([]);
  const [laborCost, setLaborCost] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState("PKR");

  // Selected part IDs per category (Optional / nullable!)
  const [selectedOilId, setSelectedOilId] = useState<number | null>(null);
  const [selectedAirFilterId, setSelectedAirFilterId] = useState<number | null>(null);
  const [selectedOilFilterId, setSelectedOilFilterId] = useState<number | null>(null);
  const [selectedBikeConsumableId, setSelectedBikeConsumableId] = useState<number | null>(null);

  const [loadingParts, setLoadingParts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill existing vehicle details if plate matches
  const [existingVehicles, setExistingVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    // Fetch parts catalog & vehicle database
    const fetchData = async () => {
      try {
        const [partsRes, vehiclesRes, currRes] = await Promise.all([
          fetch("/api/parts"),
          fetch("/api/vehicles"),
          fetch("/api/settings/default_currency"),
        ]);

        if (partsRes.ok) {
          const partsData = await partsRes.json();
          setAllParts(partsData.parts || []);
        }

        if (vehiclesRes.ok) {
          const vehData = await vehiclesRes.json();
          setExistingVehicles(vehData.vehicles || []);
        }

        if (currRes.ok) {
          const currData = await currRes.json();
          if (currData.value) setCurrency(currData.value);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoadingParts(false);
      }
    };

    fetchData();
  }, []);

  // When regNo changes, check if vehicle exists and pre-fill details
  const handleRegNoChange = (val: string) => {
    const uppercaseVal = val.toUpperCase();
    setRegNo(uppercaseVal);

    const matched = existingVehicles.find(
      (v) => v.registration_no === uppercaseVal
    );
    if (matched) {
      setMake(matched.make);
      setModel(matched.model);
      setYear(matched.year);
      setCurrentKm(matched.current_km);
      setVehicleType(matched.vehicle_type);
    }
  };

  // Filter parts by category & vehicle type scope
  const filterParts = (category: string) => {
    return allParts.filter(
      (p) =>
        p.category === category &&
        (p.vehicle_type_scope === vehicleType || p.vehicle_type_scope === "all")
    );
  };

  const oilParts = filterParts("engine_oil");
  const airFilterParts = filterParts("air_filter");
  const oilFilterParts = filterParts("oil_filter");
  const bikeConsumables = [
    ...filterParts("chain_lube"),
    ...filterParts("brake_pad"),
    ...filterParts("spark_plug"),
  ];

  // Calculate live total cost
  const getSelectedPartCost = (id: number | null) => {
    if (!id) return 0;
    const p = allParts.find((part) => part.id === id);
    return p ? p.unit_price : 0;
  };

  const partsTotal =
    getSelectedPartCost(selectedOilId) +
    getSelectedPartCost(selectedAirFilterId) +
    getSelectedPartCost(selectedOilFilterId) +
    getSelectedPartCost(selectedBikeConsumableId);

  const grandTotal = partsTotal + (Number(laborCost) || 0);

  // Predictive Next Service KM calculation
  const calculatedNextKm =
    typeof currentKm === "number" && currentKm > 0
      ? currentKm + (vehicleType === "motorcycle" ? 3000 : 15000)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo || !currentKm) {
      setError("Registration number and odometer KM are required");
      return;
    }

    setSubmitting(true);
    setError(null);

    // Build array of selected part IDs (only non-null items!)
    const part_ids: number[] = [];
    if (selectedOilId) part_ids.push(selectedOilId);
    if (selectedAirFilterId) part_ids.push(selectedAirFilterId);
    if (selectedOilFilterId) part_ids.push(selectedOilFilterId);
    if (selectedBikeConsumableId) part_ids.push(selectedBikeConsumableId);

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registration_no: regNo,
          make,
          model,
          year: Number(year),
          current_km: Number(currentKm),
          vehicle_type: vehicleType,
          labor_cost: Number(laborCost) || 0,
          part_ids,
          notes,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        // Session expired / token invalid — prompt to log in again.
        setError("Your session has expired. Please log in again to continue.");
        setSubmitting(false);
        setTimeout(() => router.push("/login"), 1200);
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || "Failed to create service record");
      }

      // Navigate to digital receipt page
      router.push(`/receipts/${data.receipt.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="btn-ghost px-4 py-2 text-xs font-semibold"
        >
          Back to Dashboard
        </Link>
        <span className="text-xs font-medium px-3 py-1 rounded-full border" style={{ color: "var(--accent)", backgroundColor: "var(--accent-muted)", borderColor: "var(--accent-light)" }}>
          New Service Entry
        </span>
      </div>

      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }}
        className="glass-panel-lg rounded-3xl p-6 sm:p-8 space-y-8"
      >
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2.5" style={{ color: "var(--text-primary)" }}>
            <Wrench className="w-6 h-6" style={{ color: "var(--accent)" }} />
            Vehicle Service & Maintenance Entry
          </h1>
          <p className="text-xs font-medium mt-1" style={{ color: "var(--text-muted)" }}>
            Fill in vehicle details and select replaced parts. All part categories are optional.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl text-xs font-bold border" style={{ backgroundColor: "var(--status-danger-bg)", borderColor: "var(--status-danger)", color: "var(--status-danger)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Vehicle Category Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-3" style={{ color: "var(--text-primary)" }}>
              Vehicle Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { type: "car", label: "Passenger Car", icon: Car },
                { type: "lcv", label: "Light Commercial", icon: Truck },
                { type: "motorcycle", label: "Motorcycle / Bike", icon: Bike },
              ].map((v) => {
                const Icon = v.icon;
                const active = vehicleType === v.type;
                return (
                  <button
                    key={v.type}
                    type="button"
                    onClick={() => {
                      setVehicleType(v.type as any);
                      setSelectedOilId(null);
                      setSelectedAirFilterId(null);
                      setSelectedOilFilterId(null);
                      setSelectedBikeConsumableId(null);
                    }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      active
                        ? "font-black shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    style={{
                      backgroundColor: active ? "var(--accent-muted)" : "var(--bg-surface)",
                      borderColor: active ? "var(--accent)" : "var(--card-border)",
                      color: active ? "var(--accent)" : "var(--text-secondary)",
                      boxShadow: active ? "0 8px 24px rgba(0, 113, 227, 0.15)" : undefined,
                    }}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <span className="text-xs font-bold">{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Vehicle Specs Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider border-b pb-2" style={{ color: "var(--text-primary)", borderColor: "var(--divider)" }}>
              1. Vehicle Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "var(--text-secondary)" }}>
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. APS-2342 or LHR-7070"
                  value={regNo}
                  onChange={(e) => handleRegNoChange(e.target.value)}
                  className="input-field font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "var(--text-secondary)" }}>
                  Current Odometer (KM) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 45000"
                  value={currentKm}
                  onChange={(e) => setCurrentKm(e.target.value ? Number(e.target.value) : "")}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "var(--text-secondary)" }}>Make / Company</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Honda, Toyota, Suzuki"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "var(--text-secondary)" }}>Model & Year</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Model (e.g. Civic)"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="input-field px-3"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Year (e.g. 2022)"
                    value={year}
                    onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
                    className="input-field px-3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Replaced Parts Dropdowns */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider border-b pb-2 flex items-center justify-between" style={{ borderColor: "var(--divider)", color: "var(--text-primary)" }}>
              <span>2. Replaced Inventory Parts (Optional Selections)</span>
              <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                Leave blank if not changed this visit
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Engine Oil Dropdown */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "var(--text-secondary)" }}>
                  Engine Oil ({vehicleType === "motorcycle" ? "4-Stroke Bike Oil" : "Car Lubricant"})
                </label>
                <select
                  value={selectedOilId || ""}
                  onChange={(e) => setSelectedOilId(e.target.value ? Number(e.target.value) : null)}
                  className="input-field"
                >
                  <option value="">-- None / Not Replaced --</option>
                  {oilParts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {currency} {p.unit_price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Air Filter Dropdown */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "var(--text-secondary)" }}>Air Filter Element</label>
                <select
                  value={selectedAirFilterId || ""}
                  onChange={(e) => setSelectedAirFilterId(e.target.value ? Number(e.target.value) : null)}
                  className="input-field"
                >
                  <option value="">-- None / Not Replaced --</option>
                  {airFilterParts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {currency} {p.unit_price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Oil Filter Dropdown */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "var(--text-secondary)" }}>Oil Filter</label>
                <select
                  value={selectedOilFilterId || ""}
                  onChange={(e) => setSelectedOilFilterId(e.target.value ? Number(e.target.value) : null)}
                  className="input-field"
                >
                  <option value="">-- None / Not Replaced --</option>
                  {oilFilterParts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {currency} {p.unit_price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bike Consumables */}
              {vehicleType === "motorcycle" && (
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: "var(--accent)" }}>
                    Bike Consumables (Chain Lube, Spark Plug, Brake Pads)
                  </label>
                  <select
                    value={selectedBikeConsumableId || ""}
                    onChange={(e) => setSelectedBikeConsumableId(e.target.value ? Number(e.target.value) : null)}
                    className="input-field"
                    style={{ borderColor: "var(--accent)" }}
                  >
                    <option value="">-- None / Not Replaced --</option>
                    {bikeConsumables.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {currency} {p.unit_price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Labor Charge & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: "var(--text-secondary)" }}>Labor Cost ({currency})</label>
              <input
                type="number"
                min="0"
                value={laborCost}
                onChange={(e) => setLaborCost(Number(e.target.value))}
                placeholder="0"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: "var(--text-secondary)" }}>Mechanic Inspection Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Brake pads 70% worn, recommended check next visit"
                className="input-field"
              />
            </div>
          </div>

          {/* Live Billing Summary Footer Panel */}
          <div className="glass-panel-glow rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "var(--accent-muted)" }}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
                Calculated Grand Total
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
                  {currency} {grandTotal.toLocaleString()}
                </span>
                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  ({partsTotal.toLocaleString()} parts + {laborCost.toLocaleString()} labor)
                </span>
              </div>
              {calculatedNextKm && (
                <p className="text-xs font-extrabold mt-1" style={{ color: "var(--status-good)" }}>
                  Predictive Next Service Due: {calculatedNextKm.toLocaleString()} KM
                </p>
              )}
            </div>

            <motion.button
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              type="submit"
              disabled={submitting}
              className="neu-button px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-2 whitespace-nowrap"
              style={{ color: "var(--accent)", backgroundColor: "var(--card-bg-solid)" }}
            >
              <CheckCircle2 className="w-5 h-5" style={{ color: "var(--accent)" }} />
              {submitting ? "Processing..." : "Generate Digital Receipt"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
