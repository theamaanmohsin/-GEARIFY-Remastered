"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Wrench, Printer, ArrowLeft, ShieldCheck, Camera } from "lucide-react";
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
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [photos, setPhotos] = useState<ServicePhoto[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass-panel rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto animate-pulse">
            <Wrench className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-sm text-gray-400 font-medium">Generating printable digital receipt...</p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold">Receipt Not Found</h2>
        <Link
          href="/"
          className="neu-button inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-500"
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
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>
        <button
          onClick={() => window.print()}
          className="neu-button flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider"
        >
          <Printer className="w-4 h-4" /> Print Receipt
        </button>
      </div>

      {/* Printable Receipt Paper Container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 border border-white/20 print:border-none print:shadow-none print:bg-white print:text-black"
      >
        {/* Receipt Header */}
        <div className="text-center border-b border-gray-200/50 dark:border-white/10 pb-6 print:border-black">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg print:hidden">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-wider uppercase text-gray-900 dark:text-white print:text-black">
            GEARIFY APMS
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest mt-0.5 print:text-black">
            Official Maintenance Receipt
          </p>
        </div>

        {/* Receipt Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400 uppercase tracking-wider block text-[10px]">Date & Time</span>
            <span className="font-semibold text-gray-900 dark:text-white print:text-black">{receipt.date}</span>
          </div>
          <div>
            <span className="text-gray-400 uppercase tracking-wider block text-[10px]">Serviced By</span>
            <span className="font-semibold text-gray-900 dark:text-white print:text-black">{receipt.mechanic_name}</span>
          </div>
          <div>
            <span className="text-gray-400 uppercase tracking-wider block text-[10px]">Registration Plate</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white uppercase print:text-black">
              {receipt.reg_no}
            </span>
          </div>
          <div>
            <span className="text-gray-400 uppercase tracking-wider block text-[10px]">Vehicle Specs</span>
            <span className="font-semibold text-gray-900 dark:text-white print:text-black">{receipt.car}</span>
          </div>
        </div>

        {/* Line Items Table — only shows parts that were actually replaced */}
        <div className="pt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-white/10 uppercase tracking-wider text-gray-400 text-[10px] print:border-black">
                <th className="py-2">Item Description</th>
                <th className="py-2 text-right">Price ({receipt.currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/30 dark:divide-white/5 print:divide-black">
              {receipt.parts.length > 0 ? (
                receipt.parts.map((p, i) => (
                  <tr key={i}>
                    <td className="py-3 font-medium text-gray-800 dark:text-gray-200 print:text-black">
                      {p.name}
                    </td>
                    <td className="py-3 text-right font-mono font-semibold text-gray-900 dark:text-white print:text-black">
                      {p.price.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="py-3 text-gray-400 italic">
                    No parts replaced during this service visit.
                  </td>
                </tr>
              )}

              {receipt.labor_cost > 0 && (
                <tr>
                  <td className="py-3 font-medium text-gray-800 dark:text-gray-200 print:text-black">
                    Labor Charge
                  </td>
                  <td className="py-3 text-right font-mono font-semibold text-gray-900 dark:text-white print:text-black">
                    {receipt.labor_cost.toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total Cost Summary Bar */}
        <div className="pt-4 border-t-2 border-dashed border-gray-200/60 dark:border-white/10 flex items-center justify-between print:border-black">
          <span className="font-extrabold uppercase tracking-wider text-sm text-gray-900 dark:text-white print:text-black">
            Grand Total
          </span>
          <span className="font-mono text-xl font-black text-indigo-600 dark:text-indigo-400 print:text-black">
            {receipt.currency} {receipt.total_cost.toLocaleString()}
          </span>
        </div>

        {/* Predictive Maintenance Banner */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1 print:border-black print:bg-gray-100">
          <div className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1.5 print:text-black">
            <ShieldCheck className="w-4 h-4" /> Next Service Due Mileage
          </div>
          <div className="font-mono text-lg font-black text-emerald-700 dark:text-emerald-300 print:text-black">
            {receipt.next_service_km.toLocaleString()} KM
          </div>
        </div>

        {receipt.notes && (
          <div className="text-xs text-gray-500 italic border-t border-gray-200/50 dark:border-white/10 pt-3">
            <strong>Notes:</strong> {receipt.notes}
          </div>
        )}

        {/* Before/After Photo Log — §8.4 */}
        {photos.length > 0 && (
          <div className="border-t border-gray-200/50 dark:border-white/10 pt-4 space-y-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Camera className="w-4 h-4" /> Service Photo Documentation
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {beforePhotos.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Before</span>
                  <div className="flex gap-2 flex-wrap">
                    {beforePhotos.map((p) => (
                      <img
                        key={p.id}
                        src={p.url}
                        alt="Before service"
                        className="w-24 h-24 object-cover rounded-xl border border-white/10"
                      />
                    ))}
                  </div>
                </div>
              )}
              {afterPhotos.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">After</span>
                  <div className="flex gap-2 flex-wrap">
                    {afterPhotos.map((p) => (
                      <img
                        key={p.id}
                        src={p.url}
                        alt="After service"
                        className="w-24 h-24 object-cover rounded-xl border border-white/10"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QR Vehicle Passport — §8.1 */}
        <div className="border-t border-gray-200/50 dark:border-white/10 pt-4 flex flex-col items-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
            Scan QR for Vehicle Service Passport
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/vehicles/${encodeURIComponent(receipt.reg_no)}/qr`}
            alt={`QR code for ${receipt.reg_no}`}
            className="w-28 h-28 rounded-xl border border-white/10 print:border-black"
            onError={(e) => {
              // Hide QR if generation fails (library not installed)
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="text-[9px] text-gray-400 font-mono">{receipt.reg_no}</span>
        </div>

        <div className="text-center text-[10px] text-gray-400 uppercase tracking-widest pt-4">
          Thank you for servicing with GEARIFY APMS
        </div>
      </motion.div>
    </div>
  );
}
