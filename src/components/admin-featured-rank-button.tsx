"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pin, PinOff } from "lucide-react";
import { adminSetFeaturedRank } from "@/app/actions/admin";

/**
 * Floating pill in the top-right of admin product cards. Sets the
 * SKU's featured_rank — a smallint that pins it to a specific
 * position on the homepage rails. Lower number = higher up. Null =
 * unranked (default ordering).
 *
 * UX: starts as a small Pin icon. Click → tiny inline number input
 * appears. Type a number 1-99, hit Enter to save, or click the
 * unpin icon to clear.
 *
 * Pairs with AdminAddSkuButton (+, emerald) and AdminDeleteSkuButton
 * (✕, rose). This is amber, sits between them in the corner stack.
 */
export function AdminFeaturedRankButton({
  skuId,
  currentRank,
  isAdmin,
}: {
  skuId: string;
  currentRank: number | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentRank?.toString() ?? "");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin) return null;

  const save = (rank: number | null) => {
    setError(null);
    start(async () => {
      const res = await adminSetFeaturedRank(skuId, rank);
      if (res.error) {
        setError(res.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  const clear = () => {
    setValue("");
    save(null);
  };

  if (editing) {
    return (
      <div className="absolute top-3 right-20 z-30 inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-1 text-[11px] font-bold text-amber-100">
        <input
          type="number"
          min={1}
          max={99}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const n = parseInt(value, 10);
              save(Number.isFinite(n) ? n : null);
            } else if (e.key === "Escape") {
              setEditing(false);
              setValue(currentRank?.toString() ?? "");
            }
          }}
          onBlur={() => {
            const n = parseInt(value, 10);
            save(Number.isFinite(n) ? n : null);
          }}
          className="w-10 bg-transparent text-center font-mono outline-none placeholder:text-amber-200/40"
          placeholder="1"
        />
        {pending && <Loader2 size={11} className="animate-spin" />}
        {currentRank !== null && (
          <button
            type="button"
            onClick={clear}
            disabled={pending}
            className="text-amber-200 transition hover:text-rose-300"
            title="Clear rank"
          >
            <PinOff size={11} />
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setEditing(true);
        setError(null);
      }}
      className={
        currentRank !== null
          ? "absolute top-3 right-20 z-30 inline-flex h-7 items-center gap-1 rounded-full border border-amber-500/60 bg-amber-500/25 px-2 text-[11px] font-bold text-amber-100 transition hover:scale-105"
          : "absolute top-3 right-20 z-30 inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-700/40 bg-amber-500/15 text-amber-200 transition hover:scale-110 hover:border-amber-500/60 hover:bg-amber-500/30"
      }
      title={
        currentRank !== null
          ? `Pinned to homepage position #${currentRank} — click to change`
          : "Pin this SKU to a specific homepage position"
      }
      aria-label="Set featured rank"
    >
      <Pin size={12} />
      {currentRank !== null && (
        <span className="font-mono">#{currentRank}</span>
      )}
      {error && (
        <span className="absolute -bottom-6 right-0 max-w-[200px] truncate rounded bg-rose-500/90 px-2 py-0.5 text-[10px] text-white">
          {error}
        </span>
      )}
    </button>
  );
}
