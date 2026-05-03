"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Loader2, X } from "lucide-react";
import { cancelOrder } from "@/app/actions/orders";

const BUYER_REASONS = [
  "Changed my mind",
  "Found a better price",
  "Ordered by mistake",
  "Took too long to ship",
  "Other",
];

const SELLER_REASONS = [
  "Out of stock — listing was a mistake",
  "Damaged in storage / can't fulfill",
  "Buyer hasn't paid (bid not converted)",
  "Buyer asked me to cancel",
  "Other",
];

/**
 * Cancel-order UI shown on the order detail page. Two flows:
 *
 *   - Buyer: pick a reason, hit Cancel & Refund.
 *
 *   - Seller: first attest who initiated (Buyer-requested vs Seller-
 *     initiated), then pick a reason. The attribution maps to
 *     `canceled_by` in the DB and the tier-recompute cron uses it to
 *     gate promotions (>2 seller-initiated cancels in 30d blocks
 *     tier-up). A seller-marked Buyer-requested cancel does NOT count
 *     against the cap — but the choice is logged as a seller attestation
 *     so abuse can be audited.
 */
export function CancelOrderButton({
  orderId,
  total,
  isSeller = false,
}: {
  orderId: string;
  total: number;
  isSeller?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [canceledBy, setCanceledBy] = useState<"" | "buyer" | "seller">(
    isSeller ? "" : "buyer",
  );
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [pending, startTransition] = useTransition();

  const reasonOptions = isSeller ? SELLER_REASONS : BUYER_REASONS;
  const needsAttribution = isSeller;
  const canSubmit =
    !pending && !!reason && (!needsAttribution || canceledBy !== "");

  if (confirmed) {
    return (
      <div className="mt-3 rounded-md border border-emerald-700/40 bg-emerald-500/10 p-3 text-sm">
        <div className="flex items-center gap-2 font-bold text-emerald-100">
          <Check size={16} /> Order canceled
        </div>
        <p className="mt-1 text-xs text-emerald-200">
          {isSeller
            ? "Buyer notified, full refund processed."
            : `Refund of $${total.toFixed(2)} processes within 3-5 business days. Seller notified.`}
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

  const submit = () => {
    if (!canSubmit) return;
    setError(null);
    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("reason", reason);
    if (canceledBy) formData.set("canceledBy", canceledBy);
    startTransition(async () => {
      const result = await cancelOrder(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setConfirmed(true);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-white/50 transition hover:text-rose-400 hover:underline"
      >
        Cancel order
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#101012] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-white/5 p-5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 text-rose-400" size={18} />
                <div>
                  <h3 className="font-display text-base font-bold text-white">
                    Cancel order {orderId}?
                  </h3>
                  <p className="mt-0.5 text-xs text-white/50">
                    {isSeller
                      ? "Full refund will be issued to the buyer immediately. Frequent seller-initiated cancels block tier upgrades."
                      : "The seller hasn't shipped yet. Triggers a full refund within 3-5 business days."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-white/60 transition hover:bg-white/5"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* Seller-only: who initiated this cancellation? */}
              {needsAttribution && (
                <div>
                  <label
                    htmlFor="cancel-by"
                    className="mb-1.5 block text-sm font-semibold text-white/80"
                  >
                    Who initiated this cancellation?
                  </label>
                  <select
                    id="cancel-by"
                    value={canceledBy}
                    onChange={(e) =>
                      setCanceledBy(e.target.value as "" | "buyer" | "seller")
                    }
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  >
                    <option value="">Select…</option>
                    <option value="buyer">
                      Buyer requested it (doesn&apos;t count against tier)
                    </option>
                    <option value="seller">
                      I&apos;m initiating it (counts toward tier cap)
                    </option>
                  </select>
                  {canceledBy === "buyer" && (
                    <p className="mt-1.5 text-[11px] text-amber-300/80">
                      You&apos;re attesting the buyer asked you to cancel. Misuse
                      will result in a tier penalty + admin review.
                    </p>
                  )}
                </div>
              )}

              <div>
                <div className="mb-2 text-sm font-semibold text-white/80">
                  Reason
                </div>
                <ul className="space-y-1.5">
                  {reasonOptions.map((r) => (
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
                            reason === r
                              ? "border-amber-400 bg-amber-400"
                              : "border-white/15"
                          }`}
                        >
                          {reason === r && (
                            <div className="h-1 w-1 rounded-full bg-slate-900" />
                          )}
                        </div>
                        {r}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {error && (
                <div className="rounded border border-rose-700/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="flex-1 rounded-md border border-white/15 bg-[#101012] px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.02] disabled:opacity-50"
                >
                  Keep order
                </button>
                <button
                  disabled={!canSubmit}
                  onClick={submit}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {pending ? <Loader2 size={14} className="animate-spin" /> : null}
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
