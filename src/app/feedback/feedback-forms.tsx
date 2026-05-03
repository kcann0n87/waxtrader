"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Lightbulb, Package, Send } from "lucide-react";
import { submitFeedback } from "@/app/actions/feedback";

type Tab = "feature" | "set";

const SPORTS = ["NBA", "MLB", "NFL", "NHL", "Pokemon"] as const;

export function FeedbackForms({
  isSignedIn,
  signedInHint,
}: {
  isSignedIn: boolean;
  signedInHint?: string;
}) {
  const [tab, setTab] = useState<Tab>("feature");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submittedType, setSubmittedType] = useState<Tab | null>(null);

  const submit = (formData: FormData) => {
    setError(null);
    formData.set("type", tab);
    startTransition(async () => {
      const res = await submitFeedback(formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      setSubmittedType(tab);
    });
  };

  if (submittedType) {
    return (
      <div className="mt-8 rounded-2xl border border-emerald-700/40 bg-emerald-500/10 p-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
          <Check size={24} />
        </div>
        <h2 className="font-display mt-4 text-xl font-black text-white">
          Got it — thanks for sharing.
        </h2>
        <p className="mt-2 text-sm text-emerald-100/80">
          {submittedType === "feature"
            ? "We'll triage your idea this week. If it lines up with what we're building, we'll loop back."
            : "We'll verify the product is real, find a stock photo, and add it to the catalog. You'll get an email when it goes live."}
        </p>
        <button
          onClick={() => {
            setSubmittedType(null);
            setError(null);
          }}
          className="mt-5 text-xs font-semibold text-emerald-300 hover:underline"
        >
          Submit another →
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#101012]">
      {/* Tab switcher */}
      <div className="flex border-b border-white/5">
        <TabButton
          active={tab === "feature"}
          onClick={() => setTab("feature")}
          icon={<Lightbulb size={14} />}
          label="Suggest a feature"
        />
        <TabButton
          active={tab === "set"}
          onClick={() => setTab("set")}
          icon={<Package size={14} />}
          label="Request a set"
        />
      </div>

      <form action={submit} className="space-y-4 p-6">
        {tab === "feature" ? (
          <>
            <Field label="One-line title" htmlFor="feature-title">
              <input
                id="feature-title"
                name="title"
                required
                maxLength={120}
                placeholder='e.g. "Bulk-export my watchlist as CSV"'
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </Field>
            <Field label="Tell us more" htmlFor="feature-description">
              <textarea
                id="feature-description"
                name="description"
                required
                rows={5}
                placeholder="What's the workflow? Why is it useful? Anything specific you're hoping for."
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </Field>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Brand" htmlFor="set-brand">
                <input
                  id="set-brand"
                  name="brand"
                  required
                  placeholder="Topps, Panini, Bowman, Upper Deck…"
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
              </Field>
              <Field label="Set name" htmlFor="set-name">
                <input
                  id="set-name"
                  name="set_name"
                  required
                  placeholder="Chrome, Prizm, National Treasures…"
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Sport" htmlFor="set-sport">
                <select
                  id="set-sport"
                  name="sport"
                  required
                  defaultValue=""
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                >
                  <option value="" disabled>
                    Pick…
                  </option>
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Year" htmlFor="set-year">
                <input
                  id="set-year"
                  name="year"
                  type="number"
                  required
                  min="2015"
                  max="2030"
                  placeholder="2025"
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
              </Field>
              <Field label="Box type" htmlFor="set-product">
                <input
                  id="set-product"
                  name="product"
                  placeholder="Hobby Box, Mega, Case…"
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
              </Field>
            </div>
            <Field label="Notes (optional)" htmlFor="set-notes">
              <textarea
                id="set-notes"
                name="notes"
                rows={3}
                placeholder="Release date if known, link to manufacturer page, anything else."
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </Field>
          </>
        )}

        {/* Email field — required for anonymous, optional for signed-in */}
        <Field
          label={
            isSignedIn
              ? "Contact email (optional — we have your account email)"
              : "Contact email"
          }
          htmlFor="feedback-email"
        >
          <input
            id="feedback-email"
            name="email"
            type="email"
            required={!isSignedIn}
            placeholder={signedInHint ?? "you@example.com"}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </Field>

        {error && (
          <div className="rounded-md border border-rose-700/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-4">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-md shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {tab === "feature" ? "Send feature request" : "Send set request"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "flex flex-1 items-center justify-center gap-2 border-b-2 border-amber-400 px-4 py-3 text-sm font-bold text-amber-300"
          : "flex flex-1 items-center justify-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-white/60 transition hover:text-white"
      }
    >
      {icon}
      {label}
    </button>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-xs font-semibold text-white/80">
        {label}
      </span>
      {children}
    </label>
  );
}
