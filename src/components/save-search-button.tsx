"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { useSavedSearches } from "@/lib/saved-searches";

export function SaveSearchButton({
  query,
  sport,
  brand,
}: {
  query: string;
  sport?: string;
  brand?: string;
}) {
  const { save } = useSavedSearches();
  const [saved, setSaved] = useState(false);

  if (!query && !sport && !brand) return null;

  return (
    <button
      onClick={() => {
        save({ query, sport, brand });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
        saved
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {saved ? (
        <>
          <Check size={12} />
          Saved
        </>
      ) : (
        <>
          <Bell size={12} />
          Save search & alert me
        </>
      )}
    </button>
  );
}
