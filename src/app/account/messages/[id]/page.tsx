"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Package, ShieldCheck } from "lucide-react";
import { useMessages } from "@/lib/messages-store";
import { skus } from "@/lib/data";
import { ReplyComposer } from "./reply-composer";
import { formatSkuTitle, formatUSDFull } from "@/lib/utils";
import { findOrder } from "@/lib/orders";

export default function MessageThreadPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { findConversation, hydrated, sendReply, markRead } = useMessages();
  const convo = id ? findConversation(id) : null;

  useEffect(() => {
    if (id && convo?.unread) markRead(id);
  }, [id, convo?.unread, markRead]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-3 h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (!convo) notFound();

  const sku = convo.skuId ? skus.find((s) => s.id === convo.skuId) : null;
  const order = convo.orderId ? findOrder(convo.orderId) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/account/messages" className="inline-flex items-center gap-1 hover:text-slate-900">
          <ArrowLeft size={14} /> Messages
        </Link>
        <span>/</span>
        <span className="text-slate-900">{convo.with}</span>
      </div>

      <header className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={convo.with} support={convo.withRole === "support"} />
          <div>
            <div className="flex items-center gap-1.5 text-lg font-bold text-slate-900">
              {convo.withRole === "seller" ? (
                <Link href={`/seller/${convo.with}`} className="hover:text-indigo-600">
                  {convo.with}
                </Link>
              ) : (
                <span>{convo.with}</span>
              )}
              {convo.withRating !== undefined && (
                <span className="text-xs font-semibold text-emerald-600">{convo.withRating}%</span>
              )}
              {convo.withRole === "support" && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  STAFF
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              {convo.withRole === "seller" ? "Seller" : convo.withRole === "buyer" ? "Buyer" : "WaxMarket Support"}
              {sku && ` · ${formatSkuTitle(sku)}`}
            </div>
          </div>
        </div>
      </header>

      {order && sku && (
        <Link
          href={`/account/orders/${order.id}`}
          className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100"
        >
          <div
            className="flex h-12 w-10 shrink-0 items-center justify-center rounded text-[8px] font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${sku.gradient[0]}, ${sku.gradient[1]})` }}
          >
            {sku.brand.slice(0, 4).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-500">
              Order <span className="font-mono text-slate-700">{order.id}</span>
            </div>
            <div className="line-clamp-1 text-sm font-bold text-slate-900">{formatSkuTitle(sku)}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-sm font-bold text-slate-900">{formatUSDFull(order.total)}</div>
            <div className="text-[11px] text-slate-500">{order.status}</div>
          </div>
        </Link>
      )}

      <div className="rounded-xl border border-slate-200 bg-white">
        <ol className="divide-y divide-slate-100">
          {convo.messages.map((m) => (
            <li key={m.id} className={`px-5 py-4 ${m.from === "buyer" ? "bg-slate-50/50" : ""}`}>
              <div className="mb-1 flex items-center gap-2 text-xs">
                <span
                  className={`font-bold ${
                    m.from === "buyer"
                      ? "text-slate-700"
                      : m.from === "support"
                        ? "text-indigo-700"
                        : "text-slate-900"
                  }`}
                >
                  {m.from === "buyer" ? "You" : convo.with}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-400">{formatTs(m.ts)}</span>
              </div>
              <p className="text-sm whitespace-pre-line text-slate-800">{m.text}</p>
              {m.systemEvent && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
                  {m.systemEvent.kind === "shipped" && (
                    <>
                      <Package size={11} className="text-sky-600" />
                      <span className="font-semibold text-slate-700">Shipped:</span>
                      <span className="font-mono text-slate-600">{m.systemEvent.detail}</span>
                    </>
                  )}
                  {m.systemEvent.kind === "released" && (
                    <>
                      <ShieldCheck size={11} className="text-emerald-600" />
                      <span className="font-semibold text-slate-700">Funds released:</span>
                      <span className="text-slate-600">{m.systemEvent.detail}</span>
                    </>
                  )}
                  {m.systemEvent.kind === "delivered" && (
                    <>
                      <Package size={11} className="text-emerald-600" />
                      <span className="font-semibold text-slate-700">Delivered</span>
                    </>
                  )}
                  {m.systemEvent.kind === "dispute" && (
                    <>
                      <span className="font-semibold text-rose-700">Dispute opened</span>
                      <span className="text-slate-600">{m.systemEvent.detail}</span>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
        <ReplyComposer
          with_={convo.with}
          onSend={(text) => sendReply(convo.id, text)}
        />
      </div>
    </div>
  );
}

function Avatar({ name, support }: { name: string; support?: boolean }) {
  if (support) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-black text-white">
        WM
      </div>
    );
  }
  const initial = name[0]?.toUpperCase() ?? "?";
  const colors = ["bg-emerald-600", "bg-sky-600", "bg-rose-600", "bg-amber-600", "bg-violet-600", "bg-cyan-600"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${color}`}>
      {initial}
    </div>
  );
}

function formatTs(ts: string) {
  const [date, time] = ts.split(" ");
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${dt.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${time}`;
}
