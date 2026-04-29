"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Star } from "lucide-react";

const subKeys = [
  { key: "itemAccuracy", label: "Item as described", hint: "Was it what you ordered? Sealed?" },
  { key: "communication", label: "Communication", hint: "Were they responsive when needed?" },
  { key: "shippingSpeed", label: "Shipping speed", hint: "How fast did they ship after sale?" },
  { key: "shippingCost", label: "Shipping cost", hint: "Was it reasonable for the package?" },
] as const;

export function LeaveReview({ sellerUsername }: { sellerUsername: string }) {
  const [verdict, setVerdict] = useState<"positive" | "neutral" | "negative" | "">("");
  const [subRatings, setSubRatings] = useState({
    itemAccuracy: 0,
    communication: 0,
    shippingSpeed: 0,
    shippingCost: 0,
  });
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const allRated = Object.values(subRatings).every((v) => v > 0);
  const canSubmit = verdict && allRated;

  if (submitted) {
    return (
      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
          <Check size={16} /> Feedback posted
        </div>
        <p className="mt-1 text-xs text-emerald-800">
          Thanks for the feedback. {sellerUsername} can see and reply to it.{" "}
          <Link href={`/seller/${sellerUsername}`} className="font-semibold underline">
            View their profile →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-base font-bold text-slate-900">Leave feedback for {sellerUsername}</h3>
      <p className="mt-0.5 text-xs text-slate-500">
        Rate the experience overall, then break it down by category. Helps other buyers and rewards
        good sellers.
      </p>

      <div className="mt-5">
        <div className="mb-2 text-sm font-semibold text-slate-700">Overall</div>
        <div className="grid grid-cols-3 gap-2">
          <VerdictButton
            kind="positive"
            current={verdict}
            label="Positive"
            sublabel="Smooth transaction"
            onClick={() => setVerdict("positive")}
          />
          <VerdictButton
            kind="neutral"
            current={verdict}
            label="Neutral"
            sublabel="Some issues"
            onClick={() => setVerdict("neutral")}
          />
          <VerdictButton
            kind="negative"
            current={verdict}
            label="Negative"
            sublabel="Bad experience"
            onClick={() => setVerdict("negative")}
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="text-sm font-semibold text-slate-700">Detailed ratings</div>
        {subKeys.map(({ key, label, hint }) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">{label}</div>
              <div className="text-[11px] text-slate-500">{hint}</div>
            </div>
            <StarPicker
              value={subRatings[key]}
              onChange={(v) => setSubRatings((s) => ({ ...s, [key]: v }))}
            />
          </div>
        ))}
      </div>

      <div className="mt-5">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">
            Comment <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Share what other buyers should know."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          disabled={!canSubmit}
          onClick={() => setSubmitted(true)}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Post feedback
        </button>
        <button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Skip for now
        </button>
        {!canSubmit && (
          <span className="ml-auto self-center text-[11px] text-slate-400">
            {!verdict ? "Pick an overall verdict" : "Rate every category"}
          </span>
        )}
      </div>
    </div>
  );
}

function VerdictButton({
  kind,
  current,
  label,
  sublabel,
  onClick,
}: {
  kind: "positive" | "neutral" | "negative";
  current: string;
  label: string;
  sublabel: string;
  onClick: () => void;
}) {
  const active = current === kind;
  const tones = {
    positive: active ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-slate-700",
    neutral: active ? "border-amber-500 bg-amber-50 text-amber-900" : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 text-slate-700",
    negative: active ? "border-rose-500 bg-rose-50 text-rose-900" : "border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 text-slate-700",
  }[kind];
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border-2 p-3 text-left transition ${tones}`}
    >
      <div className="text-sm font-bold">{label}</div>
      <div className="text-[11px] opacity-80">{sublabel}</div>
    </button>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          aria-label={`${n} stars`}
          className="rounded p-0.5 hover:bg-slate-100"
        >
          <Star
            size={20}
            className={
              n <= (hover || value) ? "fill-amber-400 text-amber-400" : "text-slate-300"
            }
          />
        </button>
      ))}
    </div>
  );
}
