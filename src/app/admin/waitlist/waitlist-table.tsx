"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { adminInviteUser } from "@/app/actions/admin";

type Row = {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
  invitedAt: string | null;
};

export function WaitlistTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101012]">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-left text-[10px] font-semibold tracking-[0.15em] text-white/60 uppercase">
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Source</th>
            <th className="px-4 py-2">Joined</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <WaitlistRow key={r.id} row={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WaitlistRow({ row }: { row: Row }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  // Local invited flag — flips immediately on success so the row updates
  // without waiting for router.refresh() to round-trip the join.
  const [justSent, setJustSent] = useState(false);
  const invited = !!row.invitedAt || justSent;

  const sendInvite = () => {
    setErr(null);
    start(async () => {
      const res = await adminInviteUser({ email: row.email });
      if (res.error) {
        setErr(res.error);
        return;
      }
      setJustSent(true);
      router.refresh();
    });
  };

  return (
    <tr className="border-t border-white/5">
      <td className="px-4 py-2 font-medium text-white">{row.email}</td>
      <td className="px-4 py-2 text-xs text-white/60">
        {row.source ?? <span className="text-white/40">—</span>}
      </td>
      <td className="px-4 py-2 text-xs text-white/50">
        {new Date(row.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-2">
        {invited ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
            <CheckCircle2 size={11} />
            Invited
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-300">
            Pending
          </span>
        )}
      </td>
      <td className="px-4 py-2 text-right">
        {invited ? (
          <button
            onClick={sendInvite}
            disabled={pending}
            className="text-xs font-semibold text-white/40 hover:text-white/70 disabled:opacity-50"
            title="Send another invite"
          >
            {pending ? "Sending…" : "Resend"}
          </button>
        ) : (
          <button
            onClick={sendInvite}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
            {pending ? "Sending…" : "Send invite"}
          </button>
        )}
        {err && <div className="mt-1 text-[10px] text-rose-300">{err}</div>}
      </td>
    </tr>
  );
}
