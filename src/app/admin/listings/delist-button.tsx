"use client";

import { useState, useTransition } from "react";
import { adminDelistListing } from "@/app/actions/admin-users";

export function ListingDelistButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    if (!reason.trim()) {
      setErr("Reason required.");
      return;
    }
    setErr(null);
    start(async () => {
      const res = await adminDelistListing(listingId, reason.trim());
      if (res.error) setErr(res.error);
      else {
        setOpen(false);
        setReason("");
      }
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-rose-700/40 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-200 hover:bg-rose-500/20"
      >
        Delist
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (TOS, spam…)"
        className="w-48 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white"
      />
      <div className="flex gap-1">
        <button
          onClick={submit}
          disabled={pending}
          className="rounded bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-rose-400 disabled:opacity-50"
        >
          {pending ? "…" : "Confirm"}
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setReason("");
            setErr(null);
          }}
          className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70 hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
      {err && <p className="text-[10px] text-rose-300">{err}</p>}
    </div>
  );
}
