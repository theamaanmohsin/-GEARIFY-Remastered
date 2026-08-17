"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Wrench, Printer, ShieldCheck, Camera } from "lucide-react";
import Link from "next/link";

interface ReceiptData {
  id: number;
  date: string;
  mechanic_name: string;
  reg_no: string;
  car: string;
  vehicle_type: string;
  km_at_service: number;
  next_service_km: number;
  parts: { name: string; price: number }[];
  labor_cost: number;
  total_cost: number;
  currency: string;
  notes?: string;
}

interface ServicePhoto {
  id: number;
  url: string;
  type: "before" | "after";
  uploaded_at: string;
}

export default function ReceiptPage() {
  const params = useParams();
  const reduceMotion = useReducedMotion();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [photos, setPhotos] = useState<ServicePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [qrFailed, setQrFailed] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    const fetchReceipt = async () => {
      try {
        const [receiptRes, photosRes] = await Promise.all([
          fetch(`/api/services/${params.id}`),
          fetch(`/api/services/${params.id}/photos`),
        ]);

        if (receiptRes.ok) {
          const data = await receiptRes.json();
          setReceipt(data.receipt);
        }

        if (photosRes.ok) {
          const photoData = await photosRes.json();
          setPhotos(photoData.photos || []);
        }
      } catch (err) {
        console.error("Failed to load receipt:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [params.id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, photoType: "before" | "after") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("photo_type", photoType);

      const res = await fetch(`/api/services/${params.id}/photos`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Upload failed");

      // Refresh photos list
      const photosRes = await fetch(`/api/services/${params.id}/photos`);
      if (photosRes.ok) {
        const photoData = await photosRes.json();
        setPhotos(photoData.photos || []);
      }
    } catch (err: any) {
      setUploadError(err?.message || "Failed to upload photo");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <div className="glass-panel relative overflow-hidden rounded-3xl p-10 space-y-6" style={{ borderColor: "var(--card-border)" }}>
          <div className="absolute inset-0 animate-shimmer" />
          <div className="w-12 h-12 rounded-2xl mx-auto" style={{ backgroundColor: "var(--bg-surface)" }} />
          <div className="h-6 w-48 rounded mx-auto" style={{ backgroundColor: "var(--bg-surface)" }} />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 rounded" style={{ backgroundColor: "var(--bg-surface)" }} />
            <div className="h-10 rounded" style={{ backgroundColor: "var(--bg-surface)" }} />
          </div>
          <div className="h-32 rounded" style={{ backgroundColor: "var(--bg-surface)" }} />
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Receipt Not Found</h2>
        <Link
          href="/"
          className="neu-button inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
          style={{ color: "var(--accent)", backgroundColor: "var(--card-bg-solid)" }}
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const beforePhotos = photos.filter((p) => p.type === "before");
  const afterPhotos = photos.filter((p) => p.type === "after");

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Top Action Bar (Hidden during printing) */}
      <div className="print:hidden flex items-center justify-between">
        <Link
          href="/services/history"
          className="btn-ghost px-4 py-2 text-xs font-semibold"
        >
          Back to History
        </Link>
        <button
          onClick={() => window.print()}
          className="neu-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--accent)", backgroundColor: "var(--card-bg-solid)" }}
        >
          <Printer className="w-4 h-4" /> Print Receipt
        </button>
      </div>

      {/* Photo Upload Panel (Hidden during printing) */}
      <div className="print:hidden glass-panel rounded-2xl p-5 space-y-4" style={{ borderColor: "var(--card-border)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>
            <Camera className="w-4 h-4" style={{ color: "var(--accent)" }} />
            Attach Service Photos
          </div>
          {uploading && (
            <span className="text-[11px] font-semibold animate-pulse" style={{ color: "var(--accent)" }}>
              Uploading...
            </span>
          )}
        </div>

        {uploadError && (
          <p className="text-xs font-semibold" style={{ color: "var(--status-danger)" }}>{uploadError}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-xs font-bold"
            style={{
              borderColor: "var(--status-warning)",
              color: "var(--status-warning)",
              backgroundColor: "var(--status-warning-bg)",
            }}
          >
            <Camera className="w-4 h-4" /> Upload Before Photo
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => handlePhotoUpload(e, "before")}
              className="hidden"
            />
          </label>
          <label
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-xs font-bold"
            style={{
              borderColor: "var(--status-good)",
              color: "var(--status-good)",
              backgroundColor: "var(--status-good-bg)",
            }}
          >
            <Camera className="w-4 h-4" /> Upload After Photo
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => handlePhotoUpload(e, "after")}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Attach before/after inspection photos to document the work performed.
        </p>
      </div>

      {/* Printable Receipt Paper Container */}
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }}
        className="glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 border print:border-none print:shadow-none print:bg-white print:text-black"
        style={{ borderColor: "var(--card-border)" }}
      >
        {/* Receipt Header */}
        <div className="text-center border-b pb-6 print:border-black" style={{ borderColor: "var(--divider)" }}>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg print:hidden text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Wrench className="w-6 h-6 text-[#85898e]" />
          </div>
          <h1 className="text-2xl font-black tracking-wider uppercase print:text-black" style={{ color: "var(--text-primary)" }}>
            GEARIFY REMASTERED APMS
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-0.5 print:text-black" style={{ color: "var(--text-secondary)" }}>
            Official Maintenance Receipt
          </p>
        </div>

        {/* Receipt Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold uppercase tracking-wider block text-[10px]" style={{ color: "var(--text-muted)" }}>Date & Time</span>
            <span className="font-bold print:text-black" style={{ color: "var(--text-primary)" }}>{receipt.date}</span>
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider block text-[10px]" style={{ color: "var(--text-muted)" }}>Serviced By</span>
            <span className="font-bold print:text-black" style={{ color: "var(--text-primary)" }}>{receipt.mechanic_name}</span>
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider block text-[10px]" style={{ color: "var(--text-muted)" }}>Registration Plate</span>
            <span className="font-mono font-black uppercase print:text-black" style={{ color: "var(--text-primary)" }}>
              {receipt.reg_no}
            </span>
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider block text-[10px]" style={{ color: "var(--text-muted)" }}>Vehicle Specs</span>
            <span className="font-bold print:text-black" style={{ color: "var(--text-primary)" }}>{receipt.car}</span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="pt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b uppercase tracking-wider font-black text-[10px] print:border-black" style={{ borderColor: "var(--divider)", color: "var(--text-secondary)" }}>
                <th className="py-2">Item Description</th>
                <th className="py-2 text-right">Price ({receipt.currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y print:divide-black" style={{ borderColor: "var(--divider)" }}>
              {receipt.parts.length > 0 ? (
                receipt.parts.map((p, i) => (
                  <tr key={i}>
                    <td className="py-3 font-bold print:text-black" style={{ color: "var(--text-primary)" }}>
                      {p.name}
                    </td>
                    <td className="py-3 text-right font-mono font-bold print:text-black" style={{ color: "var(--text-primary)" }}>
                      {p.price.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="py-3 italic" style={{ color: "var(--text-muted)" }}>
                    No parts replaced during this service visit.
                  </td>
                </tr>
              )}

              {receipt.labor_cost > 0 && (
                <tr>
                  <td className="py-3 font-bold print:text-black" style={{ color: "var(--text-primary)" }}>
                    Labor Charge
                  </td>
                  <td className="py-3 text-right font-mono font-bold print:text-black" style={{ color: "var(--text-primary)" }}>
                    {receipt.labor_cost.toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total Cost Summary Bar */}
        <div className="pt-4 border-t-2 border-dashed flex items-center justify-between print:border-black" style={{ borderColor: "var(--divider-strong)" }}>
          <span className="font-black uppercase tracking-wider text-sm print:text-black" style={{ color: "var(--text-primary)" }}>
            Grand Total
          </span>
          <span className="font-mono text-xl font-black print:text-black" style={{ color: "var(--accent)" }}>
            {receipt.currency} {receipt.total_cost.toLocaleString()}
          </span>
        </div>

        {/* Predictive Maintenance Banner */}
        <div
          className="p-4 rounded-2xl text-center space-y-1 print:border-black print:bg-gray-100 border"
          style={{
            backgroundColor: "var(--status-good-bg)",
            borderColor: "var(--status-good)",
          }}
        >
          <div className="text-[11px] uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 print:text-black" style={{ color: "var(--status-good)" }}>
            <ShieldCheck className="w-4 h-4" /> Next Service Due Mileage
          </div>
          <div className="font-mono text-lg font-black print:text-black" style={{ color: "var(--status-good)" }}>
            {receipt.next_service_km.toLocaleString()} KM
          </div>
        </div>

        {receipt.notes && (
          <div className="text-xs italic border-t pt-3" style={{ borderColor: "var(--divider)", color: "var(--text-secondary)" }}>
            <strong>Notes:</strong> {receipt.notes}
          </div>
        )}

        {/* Before/After Photo Log */}
        {photos.length > 0 && (
          <div className="border-t pt-4 space-y-3" style={{ borderColor: "var(--divider)" }}>
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <Camera className="w-4 h-4" /> Service Photo Documentation
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {beforePhotos.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--status-warning)" }}>Before</span>
                  <div className="flex gap-2 flex-wrap">
                    {beforePhotos.map((p) => (
                      <img
                        key={p.id}
                        src={p.url}
                        alt="Before service"
                        className="w-24 h-24 object-cover rounded-xl border"
                        style={{ borderColor: "var(--card-border)" }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {afterPhotos.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--status-good)" }}>After</span>
                  <div className="flex gap-2 flex-wrap">
                    {afterPhotos.map((p) => (
                      <img
                        key={p.id}
                        src={p.url}
                        alt="After service"
                        className="w-24 h-24 object-cover rounded-xl border"
                        style={{ borderColor: "var(--card-border)" }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QR Vehicle Passport */}
        <div className="border-t pt-4 flex flex-col items-center space-y-2" style={{ borderColor: "var(--divider)" }}>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
            Scan QR for Vehicle Service Passport
          </span>
          {qrFailed ? (
            <Link
              href={`/track/${encodeURIComponent(receipt.reg_no)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-28 h-28 rounded-xl border border-dashed flex flex-col items-center justify-center text-center gap-1 transition-colors"
              style={{
                borderColor: "var(--accent)",
                backgroundColor: "var(--accent-muted)",
              }}
            >
              <span className="text-2xl">📱</span>
              <span className="text-[9px] font-bold px-1 leading-tight" style={{ color: "var(--accent)" }}>
                View Passport
              </span>
            </Link>
          ) : (
            <img
              src={`/api/vehicles/${encodeURIComponent(receipt.reg_no)}/qr`}
              alt={`QR code for ${receipt.reg_no}`}
              className="w-28 h-28 rounded-xl border bg-white p-1 print:border-black"
              style={{ borderColor: "var(--card-border)" }}
              onError={() => setQrFailed(true)}
            />
          )}
          <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>{receipt.reg_no}</span>
        </div>

        <div className="text-center text-[10px] uppercase tracking-widest pt-4" style={{ color: "var(--text-muted)" }}>
          Thank you for servicing with GEARIFY APMS
        </div>
      </motion.div>
    </div>
  );
}
