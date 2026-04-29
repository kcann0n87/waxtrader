"use client";

import Link from "next/link";
import { ArrowLeft, Bell, BellOff, Mail, Search, Trash2, Zap } from "lucide-react";
import { useSavedSearches } from "@/lib/saved-searches";

export default function AlertsPage() {
  const { searches, hydrated, remove, updateAlerts } = useSavedSearches();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/account" className="inline-flex items-center gap-1 hover:text-slate-900">
          <ArrowLeft size={14} /> Account
        </Link>
        <span>/</span>
        <span className="text-slate-900">Alerts</span>
      </div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900">Saved searches & alerts</h1>
      <p className="mt-1 text-sm text-slate-500">
        We&apos;ll notify you when new listings match your search or prices drop.
      </p>

      {!hydrated ? (
        <div className="mt-8 space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : searches.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Bell size={24} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">No saved searches</h3>
          <p className="mt-1 text-sm text-slate-500">
            Run a search and tap <strong>Save search & alert me</strong> to get notified about new listings.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            <Search size={14} />
            Browse the catalog
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {searches.map((s) => {
            const params = new URLSearchParams();
            if (s.query) params.set("q", s.query);
            if (s.sport) params.set("sport", s.sport);
            if (s.brand) params.set("brand", s.brand);
            return (
              <li key={s.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/search?${params.toString()}`}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600"
                    >
                      {s.query || "All boxes"}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {s.sport && <Tag>Sport: {s.sport}</Tag>}
                      {s.brand && <Tag>Brand: {s.brand}</Tag>}
                      {s.priceMax && <Tag>Under ${s.priceMax}</Tag>}
                      <span>· saved {timeAgo(s.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Delete this saved search?")) remove(s.id);
                    }}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Toggle
                    on={s.alerts.newListing}
                    onChange={(v) => updateAlerts(s.id, { newListing: v })}
                    icon={<Zap size={11} />}
                    label="New listings"
                  />
                  <Toggle
                    on={s.alerts.priceDrop}
                    onChange={(v) => updateAlerts(s.id, { priceDrop: v })}
                    icon={<Bell size={11} />}
                    label="Price drops"
                  />
                  <Toggle
                    on={s.alerts.email}
                    onChange={(v) => updateAlerts(s.id, { email: v })}
                    icon={<Mail size={11} />}
                    label="Email me"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
      {children}
    </span>
  );
}

function Toggle({
  on,
  onChange,
  icon,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
        on
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
      }`}
    >
      {on ? icon : <BellOff size={11} />}
      {label}
    </button>
  );
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}
