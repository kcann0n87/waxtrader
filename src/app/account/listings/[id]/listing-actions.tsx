"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Loader2, Pause, Play, Trash2, X } from "lucide-react";
import {
  endListing,
  pauseListing,
  resumeListing,
  updateListing,
} from "@/app/actions/listings-mgmt";

type Status = "Active" | "Paused" | "Sold" | "Expired";

export function ListingActions({
  listingId,
  currentAsk,
  currentQty,
  currentStatus,
}: {
  listingId: string;
  currentAsk: number;
  currentQty: number;
  currentStatus: Status;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [endConfirm, setEndConfirm] = useState(false);
  const [price, setPrice] = useState(String(currentAsk));
  const [qty, setQty] = useState(String(currentQty));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 2500);
  };

  const submitEdit = () => {
    setError(null);
    const formData = new FormData();
    formData.set("listingId", listingId);
    formData.set("price", price);
    formData.set("quantity", qty);
    startTransition(async () => {
      const r = await updateListing(formData);
      if (r.error) {
        setError(r.error);
        return;
      }
      setEditing(false);
      flash("Saved");
      router.refresh();
    });
  };

  const submitStatus = (action: "pause" | "resume" | "end") => {
    setError(null);
    const formData = new FormData();
    formData.set("listingId", listingId);
    startTransition(async () => {
      let r;
      if (action === "pause") r = await pauseListing(formData);
      else if (action === "resume") r = await resumeListing(formData);
      else r = await endListing(formData);
      if (r.error) {
        setError(r.error);
        return;
      }
      if (action === "end") setEndConfirm(false);
      flash(action === "pause" ? "Paused" : action === "resume" ? "Active again" : "Listing ended");
      router.refresh();
    });
  };

  if (editing) {
    return (
      <div className="mt-4 rounded-md border border-white/10 bg-white/[0.02] p-3">
        <div className="text-xs font-semibold tracking-wider text-white/60 uppercase">
          Edit listing
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[11px] text-white/60">Price</span>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-white/40">$</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/5 py-2 pr-3 pl-7 text-sm text-white focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] text-white/60">Quantity</span>
            <input
              type="number"
              min="1"
              max="100"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
            />
          </label>
        </div>
        {error && (
          <div className="mt-2 rounded border border-rose-700/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200">
            {error}
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <button
            onClick={submitEdit}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-md shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
            Save
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setPrice(String(currentAsk));
              setQty(String(currentQty));
              setError(null);
            }}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-[#101012] px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/[0.02] disabled:opacity-50"
          >
            <X size={11} />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {currentStatus === "Active" && (
          <>
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-white/15 bg-[#101012] px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/[0.02]"
            >
              Edit price / qty
            </button>
            <button
              onClick={() => submitStatus("pause")}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-[#101012] px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/[0.02] disabled:opacity-50"
            >
              <Pause size={11} />
              Pause
            </button>
          </>
        )}
        {currentStatus === "Paused" && (
          <>
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-white/15 bg-[#101012] px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/[0.02]"
            >
              Edit price / qty
            </button>
            <button
              onClick={() => submitStatus("resume")}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded-md border border-emerald-700/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/15 disabled:opacity-50"
            >
              <Play size={11} />
              Resume
            </button>
          </>
        )}
        {(currentStatus === "Active" || currentStatus === "Paused") && (
          <button
            onClick={() => setEndConfirm(true)}
            className="inline-flex items-center gap-1 rounded-md border border-rose-700/50 bg-[#101012] px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10"
          >
            <Trash2 size={11} />
            End listing
          </button>
        )}
        {success && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-emerald-300">
            <Check size={12} />
            {success}
          </span>
        )}
        {error && !success && (
          <span className="ml-auto text-xs text-rose-300">{error}</span>
        )}
      </div>

      {endConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setEndConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#101012] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/5 p-5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 text-rose-400" size={18} />
                <div>
                  <h3 className="font-display text-base font-bold text-white">
                    End this listing?
                  </h3>
                  <p className="mt-0.5 text-xs text-white/60">
                    Your listing comes off the marketplace and can&apos;t be reopened. Active bids
                    on this product stay live for other sellers. (To temporarily hide the listing
                    instead, use Pause — it&apos;s reversible.)
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-5">
              <button
                onClick={() => setEndConfirm(false)}
                disabled={pending}
                className="flex-1 rounded-md border border-white/15 bg-[#101012] px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.02] disabled:opacity-50"
              >
                Keep it
              </button>
              <button
                onClick={() => submitStatus("end")}
                disabled={pending}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                End listing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
