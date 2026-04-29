"use client";

import { useState } from "react";
import { Check, Truck } from "lucide-react";

export function ShipForm({
  orderId,
  initialCarrier,
  initialTracking,
  needsShipBy,
}: {
  orderId: string;
  initialCarrier?: string;
  initialTracking?: string;
  needsShipBy: string;
}) {
  const [carrier, setCarrier] = useState(initialCarrier || "");
  const [tracking, setTracking] = useState(initialTracking || "");
  const [submitted, setSubmitted] = useState(!!initialTracking);

  const valid = carrier && tracking.length >= 8;

  if (submitted) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
          <Check size={16} /> Marked as shipped
        </div>
        <div className="mt-1 text-xs text-emerald-800">
          {carrier} · <span className="font-mono">{tracking}</span>
        </div>
        <p className="mt-2 text-xs text-emerald-800">
          The buyer was notified. Once they confirm delivery (or 3 days after delivery, whichever
          comes first), funds will be released to your pending balance.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-xs font-semibold text-emerald-700 hover:underline"
        >
          Update tracking
        </button>
        <span className="sr-only">{orderId}</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
        <Truck size={16} className="text-slate-400" />
        Mark as shipped
      </div>
      <div className="mb-2 text-xs text-slate-500">
        Ship by <strong className="text-slate-700">{formatDate(needsShipBy)}</strong> to keep your
        seller score in good standing.
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr]">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Carrier</span>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Select…</option>
            <option>USPS</option>
            <option>UPS</option>
            <option>FedEx</option>
            <option>DHL</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Tracking number</span>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="1Z999AA10123456784"
            className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
      </div>

      <button
        disabled={!valid}
        onClick={() => setSubmitted(true)}
        className="mt-3 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Mark as shipped
      </button>
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
