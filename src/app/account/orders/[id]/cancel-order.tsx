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
      <div className="mt-3 rounded-md border border-emerald-700/40 bg-emerald-500/10 p-3 text-sm">
        <div className="flex items-center gap-2 font-bold text-emerald-100">
          <Check size={16} /> Order canceled
        </div>
        <p className="mt-1 text-xs text-emerald-200">
          Refund of ${total.toFixed(2)} will hit your card in 3-5 business days. The seller has been
          notified.
        </p>
        <Link
          href="/account"
          className="mt-2 inline-block text-xs font-semibold text-emerald-300 hover:underline"
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
        className="text-xs font-semibold text-white/50 hover:text-rose-400 hover:underline"
      >
        Cancel order
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-xl bg-[#101012] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-white/5 p-5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 text-rose-400" size={18} />
                <div>
                  <h3 className="text-base font-bold text-white">Cancel order {orderId}?</h3>
                  <p className="mt-0.5 text-xs text-white/50">
                    The seller hasn&apos;t shipped yet, so you&apos;ll get a full refund within 3-5 business
                    days.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-white/40 hover:bg-white/5"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-3 text-sm font-semibold text-white/80">Why are you canceling?</div>
              <ul className="space-y-1.5">
                {reasons.map((r) => (
                  <li key={r}>
                    <button
                      onClick={() => setReason(r)}
                      className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition ${
                        reason === r
                          ? "border-amber-500/40 bg-amber-500/10 text-white"
                          : "border-white/10 bg-[#101012] text-white/80 hover:border-white/15"
                      }`}
                    >
                      <div
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${
                          reason === r ? "border-amber-500/40 bg-indigo-500" : "border-white/15"
                        }`}
                      >
                        {reason === r && <div className="h-1 w-1 rounded-full bg-[#101012]" />}
                      </div>
                      {r}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md border border-white/15 bg-[#101012] px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.02]"
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
