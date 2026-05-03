"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, DollarSign, Loader2, X } from "lucide-react";
import { sellerPartialRefund } from "@/app/actions/orders";

const QUICK_AMOUNTS = [5, 10, 20, 50];

const REASONS = [
  "Box arrived dented",
  "Shipping took longer than promised",
  "Compensating buyer for inconvenience",
  "Goodwill gesture",
  "Other",
];

/**
 * Seller-only: partial refund modal for orders in escrow. Lets the
 * seller comp the buyer some amount without going through a full
 * dispute. The amount comes out of the seller's eventual transfer
 * (releaseOrderToSeller subtracts partial_refund_cents before
 * computing the platform fee + transfer).
 *
 * Constraints enforced server-side:
 *   - Seller must own the order
 *   - Order must be paid + not yet released
 *   - Cumulative refund can't exceed price_cents (item only — shipping
 *     line isn't refundable here, that's a Stripe-direct call admins do)
 *   - Reason must be >= 6 chars
 */
export function PartialRefundButton({
  orderId,
  itemPrice,
  alreadyRefundedCents,
}: {
  orderId: string;
  itemPrice: number; // dollars
  alreadyRefundedCents: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const maxRefundable = itemPrice - alreadyRefundedCents / 100;
  const amountNum = parseFloat(amount) || 0;
  const canSubmit = !pending && amountNum > 0 && amountNum <= maxRefundable && reason.trim().length >= 6;

  if (success !== null) {
    return (
      <div className="rounded-md border border-emerald-700/40 bg-emerald-500/10 p-3 text-sm">
        <div className="flex items-center gap-2 font-bold text-emerald-100">
          <Check size={16} /> Refund issued
        </div>
        <p className="mt-1 text-xs text-emerald-200">
          ${success.toFixed(2)} returned to the buyer&apos;s card. Your final
          payout will be reduced by this amount.
        </p>
      </div>
    );
  }

  const submit = () => {
    if (!canSubmit) return;
    setError(null);
    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("amount", String(amountNum));
    formData.set("reason", reason.trim());
    startTransition(async () => {
      const result = await sellerPartialRefund(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(amountNum);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-amber-700/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/20"
      >
        <DollarSign size={12} />
        Issue partial refund
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
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Issue partial refund
                </h3>
                <p className="mt-0.5 text-xs text-white/50">
                  Comes out of your payout. Max ${maxRefundable.toFixed(2)} (item
                  price{alreadyRefundedCents > 0 && ` minus the $${(alreadyRefundedCents / 100).toFixed(2)} you already refunded`}).
                </p>
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
              <div>
                <label htmlFor="refund-amount" className="mb-1.5 block text-sm font-semibold text-white/80">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-white/60">$</span>
                  <input
                    id="refund-amount"
                    type="number"
                    min="0"
                    max={maxRefundable}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-md border border-white/10 bg-white/5 py-2.5 pr-3 pl-7 text-sm text-white placeholder:text-white/50 focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_AMOUNTS.filter((q) => q <= maxRefundable).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(String(q))}
                      className="rounded border border-white/10 bg-[#101012] px-2 py-1 text-[11px] font-semibold text-white/70 transition hover:border-amber-400/40 hover:text-amber-300"
                    >
                      ${q}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmount(maxRefundable.toFixed(2))}
                    className="rounded border border-white/10 bg-[#101012] px-2 py-1 text-[11px] font-semibold text-white/70 transition hover:border-amber-400/40 hover:text-amber-300"
                  >
                    Max (${maxRefundable.toFixed(2)})
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="refund-reason" className="mb-1.5 block text-sm font-semibold text-white/80">
                  Reason (visible to buyer)
                </label>
                <select
                  id="refund-reason"
                  value={REASONS.includes(reason) ? reason : ""}
                  onChange={(e) => setReason(e.target.value)}
                  className="mb-2 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:bg-white/10 focus:outline-none"
                >
                  <option value="">Pick a preset…</option>
                  {REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Or write your own…"
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
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
                  Cancel
                </button>
                <button
                  disabled={!canSubmit}
                  onClick={submit}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {pending ? <Loader2 size={14} className="animate-spin" /> : null}
                  Refund ${amountNum.toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
