"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { updateListing } from "@/app/actions/listings-mgmt";
import { formatUSDFull } from "@/lib/utils";

/**
 * Inline price editor for the /account/listings table. Renders as the
 * existing amber price by default; click it (or the pencil on hover)
 * to swap to an input + save/cancel pair. Calls updateListing with
 * the existing quantity unchanged so we only touch price_cents.
 *
 * Disabled for non-active/paused listings — Sold and Expired rows
 * just render the price as static text.
 */
export function EditablePriceCell({
  listingId,
  price,
  qty,
  status,
}: {
  listingId: string;
  price: number;
  qty: number;
  status: "Active" | "Sold" | "Paused" | "Expired";
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(price));
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep local state in sync if the parent re-renders with a fresh
  // price (e.g. another tab edited it).
  useEffect(() => {
    if (!editing) setValue(String(price));
  }, [price, editing]);

  // Auto-focus + select-all when entering edit mode so the admin can
  // overwrite immediately.
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const editable = status === "Active" || status === "Paused";

  if (!editable) {
    return (
      <span className="font-display font-black text-amber-400/60">
        {formatUSDFull(price)}
      </span>
    );
  }

  const save = () => {
    const num = parseFloat(value);
    if (!Number.isFinite(num) || num <= 0) {
      setError("Must be > 0");
      return;
    }
    if (num === price) {
      // No-op — just close the editor.
      setEditing(false);
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.set("listingId", listingId);
    fd.set("price", String(num));
    fd.set("quantity", String(qty));
    start(async () => {
      const res = await updateListing(fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  const cancel = () => {
    setEditing(false);
    setValue(String(price));
    setError(null);
  };

  if (editing) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <span className="text-amber-400">$</span>
        <input
          ref={inputRef}
          type="number"
          step="0.01"
          min="0.01"
          value={value}
          disabled={pending}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          className="w-24 rounded-md border border-amber-400/40 bg-amber-500/10 px-2 py-1 font-display text-base font-black text-amber-300 outline-none focus:border-amber-400/80 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-emerald-700/40 bg-emerald-500/15 text-emerald-200 transition hover:bg-emerald-500/25 disabled:opacity-50"
          title="Save"
          aria-label="Save price"
        >
          {pending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Check size={12} />
          )}
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={pending}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 disabled:opacity-50"
          title="Cancel"
          aria-label="Cancel"
        >
          <X size={12} />
        </button>
        {error && (
          <span className="text-[10px] text-rose-300">{error}</span>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition hover:bg-amber-500/10"
      title="Click to edit price"
    >
      <span className="font-display font-black text-amber-400 group-hover:text-amber-300">
        {formatUSDFull(price)}
      </span>
      <Pencil
        size={11}
        className="text-white/30 opacity-0 transition group-hover:opacity-100 group-hover:text-amber-400"
      />
    </button>
  );
}
