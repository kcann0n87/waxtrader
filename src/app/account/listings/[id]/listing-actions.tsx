"use client";

import { useState } from "react";

export function ListingActions({ listingId, currentAsk }: { listingId: string; currentAsk: number }) {
  const [editing, setEditing] = useState(false);
  const [newAsk, setNewAsk] = useState(String(currentAsk));
  const [saved, setSaved] = useState(false);

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {!editing ? (
        <>
          <button
            onClick={() => {
              setEditing(true);
              setSaved(false);
            }}
            className="rounded-md border border-white/15 bg-[#101012] px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.02]"
          >
            Edit price
          </button>
          <button className="rounded-md border border-white/15 bg-[#101012] px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.02]">
            Pause listing
          </button>
          <button className="rounded-md border border-rose-700/50 bg-[#101012] px-3 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/10">
            Delete
          </button>
          {saved && (
            <span className="ml-auto self-center text-xs text-emerald-300">✓ Updated</span>
          )}
        </>
      ) : (
        <div className="flex w-full items-center gap-2">
          <span className="text-sm font-semibold text-white/80">New ask</span>
          <div className="relative flex-1 max-w-[160px]">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-white/40">$</span>
            <input
              type="number"
              value={newAsk}
              onChange={(e) => setNewAsk(e.target.value)}
              className="w-full rounded-md border border-white/15 py-2 pl-7 pr-3 text-sm focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
          <button
            onClick={() => {
              setEditing(false);
              setSaved(true);
            }}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setNewAsk(String(currentAsk));
            }}
            className="rounded-md border border-white/15 bg-[#101012] px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.02]"
          >
            Cancel
          </button>
        </div>
      )}
      <span className="sr-only">{listingId}</span>
    </div>
  );
}
