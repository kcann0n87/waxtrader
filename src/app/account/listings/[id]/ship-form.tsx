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
      <div className="rounded-md border border-emerald-700/40 bg-emerald-500/10 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-100">
          <Check size={16} /> Marked as shipped
        </div>
        <div className="mt-1 text-xs text-emerald-200">
          {carrier} · <span className="font-mono">{tracking}</span>
        </div>
        <p className="mt-2 text-xs text-emerald-200">
          The buyer was notified. Once they confirm delivery (or 3 days after delivery, whichever
          comes first), funds will be released to your pending balance.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-xs font-semibold text-emerald-300 hover:underline"
        >
          Update tracking
        </button>
        <span className="sr-only">{orderId}</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-white/10 bg-[#101012] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
        <Truck size={16} className="text-white/40" />
        Mark as shipped
      </div>
      <div className="mb-2 text-xs text-white/50">
        Ship by <strong className="text-white/80">{formatDate(needsShipBy)}</strong> to keep your
        seller score in good standing.
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr]">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-white/80">Carrier</span>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full rounded-md border border-white/15 px-3 py-2 text-sm focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          >
            <option value="">Select…</option>
            <option>USPS</option>
            <option>UPS</option>
            <option>FedEx</option>
            <option>DHL</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-white/80">Tracking number</span>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="1Z999AA10123456784"
            className="w-full rounded-md border border-white/15 px-3 py-2 font-mono text-sm focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
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
