"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ServicePart, User } from "../types";
import { Shield, DollarSign, Users, Key, Plus, Edit2, Save, Trash2, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminConsolePage() {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<"parts" | "users" | "security">("parts");

  // Parts state
  const [parts, setParts] = useState<ServicePart[]>([]);
  const [editingPartId, setEditingPartId] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState<number | "">("");

  // New Part Modal / Form state
  const [newPartName, setNewPartName] = useState("");
  const [newPartBrand, setNewPartBrand] = useState("");
  const [newPartCategory, setNewPartCategory] = useState("engine_oil");
  const [newPartPrice, setNewPartPrice] = useState<number | "">("");
  const [newPartScope, setNewPartScope] = useState<"car" | "motorcycle" | "all">("all");

  // Users state
  const [users, setUsers] = useState<User[]>([]);

  // Security Key & Currency State
  const [adminKey, setAdminKey] = useState("");
  const [currency, setCurrency] = useState("PKR");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("gearify_token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetch Admin Data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const authHeaders = getAuthHeaders();
      const timestamp = Date.now();
      const [partsRes, usersRes, keyRes, currRes] = await Promise.all([
        fetch(`/api/parts?t=${timestamp}`, { headers: authHeaders, credentials: "include", cache: "no-store" }),
        fetch(`/api/users?t=${timestamp}`, { headers: authHeaders, credentials: "include", cache: "no-store" }),
        fetch(`/api/settings/admin_key?t=${timestamp}`, { headers: authHeaders, credentials: "include", cache: "no-store" }),
        fetch(`/api/settings/default_currency?t=${timestamp}`, { headers: authHeaders, credentials: "include", cache: "no-store" }),
      ]);

      if (partsRes.ok) {
        const partsData = await partsRes.json();
        setParts(partsData.parts || []);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      if (keyRes.ok) {
        const keyData = await keyRes.json();
        if (keyData.value) {
          setAdminKey(keyData.value);
        }
      }
      if (currRes.ok) {
        const currData = await currRes.json();
        if (currData.value) {
          setCurrency(currData.value);
        }
      }
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Save single item price edit
  const handleSavePartPrice = async (partId: number) => {
    if (editingPrice === "" || Number(editingPrice) < 0) return;
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/parts/${partId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ unit_price: Number(editingPrice) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Failed to update price");

      setParts((prev) =>
        prev.map((p) => (p.id === partId ? { ...p, unit_price: Number(editingPrice) } : p))
      );
      setEditingPartId(null);
      setMessage("Price updated successfully!");
    } catch (err: any) {
      setError(err?.message || "Failed to update price");
    }
  };

  // Add new part
  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName || !newPartBrand || newPartPrice === "") return;
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/parts", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          name: newPartName,
          brand: newPartBrand,
          category: newPartCategory,
          unit_price: Number(newPartPrice),
          vehicle_type_scope: newPartScope,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Failed to add part");

      setParts((prev) => [...prev, data.part]);
      setNewPartName("");
      setNewPartBrand("");
      setNewPartPrice("");
      setMessage("New part added to catalog!");
    } catch (err: any) {
      setError(err?.message || "Failed to add part");
    }
  };

  // Soft delete part
  const handleDeletePart = async (id: number) => {
    if (!confirm("Deactivate this catalog item?")) return;
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/parts/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Failed to delete part");

      setParts((prev) => prev.filter((p) => p.id !== id));
      setMessage("Part deactivated successfully");
    } catch (err: any) {
      setError(err?.message || "Error deleting part");
    }
  };

  // Delete user account
  const handleDeleteUser = async (userId: number, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}?`)) return;
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Delete user failed");

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setMessage(data.message || `User ${email} deleted successfully`);
    } catch (err: any) {
      setError(err?.message || "Failed to delete user");
    }
  };

  // Update Security Key or Currency
  const handleUpdateSetting = async (key: string, value: string) => {
    setError(null);
    setMessage(null);
    if (!value || !value.trim()) {
      setError("Setting value cannot be empty");
      return;
    }
    try {
      const res = await fetch(`/api/settings/${key}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ value: value.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.detail || `Failed to update setting '${key}'`);
      }
      if (key === "admin_key") {
        setAdminKey(data.value || value.trim());
        setMessage("Admin Security Key updated successfully!");
      } else if (key === "default_currency") {
        setCurrency(data.value || value.trim());
        setMessage("Shop Default Currency updated successfully!");
      } else {
        setMessage(`Setting '${key}' updated successfully!`);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update setting");
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
            color: "var(--accent-secondary)",
            backgroundColor: "var(--accent-secondary-muted)",
            borderColor: "var(--accent-secondary-light)",
          }}
        >
          Admin Management Hub
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Shield className="w-6 h-6" style={{ color: "var(--accent-secondary)" }} /> Manager Admin Console
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Item-level parts pricing, user management, and security key settings.
          </p>
        </div>

        <motion.div whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
          <Link
            href="/admin/analytics"
            className="neu-button flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider"
            style={{ color: "var(--accent-secondary)", backgroundColor: "var(--card-bg-solid)" }}
          >
            <TrendingUp className="w-4 h-4" /> Revenue Analytics
          </Link>
        </motion.div>
      </div>

      {message && (
        <div
          className="p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border"
          style={{
            backgroundColor: "var(--status-good-bg)",
            borderColor: "var(--status-good)",
            color: "var(--status-good)",
          }}
        >
          <CheckCircle className="w-4 h-4" /> {message}
        </div>
      )}

      {error && (
        <div
          className="p-3.5 rounded-2xl text-xs font-semibold border flex items-center gap-2"
          style={{
            backgroundColor: "var(--status-danger-bg)",
            borderColor: "var(--status-danger)",
            color: "var(--status-danger)",
          }}
        >
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Admin Sub-navigation Tabs */}
      <div className="flex gap-2 border-b pb-2" style={{ borderColor: "var(--divider)" }}>
        {[
          { id: "parts", label: "Parts Pricing Catalog", icon: DollarSign },
          { id: "users", label: "User Management", icon: Users },
          { id: "security", label: "Security & Currency", icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setMessage(null);
                setError(null);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all border"
              style={{
                backgroundColor: active ? "var(--accent-secondary-muted)" : "transparent",
                color: active ? "var(--accent-secondary)" : "var(--text-secondary)",
                borderColor: active ? "var(--accent-secondary-light)" : "transparent",
              }}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Parts Pricing Management */}
      {activeTab === "parts" && (
        <div className="space-y-6">
          {/* Add New Catalog Part Form */}
          <div
            className="glass-panel rounded-3xl p-6 space-y-4"
            style={{ borderColor: "var(--card-border)" }}
          >
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Plus className="w-4 h-4" style={{ color: "var(--accent-secondary)" }} /> Add New Inventory Part
            </h3>
            <form onSubmit={handleAddPart} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <input
                type="text"
                placeholder="Part Name (e.g. ZIC X9 5W-40)"
                required
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                className="input-field sm:col-span-2 !pl-3"
              />
              <input
                type="text"
                placeholder="Brand (e.g. ZIC)"
                required
                value={newPartBrand}
                onChange={(e) => setNewPartBrand(e.target.value)}
                className="input-field !pl-3"
              />
              <select
                value={newPartCategory}
                onChange={(e) => setNewPartCategory(e.target.value)}
                className="input-field !pl-3 font-bold"
              >
                <option value="engine_oil">Engine Oil</option>
                <option value="air_filter">Air Filter</option>
                <option value="oil_filter">Oil Filter</option>
                <option value="chain_lube">Chain Lube</option>
                <option value="brake_pad">Brake Pad</option>
                <option value="spark_plug">Spark Plug</option>
              </select>
              <input
                type="number"
                placeholder={`Price (${currency})`}
                required
                value={newPartPrice}
                onChange={(e) => setNewPartPrice(e.target.value ? Number(e.target.value) : "")}
                className="input-field !pl-3"
              />
              <button
                type="submit"
                className="sm:col-span-5 neu-button py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
                style={{ color: "var(--accent-secondary)", backgroundColor: "var(--card-bg-solid)" }}
              >
                Add Catalog Part
              </button>
            </form>
          </div>

          {/* Item-Level Price Table */}
          <div className="glass-panel rounded-3xl overflow-hidden shadow-xl" style={{ borderColor: "var(--card-border)" }}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b uppercase font-black" style={{ borderColor: "var(--divider)", backgroundColor: "var(--bg-surface)", color: "var(--text-secondary)" }}>
                  <th className="py-3.5 px-5">Part Description</th>
                  <th className="py-3.5 px-5">Brand</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Unit Price ({currency})</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--divider)" }}>
                {parts.map((p, idx) => {
                  const isEditing = editingPartId === p.id;
                  return (
                    <motion.tr
                      key={p.id}
                      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28, delay: idx * 0.02 }}
                      className="hover:opacity-90 transition-opacity"
                      style={{ borderColor: "var(--divider)" }}
                    >
                      <td className="py-3.5 px-5 font-bold" style={{ color: "var(--text-primary)" }}>
                        {p.name}
                      </td>
                      <td className="py-3.5 px-5 font-semibold" style={{ color: "var(--text-secondary)" }}>{p.brand}</td>
                      <td className="py-3.5 px-5 font-mono text-[11px] font-extrabold uppercase" style={{ color: "var(--accent-secondary)" }}>
                        {p.category.replace("_", " ")}
                      </td>
                      <td className="py-3.5 px-5 font-mono font-black" style={{ color: "var(--status-good)" }}>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(Number(e.target.value))}
                            className="w-24 px-2 py-1 rounded text-xs font-bold border"
                            style={{
                              backgroundColor: "var(--bg-surface)",
                              borderColor: "var(--accent-secondary)",
                              color: "var(--text-primary)",
                            }}
                          />
                        ) : (
                          `${currency} ${p.unit_price.toLocaleString()}`
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        {isEditing ? (
                          <button
                            onClick={() => handleSavePartPrice(p.id)}
                            className="p-1.5 rounded-lg border"
                            style={{
                              backgroundColor: "var(--status-good-bg)",
                              color: "var(--status-good)",
                              borderColor: "var(--status-good)",
                            }}
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingPartId(p.id);
                              setEditingPrice(p.unit_price);
                            }}
                            className="p-1.5 rounded-lg transition-colors border"
                            style={{
                              backgroundColor: "var(--accent-muted)",
                              color: "var(--text-secondary)",
                              borderColor: "var(--card-border)",
                            }}
                            title="Edit price for this single item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePart(p.id)}
                          className="p-1.5 rounded-lg border"
                          style={{
                            backgroundColor: "var(--status-danger-bg)",
                            color: "var(--status-danger)",
                            borderColor: "var(--status-danger)",
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: User Management */}
      {activeTab === "users" && (
        <div className="glass-panel rounded-3xl overflow-hidden" style={{ borderColor: "var(--card-border)" }}>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b uppercase font-bold text-[11px]" style={{ borderColor: "var(--divider)", backgroundColor: "var(--bg-surface)", color: "var(--text-muted)" }}>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Role Claim</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--divider)" }}>
              {users.map((u, idx) => (
                <motion.tr
                  key={u.id}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28, delay: idx * 0.03 }}
                  style={{ borderColor: "var(--divider)" }}
                >
                  <td className="py-4 px-6 font-bold" style={{ color: "var(--text-primary)" }}>{u.name}</td>
                  <td className="py-4 px-6 font-mono" style={{ color: "var(--text-muted)" }}>{u.email}</td>
                  <td className="py-4 px-6">
                    <span
                      className="px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border"
                      style={{
                        backgroundColor: u.role === "admin" ? "var(--accent-secondary-muted)" : "var(--accent-muted)",
                        color: u.role === "admin" ? "var(--accent-secondary)" : "var(--accent)",
                        borderColor: u.role === "admin" ? "var(--accent-secondary-light)" : "var(--accent-light)",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.email)}
                      className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors border"
                      style={{
                        backgroundColor: "var(--status-danger-bg)",
                        color: "var(--status-danger)",
                        borderColor: "var(--status-danger)",
                      }}
                    >
                      Delete Account
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Security Key & Currency Settings */}
      {activeTab === "security" && (
        <div className="glass-panel rounded-3xl p-8 max-w-md mx-auto space-y-6" style={{ borderColor: "var(--card-border)" }}>
          <div className="text-center">
            <Key className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--status-danger)" }} />
            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Admin Security Settings
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Required when registering new admin accounts.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                Current Admin Secret Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="flex-1 input-field !pl-3 font-mono text-center font-bold text-sm"
                  style={{ color: "var(--status-danger)" }}
                />
                <button
                  onClick={() => handleUpdateSetting("admin_key", adminKey)}
                  className="neu-button px-4 py-2.5 rounded-xl text-xs font-bold uppercase"
                  style={{ color: "var(--accent)" }}
                >
                  Save Key
                </button>
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: "var(--divider)" }}>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                Shop Default Currency
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="PKR, USD, EUR..."
                  className="flex-1 input-field !pl-3 font-mono text-center font-bold text-sm"
                />
                <button
                  onClick={() => handleUpdateSetting("default_currency", currency)}
                  className="neu-button px-4 py-2.5 rounded-xl text-xs font-bold uppercase"
                  style={{ color: "var(--accent)" }}
                >
                  Save Currency
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
