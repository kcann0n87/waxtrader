"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, X } from "lucide-react";

const reasons = [
  "Changed my mind",
  "Found a better price",
  "Ordered by mistake",
  "Took too long to ship",
  "Other",
];

export function CancelOrderButton({ orderId, total }: { orderId: string; total: number }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
        <div className="flex items-center gap-2 font-bold text-emerald-900">
          <Check size={16} /> Order canceled
        </div>
        <p className="mt-1 text-xs text-emerald-800">
          Refund of ${total.toFixed(2)} will hit your card in 3-5 business days. The seller has been
          notified.
        </p>
        <Link
          href="/account"
          className="mt-2 inline-block text-xs font-semibold text-emerald-700 hover:underline"
        >
          Back to orders →
        </Link>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-slate-500 hover:text-rose-600 hover:underline"
      >
        Cancel order
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 text-rose-600" size={18} />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cancel order {orderId}?</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    The seller hasn&apos;t shipped yet, so you&apos;ll get a full refund within 3-5 business
                    days.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-3 text-sm font-semibold text-slate-700">Why are you canceling?</div>
              <ul className="space-y-1.5">
                {reasons.map((r) => (
                  <li key={r}>
                    <button
                      onClick={() => setReason(r)}
                      className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition ${
                        reason === r
                          ? "border-indigo-500 bg-indigo-50/50 text-slate-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${
                          reason === r ? "border-indigo-500 bg-indigo-500" : "border-slate-300"
                        }`}
                      >
                        {reason === r && <div className="h-1 w-1 rounded-full bg-white" />}
                      </div>
                      {r}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Keep order
                </button>
                <button
                  disabled={!reason}
                  onClick={() => {
                    setConfirmed(true);
                    setOpen(false);
                  }}
                  className="flex-1 rounded-md bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancel & refund ${total.toFixed(0)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
