"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { useMessages } from "@/lib/messages-store";
import { findOrder } from "@/lib/orders";
import { findSeller } from "@/lib/sellers";
import { skus } from "@/lib/data";
import { formatSkuTitle, formatUSDFull } from "@/lib/utils";

export default function NewMessagePage() {
  return (
    <Suspense fallback={null}>
      <NewMessageForm />
    </Suspense>
  );
}

function NewMessageForm() {
  const router = useRouter();
  const params = useSearchParams();
  const to = params.get("to") || "";
  const orderId = params.get("order") || undefined;
  const skuId = params.get("sku") || undefined;

  const seller = to ? findSeller(to) : null;
  const order = orderId ? findOrder(orderId) : null;
  const sku = skuId ? skus.find((s) => s.id === skuId) : order ? skus.find((s) => s.id === order.skuId) : null;

  const { startConversation, findConversationWith } = useMessages();
  const [text, setText] = useState(
    order ? `Hi ${to}, quick question about order ${order.id}: ` : sku ? `Hi ${to}, interested in your ${formatSkuTitle(sku)} — ` : "",
  );

  if (!to) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-xl border border-amber-700/40 bg-amber-500/10 p-8 text-center">
          <MessageCircle className="mx-auto text-amber-400" size={32} />
          <h1 className="mt-3 text-lg font-bold text-white">Pick someone to message</h1>
          <p className="mt-1 text-sm text-white/60">
            Open this page from a seller&apos;s profile or order page.
          </p>
          <Link
            href="/account/messages"
            className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Back to messages
          </Link>
        </div>
      </div>
    );
  }

  const existing = findConversationWith(to, orderId);

  const submit = () => {
    if (!text.trim()) return;
    const subject = order
      ? `Order ${order.id}${sku ? ` — ${formatSkuTitle(sku)}` : ""}`
      : sku
        ? formatSkuTitle(sku)
        : `Message to ${to}`;
    const id = startConversation({
      with: to,
      withRole: "seller",
      withRating: seller?.rating,
      orderId,
      skuId: skuId || order?.skuId,
      subject,
      initialMessage: text.trim(),
    });
    router.push(`/account/messages/${id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-white/50">
        <Link href="/account/messages" className="inline-flex items-center gap-1 hover:text-white">
          <ArrowLeft size={14} /> Messages
        </Link>
        <span>/</span>
        <span className="text-white">New message</span>
      </div>
      <h1 className="text-2xl font-black tracking-tight text-white">Message {to}</h1>
      <p className="mt-1 text-sm text-white/50">
        {existing
          ? "You already have a conversation with this seller — sending here will continue it."
          : "Start a new conversation."}
      </p>

      {order && sku && (
        <Link
          href={`/account/orders/${order.id}`}
          className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:bg-white/5"
        >
          <div
            className="flex h-12 w-10 shrink-0 items-center justify-center rounded text-[8px] font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${sku.gradient[0]}, ${sku.gradient[1]})` }}
          >
            {sku.brand.slice(0, 4).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white/50">
              About order <span className="font-mono text-white/80">{order.id}</span>
            </div>
            <div className="line-clamp-1 text-sm font-bold text-white">{formatSkuTitle(sku)}</div>
          </div>
          <div className="text-sm font-bold text-white">{formatUSDFull(order.total)}</div>
        </Link>
      )}
      {!order && sku && (
        <Link
          href={`/product/${sku.slug}`}
          className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:bg-white/5"
        >
          <div
            className="flex h-12 w-10 shrink-0 items-center justify-center rounded text-[8px] font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${sku.gradient[0]}, ${sku.gradient[1]})` }}
          >
            {sku.brand.slice(0, 4).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white/50">About product</div>
            <div className="line-clamp-1 text-sm font-bold text-white">{formatSkuTitle(sku)}</div>
          </div>
        </Link>
      )}

      <div className="mt-5 rounded-xl border border-white/10 bg-[#101012] p-5">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-white/80">Your message</span>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            rows={6}
            placeholder={`Write your message to ${to}...`}
            className="w-full resize-none rounded-md border border-white/15 px-3 py-2 text-sm focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </label>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[11px] text-white/40">
            Press ⌘↵ to send. Be respectful.
          </div>
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={14} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
