"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, Clock, MessageCircle } from "lucide-react";

const topics = [
  "Order issue (not arrived, wrong item, damaged)",
  "Payout problem",
  "Account or login help",
  "Suspicious listing or seller",
  "Suspect resealed wax",
  "Bug report",
  "Other",
];

export default function ContactPage() {
  const [topic, setTopic] = useState("");
  const [orderId, setOrderId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const valid = topic && subject && body && email.includes("@");

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-xl border border-white/10 bg-[#101012] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
            <Check className="text-emerald-400" size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-white">
            We got your message
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Ticket <span className="font-mono font-bold text-white">SUP-{Math.floor(Math.random() * 900000 + 100000)}</span>{" "}
            has been opened. Expect a reply at <strong>{email}</strong> within 24 hours — sooner for
            order issues.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link
              href="/account/messages"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              View messages
            </Link>
            <Link
              href="/help"
              className="rounded-md border border-white/15 bg-[#101012] px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.02]"
            >
              Back to help
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-white/50">
        <Link href="/help" className="inline-flex items-center gap-1 hover:text-white">
          <ArrowLeft size={14} /> Help
        </Link>
        <span>/</span>
        <span className="text-white">Contact support</span>
      </div>

      <h1 className="text-2xl font-black tracking-tight text-white">Contact support</h1>
      <p className="mt-1 text-sm text-white/60">
        Real human response within 24 hours. Faster for order issues.
      </p>

      <div className="mt-4 mb-6 grid grid-cols-2 gap-3">
        <Stat icon={<Clock size={14} />} label="Avg response" value="6 hours" />
        <Stat icon={<MessageCircle size={14} />} label="Open in 1 hour" value="78%" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="space-y-4 rounded-xl border border-white/10 bg-[#101012] p-6"
      >
        <Field label="What's this about?" required>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={input}
          >
            <option value="">Select a topic…</option>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>

        <Field label="Order ID (if related)">
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="WM-706373"
            className={`${input} font-mono`}
          />
        </Field>

        <Field label="Subject" required>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Box arrived with broken seal"
            className={input}
          />
        </Field>

        <Field label="Describe what happened" required>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Include dates, photos, and any relevant details. The more context you give, the faster we can help."
            className={input}
          />
        </Field>

        <Field label="Reply to" required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={input}
          />
        </Field>

        <button
          type="submit"
          disabled={!valid}
          className="w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send to support
        </button>
        <p className="text-center text-[11px] text-white/60">
          By submitting, you agree to our support terms. Don&apos;t send card numbers, passwords, or
          full SSN.
        </p>
      </form>
    </div>
  );
}

const input =
  "w-full rounded-md border border-white/15 px-3 py-2.5 text-sm focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-white/80">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#101012] p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-white/60 uppercase">
        <span className="text-white/50">{icon}</span>
        {label}
      </div>
      <div className="mt-0.5 text-base font-bold text-white">{value}</div>
    </div>
  );
}
