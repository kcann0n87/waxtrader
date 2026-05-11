"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { adminCreatePartner } from "@/app/actions/partners";

/**
 * Inline form for creating a new partner. Used at the top of the
 * /admin/partners list page. Click "+ New partner" → form expands
 * → fill in code/name/rate/window → save.
 */
export function NewPartnerForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    email: "",
    notes: "",
    commissionRate: "0.20",
    commissionWindowDays: "180",
  });

  const submit = () => {
    setErr(null);
    start(async () => {
      const res = await adminCreatePartner({
        code: form.code,
        name: form.name,
        email: form.email || undefined,
        notes: form.notes || undefined,
        commissionRate: parseFloat(form.commissionRate),
        commissionWindowDays: parseInt(form.commissionWindowDays, 10),
      });
      if (res.error) {
        setErr(res.error);
        return;
      }
      setForm({
        code: "",
        name: "",
        email: "",
        notes: "",
        commissionRate: "0.20",
        commissionWindowDays: "180",
      });
      setOpen(false);
      router.refresh();
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2 text-sm font-bold text-slate-900 shadow-md shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400"
      >
        <Plus size={14} /> New partner
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-[#101012] p-5">
      <div className="text-sm font-bold text-white">New partner</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Code">
          <input
            type="text"
            value={form.code}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""),
              }))
            }
            placeholder="PKMNFAM"
            maxLength={32}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm font-bold text-amber-300 uppercase focus:border-amber-400/50 focus:outline-none"
          />
          <p className="mt-1 text-[10px] text-white/50">
            2-32 chars · letters, numbers, hyphen, underscore. Used in URL like{" "}
            <code className="text-amber-300">?ref=PKMNFAM</code>.
          </p>
        </Field>
        <Field label="Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Pokemon Family Discord"
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:outline-none"
          />
        </Field>
        <Field label="Email (optional)">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="admin@example.com"
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:outline-none"
          />
        </Field>
        <Field label="Notes (optional)">
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Negotiated terms, contact name, etc."
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:outline-none"
          />
        </Field>
        <Field label="Commission rate">
          <input
            type="number"
            step="0.01"
            min="0"
            max="0.5"
            value={form.commissionRate}
            onChange={(e) =>
              setForm((f) => ({ ...f, commissionRate: e.target.value }))
            }
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:outline-none"
          />
          <p className="mt-1 text-[10px] text-white/50">
            Decimal: 0.20 = 20% of WaxDepot&apos;s platform fees from
            referred users.
          </p>
        </Field>
        <Field label="Window (days)">
          <input
            type="number"
            step="1"
            min="1"
            max="36500"
            value={form.commissionWindowDays}
            onChange={(e) =>
              setForm((f) => ({ ...f, commissionWindowDays: e.target.value }))
            }
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:outline-none"
          />
          <p className="mt-1 text-[10px] text-white/50">
            180 = 6 months from signup. Use 36500 for &quot;lifetime&quot;.
          </p>
        </Field>
      </div>

      {err && (
        <div className="rounded-md border border-rose-700/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {err}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setErr(null);
          }}
          disabled={pending}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending || !form.code || !form.name}
          className="inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-amber-300 disabled:opacity-50"
        >
          {pending ? <Loader2 size={11} className="animate-spin" /> : null}
          Create partner
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/80">{label}</span>
      {children}
    </label>
  );
}
