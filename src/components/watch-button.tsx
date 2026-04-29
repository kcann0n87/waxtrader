"use client";

import { Heart } from "lucide-react";
import { useWatchlist } from "@/lib/watchlist";

export function WatchButton({
  skuId,
  variant = "default",
}: {
  skuId: string;
  variant?: "default" | "compact" | "icon";
}) {
  const { has, toggle, hydrated } = useWatchlist();
  const watching = hydrated && has(skuId);

  if (variant === "icon") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(skuId);
        }}
        aria-label={watching ? "Remove from watchlist" : "Add to watchlist"}
        className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur transition hover:bg-white ${
          watching ? "text-rose-600" : "text-slate-400 hover:text-rose-600"
        }`}
      >
        <Heart size={16} fill={watching ? "currentColor" : "none"} />
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={() => toggle(skuId)}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
          watching
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        <Heart size={12} fill={watching ? "currentColor" : "none"} />
        {watching ? "Watching" : "Watch"}
      </button>
    );
  }

  return (
    <button
      onClick={() => toggle(skuId)}
      className={`inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition ${
        watching
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Heart size={16} fill={watching ? "currentColor" : "none"} />
      {watching ? "Watching" : "Add to watchlist"}
    </button>
  );
}
