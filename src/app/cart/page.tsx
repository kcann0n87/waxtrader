"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { groupBySeller, useCart } from "@/lib/cart";
import { formatUSD, formatUSDFull } from "@/lib/utils";
import { SkuThumb } from "@/components/sku-thumb";
import { createCartCheckout } from "@/app/actions/stripe-checkout";

/**
 * Multi-seller cart → one Stripe Checkout session.
 *
 * The previous version of this page collected raw card numbers in plain
 * inputs and just flipped a `confirmed` boolean on click — no payment ever
 * happened, and the form was a PCI risk if anyone wired it up. Replaced
 * with a real handoff to Stripe Checkout: createCartCheckout creates one
 * order per cart line, plus one Checkout Session whose metadata stores
 * the comma-separated order IDs so the webhook can fan out updates.
 *
 * Buyer enters address + card on Stripe's hosted page (PCI compliant).
 * On success they land on /account/orders?cart_payment=success.
 */
export default function CartPage() {
  const { items, hydrated, subtotal, shipping, tax, total, itemCount, updateQty, remove } =
    useCart();

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = () => {
    setError(null);
    if (items.length === 0) return;
    startTransition(async () => {
      const res = await createCartCheckout(
        items.map((i) => ({ listingId: i.listingId, qty: i.qty })),
      );
      if (res.needsAuth) {
        window.location.href = `/signup?next=${encodeURIComponent("/cart")}`;
        return;
      }
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.checkoutUrl) {
        // Hand off to Stripe's hosted checkout. Webhook fires
        // checkout.session.completed when buyer pays → orders move to
        // InEscrow + cart clears (webhook handles updates; we clear local
        // localStorage cart on success-redirect from /account/orders).
        window.location.href = res.checkoutUrl;
      }
    });
  };

  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#101012] text-white/60">
            <ShoppingBag size={24} />
          </div>
          <h1 className="mt-4 text-xl font-bold text-white">Your cart is empty</h1>
          <p className="mt-1 text-sm text-white/50">
            Add boxes from any product page to get started.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Browse marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white"
      >
        <ArrowLeft size={14} /> Continue shopping
      </Link>

      <h1 className="text-2xl font-black tracking-tight text-white">Cart</h1>
      <p className="text-sm text-white/50">
        {itemCount} {itemCount === 1 ? "item" : "items"} from{" "}
        {hydrated ? groupBySeller(items).length : 0} sellers
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {hydrated &&
            groupBySeller(items).map(([seller, sellerItems]) => (
              <div
                key={seller}
                className="overflow-hidden rounded-xl border border-white/10"
              >
                <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-2.5">
                  <div className="text-sm">
                    Sold by <span className="font-bold text-white">{seller}</span>
                  </div>
                  <div className="text-xs text-white/50">
                    {sellerItems.length}{" "}
                    {sellerItems.length === 1 ? "item" : "items"} ·{" "}
                    {sellerItems.every((i) => i.shipping === 0)
                      ? "Free shipping"
                      : "Standard shipping"}
                  </div>
                </div>
                <ul className="divide-y divide-white/5">
                  {sellerItems.map((item) => {
                    const title = item.skuTitle ?? "Item";
                    const slug = item.skuSlug ?? "";
                    const sport = item.skuSport ?? "";
                    const thumbSku = {
                      brand: item.skuBrand ?? "WAX",
                      imageUrl: item.skuImageUrl ?? null,
                      gradient:
                        item.skuGradient ??
                        (["#475569", "#0f172a"] as [string, string]),
                    };
                    return (
                      <li key={item.id} className="flex gap-4 p-4">
                        <Link
                          href={`/product/${slug}`}
                          className="block h-20 w-16 shrink-0 overflow-hidden rounded"
                        >
                          <SkuThumb
                            sku={thumbSku}
                            className="h-full w-full"
                            alt={title}
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/product/${slug}`}
                            className="text-sm font-bold text-white hover:text-amber-300"
                          >
                            {title}
                          </Link>
                          <div className="text-xs text-white/50">
                            {sport} · Factory Sealed
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <div className="inline-flex items-center rounded-md border border-white/15">
                              <button
                                onClick={() => updateQty(item.id, item.qty - 1)}
                                className="px-2 py-1 text-white/50 hover:text-white"
                                aria-label="Decrease"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="px-3 text-sm font-semibold text-white">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(item.id, item.qty + 1)}
                                className="px-2 py-1 text-white/50 hover:text-white"
                                aria-label="Increase"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => remove(item.id)}
                              className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-rose-400"
                            >
                              <Trash2 size={12} />
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-base font-bold text-white">
                            {formatUSDFull(item.price * item.qty)}
                          </div>
                          {item.qty > 1 && (
                            <div className="text-xs text-white/60">
                              {formatUSDFull(item.price)} ea
                            </div>
                          )}
                          <div className="mt-1 text-xs text-emerald-400">
                            {item.shipping === 0
                              ? "Free shipping"
                              : `+${formatUSD(item.shipping)} shipping`}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
            <h2 className="mb-4 text-base font-bold text-white">Order summary</h2>
            <dl className="space-y-1.5 text-sm">
              <Row
                label={`Subtotal (${itemCount} ${itemCount === 1 ? "item" : "items"})`}
                value={formatUSDFull(subtotal)}
              />
              <Row
                label="Shipping"
                value={shipping === 0 ? "Free" : formatUSDFull(shipping)}
              />
              <Row label="Sales tax (est)" value={formatUSDFull(tax)} />
              <div className="my-2 border-t border-white/5" />
              <Row label="Total" value={formatUSDFull(total)} bold />
            </dl>

            <button
              disabled={pending || items.length === 0}
              onClick={handleCheckout}
              className="mt-5 flex w-full items-center justify-between rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 font-bold text-slate-900 shadow-md shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="inline-flex items-center gap-2">
                <Lock size={14} />
                {pending ? "Redirecting…" : "Continue to secure checkout"}
              </span>
              <span>{formatUSD(total)}</span>
            </button>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-rose-700/40 bg-rose-500/10 p-3 text-xs text-rose-200">
                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <p className="mt-3 text-center text-[11px] text-white/50">
              Address + payment collected on Stripe&apos;s secure page. We
              never see your card.
            </p>

            <Link
              href="/help/buying/buyer-protection"
              className="mt-3 block rounded-md border border-emerald-700/40 bg-emerald-500/10 p-2.5 text-[11px] text-emerald-200 transition hover:border-emerald-500/60 hover:bg-emerald-500/15"
            >
              <ShieldCheck size={11} className="mr-1 inline align-text-bottom" />
              Buyer Protection on every order. Payment held in escrow until each
              box arrives sealed.
              <span className="ml-1 underline decoration-emerald-400/40 underline-offset-2">
                Learn more
              </span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? "font-bold text-white" : "text-white/60"}>{label}</dt>
      <dd
        className={bold ? "text-base font-bold text-white" : "font-semibold text-white"}
      >
        {value}
      </dd>
    </div>
  );
}
