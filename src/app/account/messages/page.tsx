"use client";

import Link from "next/link";
import { ArrowLeft, MessageCircle, Plus } from "lucide-react";
import { useMessages } from "@/lib/messages-store";
import { skus } from "@/lib/data";
import { formatSkuTitle } from "@/lib/utils";

export default function MessagesPage() {
  const { conversations, hydrated, unreadCount } = useMessages();
  const sorted = [...conversations].sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-white/50">
        <Link href="/account" className="inline-flex items-center gap-1 hover:text-white">
          <ArrowLeft size={14} /> Account
        </Link>
        <span>/</span>
        <span className="text-white">Messages</span>
      </div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Messages</h1>
          <p className="text-sm text-white/50">
            Conversations with sellers, buyers, and support · {unreadCount} unread
          </p>
        </div>
      </div>

      {!hydrated ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
          <MessageCircle className="mx-auto text-white/40" size={32} />
          <p className="mt-3 text-sm font-bold text-white">No messages yet</p>
          <p className="mt-1 text-sm text-white/50">
            When you contact a seller or have an order question, the conversation lives here.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            <Plus size={14} />
            Browse marketplace
          </Link>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-white/10 bg-[#101012]">
          {sorted.map((c) => {
            const sku = c.skuId ? skus.find((s) => s.id === c.skuId) : null;
            const last = c.messages[c.messages.length - 1];
            return (
              <li key={c.id} className="border-b border-white/5 last:border-0">
                <Link
                  href={`/account/messages/${c.id}`}
                  className={`flex gap-3 px-4 py-3 transition hover:bg-white/[0.02] ${
                    c.unread ? "bg-amber-500/10" : ""
                  }`}
                >
                  <Avatar name={c.with} support={c.withRole === "support"} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                        {c.with}
                        {c.withRating !== undefined && (
                          <span className="text-[11px] font-semibold text-emerald-400">
                            {c.withRating}%
                          </span>
                        )}
                        {c.withRole === "support" && (
                          <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                            STAFF
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-[11px] text-white/40">{ago(c.lastMessageAt)}</span>
                    </div>
                    {sku && <div className="mt-0.5 text-xs text-white/50">{formatSkuTitle(sku)}</div>}
                    {!sku && c.subject && <div className="mt-0.5 text-xs text-white/50">{c.subject}</div>}
                    <div className="mt-1 line-clamp-1 text-sm text-white/80">
                      <span className="font-semibold text-white/50">
                        {last.from === "buyer" ? "You: " : ""}
                      </span>
                      {last.text}
                    </div>
                  </div>
                  {c.unread && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Avatar({ name, support }: { name: string; support?: boolean }) {
  if (support) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-xs font-black text-white">
        WM
      </div>
    );
  }
  const initial = name[0]?.toUpperCase() ?? "?";
  const colors = ["bg-emerald-600", "bg-sky-600", "bg-rose-600", "bg-amber-600", "bg-violet-600", "bg-cyan-600"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${color}`}>
      {initial}
    </div>
  );
}

function ago(ts: string) {
  const [date, time] = ts.split(" ");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = (time || "00:00").split(":").map(Number);
  const eventTime = new Date(y, m - 1, d, hh, mm).getTime();
  const now = Date.now();
  const diff = now - eventTime;
  const min = Math.max(Math.floor(diff / 60000), 0);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
