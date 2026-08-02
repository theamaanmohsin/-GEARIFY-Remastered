"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ServicePart, User } from "../types";
import { Shield, DollarSign, Users, Key, Plus, Edit2, Save, Trash2, ArrowLeft, CheckCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function AdminConsolePage() {
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

  // Fetch Admin Data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [partsRes, usersRes, keyRes, currRes] = await Promise.all([
        fetch("/api/parts"),
        fetch("/api/users"),
        fetch("/api/settings/admin_key"),
        fetch("/api/settings/default_currency"),
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
        setAdminKey(keyData.value || "GearifyAPMS");
      }
      if (currRes.ok) {
        const currData = await currRes.json();
        setCurrency(currData.value || "PKR");
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

  // Save single item price edit (spec §5: admin opens one part & edits price alone)
  const handleSavePartPrice = async (partId: number) => {
    if (editingPrice === "" || Number(editingPrice) < 0) return;
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/parts/${partId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unit_price: Number(editingPrice) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update price");

      setParts((prev) =>
        prev.map((p) => (p.id === partId ? { ...p, unit_price: Number(editingPrice) } : p))
      );
      setEditingPartId(null);
      setMessage("Price updated successfully!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Add new part
  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName || !newPartBrand || newPartPrice === "") return;

    try {
      const res = await fetch("/api/parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPartName,
          brand: newPartBrand,
          category: newPartCategory,
          unit_price: Number(newPartPrice),
          vehicle_type_scope: newPartScope,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add part");

      setParts((prev) => [...prev, data.part]);
      setNewPartName("");
      setNewPartBrand("");
      setNewPartPrice("");
      setMessage("New part added to catalog!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Soft delete part
  const handleDeletePart = async (id: number) => {
    if (!confirm("Deactivate this catalog item?")) return;
    try {
      const res = await fetch(`/api/parts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setParts((prev) => prev.filter((p) => p.id !== id));
        setMessage("Part deactivated");
      }
    } catch (err) {
      setError("Error deleting part");
    }
  };

  // Delete user account
  const handleDeleteUser = async (userId: number, email: string) => {
    if (!confirm(`Delete user ${email}?`)) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete user failed");

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setMessage(`User ${email} deleted`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Update Security Key or Currency
  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      const res = await fetch(`/api/settings/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (res.ok) {
        setMessage(`Setting '${key}' updated successfully!`);
      }
    } catch (err) {
      setError("Failed to update setting");
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
        <span className="text-xs font-medium text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
          Admin Management Hub
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-500" /> Manager Admin Console
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Item-level parts pricing, user management, and security key settings.
          </p>
        </div>

        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/admin/analytics"
            className="neu-button flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider"
          >
            <TrendingUp className="w-4 h-4" /> Revenue Analytics
          </Link>
        </motion.div>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {message}
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Admin Sub-navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200/50 dark:border-white/10 pb-2">
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                active
                  ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                  : "text-gray-500 hover:bg-gray-500/10"
              }`}
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
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-500" /> Add New Inventory Part
            </h3>
            <form onSubmit={handleAddPart} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <input
                type="text"
                placeholder="Part Name (e.g. ZIC X9 5W-40)"
                required
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-gray-500/5 border border-gray-200/50 dark:border-white/10 text-xs"
              />
              <input
                type="text"
                placeholder="Brand (e.g. ZIC)"
                required
                value={newPartBrand}
                onChange={(e) => setNewPartBrand(e.target.value)}
                className="px-3 py-2 rounded-xl bg-gray-500/5 border border-gray-200/50 dark:border-white/10 text-xs"
              />
              <select
                value={newPartCategory}
                onChange={(e) => setNewPartCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-gray-500/5 border border-gray-200/50 dark:border-white/10 text-xs"
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
                className="px-3 py-2 rounded-xl bg-gray-500/5 border border-gray-200/50 dark:border-white/10 text-xs font-bold"
              />
              <button
                type="submit"
                className="sm:col-span-5 neu-button py-2 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider"
              >
                Add Catalog Part
              </button>
            </form>
          </div>

          {/* Item-Level Price Table */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-white/10 bg-gray-500/5 uppercase text-gray-500">
                  <th className="py-3 px-5">Part Description</th>
                  <th className="py-3 px-5">Brand</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Unit Price ({currency})</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                {parts.map((p) => {
                  const isEditing = editingPartId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-white/5">
                      <td className="py-3 px-5 font-semibold text-gray-900 dark:text-white">
                        {p.name}
                      </td>
                      <td className="py-3 px-5 text-gray-400">{p.brand}</td>
                      <td className="py-3 px-5 font-mono text-[11px] text-purple-500 uppercase">
                        {p.category.replace("_", " ")}
                      </td>
                      <td className="py-3 px-5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(Number(e.target.value))}
                            className="w-24 px-2 py-1 rounded bg-gray-500/20 border border-purple-500 text-xs font-bold"
                          />
                        ) : (
                          `${currency} ${p.unit_price.toLocaleString()}`
                        )}
                      </td>
                      <td className="py-3 px-5 text-right space-x-2">
                        {isEditing ? (
                          <button
                            onClick={() => handleSavePartPrice(p.id)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingPartId(p.id);
                              setEditingPrice(p.unit_price);
                            }}
                            className="p-1.5 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-purple-500/20 hover:text-purple-400"
                            title="Edit price for this single item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePart(p.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: User Management */}
      {activeTab === "users" && (
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-white/10 bg-gray-500/5 uppercase text-gray-500">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Role Claim</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">{u.name}</td>
                  <td className="py-4 px-6 text-gray-400 font-mono">{u.email}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border ${
                        u.role === "admin"
                          ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                          : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.email)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-semibold text-xs transition-colors"
                    >
                      Delete Account
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Security Key & Currency Settings */}
      {activeTab === "security" && (
        <div className="glass-panel rounded-3xl p-8 max-w-md mx-auto space-y-6">
          <div className="text-center">
            <Key className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Admin Security Settings
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Required when registering new admin accounts.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Current Admin Secret Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-500/5 border border-gray-200/50 dark:border-white/10 font-mono text-center font-bold text-rose-500 text-sm"
                />
                <button
                  onClick={() => handleUpdateSetting("admin_key", adminKey)}
                  className="neu-button px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-500 uppercase"
                >
                  Save Key
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200/50 dark:border-white/10">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Shop Default Currency
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="PKR, USD, EUR..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-500/5 border border-gray-200/50 dark:border-white/10 font-mono text-center font-bold text-sm"
                />
                <button
                  onClick={() => handleUpdateSetting("default_currency", currency)}
                  className="neu-button px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-500 uppercase"
                >
                  Save Currency
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
