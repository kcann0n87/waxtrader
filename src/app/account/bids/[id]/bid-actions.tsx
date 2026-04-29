"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ShoppingBag, Trash2, X } from "lucide-react";
import { formatUSD, formatUSDFull } from "@/lib/utils";

export function BidActions({
  bidId,
  currentPrice,
  lowestAsk,
  highestBid,
  skuSlug,
}: {
  bidId: string;
  currentPrice: number;
  lowestAsk: number | null;
  highestBid: number | null;
  skuSlug: string;
}) {
  const [editing, setEditing] = useState(false);
  const [newPrice, setNewPrice] = useState(String(currentPrice));
  const [saved, setSaved] = useState<"raised" | "canceled" | null>(null);

  const newPriceNum = parseFloat(newPrice) || 0;
  const meetsAsk = lowestAsk !== null && newPriceNum >= lowestAsk;

  if (saved === "canceled") {
    return (
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Check size={16} className="text-emerald-600" /> Bid canceled
        </div>
        <p className="mt-1 text-xs text-slate-600">
          Bid {bidId} was canceled. Your card won&apos;t be charged.
        </p>
        <Link
          href="/account"
          className="mt-3 inline-block rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
        >
          Back to account
        </Link>
      </div>
    );
  }

  if (saved === "raised") {
    return (
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
          <Check size={16} /> Bid raised to {formatUSDFull(newPriceNum)}
        </div>
        <p className="mt-1 text-xs text-emerald-800">
          {meetsAsk
            ? "This met the lowest ask — your card was charged and the order is being processed."
            : "Your new bid is now live. We'll notify you if a seller accepts or someone outbids you."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-base font-bold text-slate-900">Manage bid</h3>

      {!editing ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Raise bid
          </button>
          <Link
            href={`/product/${skuSlug}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ShoppingBag size={14} />
            View listings
          </Link>
          <button
            onClick={() => {
              if (confirm("Cancel this bid? Your card won't be charged.")) {
                setSaved("canceled");
              }
            }}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            <Trash2 size={14} />
            Cancel bid
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="New bid">
              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full rounded-md border border-slate-300 py-2 pr-3 pl-7 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </Field>
            <div className="flex items-end gap-2">
              <button
                disabled={newPriceNum <= currentPrice}
                onClick={() => setSaved("raised")}
                className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {meetsAsk ? `Buy ${formatUSD(newPriceNum)}` : "Raise"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setNewPrice(String(currentPrice));
                }}
                className="rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50"
                aria-label="Cancel"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {newPriceNum <= currentPrice
              ? `New bid must be above your current ${formatUSD(currentPrice)}.`
              : highestBid !== null && newPriceNum > highestBid
                ? `You'll be the new top bidder.`
                : meetsAsk
                  ? `This meets the lowest ask — buying instantly.`
                  : `Your bid will be placed at ${formatUSD(newPriceNum)}.`}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
