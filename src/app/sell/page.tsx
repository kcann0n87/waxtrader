"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, Check, ChevronRight, Lightbulb, Search, TrendingDown, TrendingUp } from "lucide-react";
import { skus, lowestAsk, highestBid, lastSale, priceHistoryForSku, recentSalesForSku } from "@/lib/data";
import { CURRENT_USER_TIER, TIER_FEE } from "@/lib/fees";
import { formatSkuTitle, formatUSD, formatUSDFull } from "@/lib/utils";

const FEE_RATE = TIER_FEE[CURRENT_USER_TIER];

type Step = 1 | 2 | 3 | 4;

export default function SellPage() {
  const [step, setStep] = useState<Step>(1);
  const [query, setQuery] = useState("");
  const [skuId, setSkuId] = useState<string | null>(null);
  const [askPrice, setAskPrice] = useState<string>("");
  const [shipping, setShipping] = useState<string>("0");
  const [quantity, setQuantity] = useState<string>("1");
  const [submitted, setSubmitted] = useState(false);

  const sku = skus.find((s) => s.id === skuId);
  const matches = useMemo(() => {
    if (!query) return skus.slice(0, 8);
    const q = query.toLowerCase();
    return skus.filter(
      (s) =>
        s.brand.toLowerCase().includes(q) ||
        s.set.toLowerCase().includes(q) ||
        s.sport.toLowerCase().includes(q) ||
        s.product.toLowerCase().includes(q) ||
        String(s.year).includes(q),
    );
  }, [query]);

  const ask = sku ? lowestAsk(sku.id) : null;
  const bid = sku ? highestBid(sku.id) : null;
  const last = sku ? lastSale(sku.id) : null;

  const askNum = parseFloat(askPrice) || 0;
  const fee = askNum * FEE_RATE;
  const payout = Math.max(askNum - fee, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-black tracking-tight text-slate-900">List a sealed box</h1>
      <p className="mt-1 text-slate-600">
        It takes about 60 seconds. We hold the buyer&apos;s payment in escrow until the box arrives
        sealed.
      </p>

      <Link
        href="/sell/payouts"
        className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm transition hover:bg-amber-100"
      >
        <Building2 size={16} className="text-amber-700" />
        <span className="flex-1 text-amber-900">
          <strong>Set up payouts</strong> to receive ACH transfers every Friday for your sales.
        </span>
        <ChevronRight size={16} className="text-amber-700" />
      </Link>

      <Stepper step={step} />

      {step === 1 && (
        <Card title="1. Find your product" subtitle="Search by year, brand, sport, or set">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={16} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g. "2025 Bowman" or "Prizm"'
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 pr-3 pl-9 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
            {matches.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">
                No matches. Try a different search.
              </div>
            )}
            {matches.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSkuId(s.id);
                  const initial = lowestAsk(s.id);
                  if (initial) setAskPrice(String(Math.max(initial - 5, 1)));
                  setStep(2);
                }}
                className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-slate-50"
              >
                <div
                  className="flex h-12 w-10 items-center justify-center rounded text-[8px] font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${s.gradient[0]}, ${s.gradient[1]})`,
                  }}
                >
                  {s.brand.slice(0, 4).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">
                    {formatSkuTitle(s)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {s.sport} · Last sale {lastSale(s.id) ? formatUSD(lastSale(s.id)!) : "—"}
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            ))}
          </div>
        </Card>
      )}

      {step === 2 && sku && (
        <Card title="2. Set your asking price" subtitle="See what the market is paying right now">
          <SmartPricingCard skuId={sku.id} ask={ask} last={last} bid={bid} onApply={(p) => setAskPrice(String(p))} />

          <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-slate-50 text-center">
            <Stat label="Lowest Ask" value={ask !== null ? formatUSD(ask) : "—"} accent="emerald" />
            <Stat label="Last Sale" value={last !== null ? formatUSD(last) : "—"} />
            <Stat label="Highest Bid" value={bid !== null ? formatUSD(bid) : "—"} accent="rose" />
          </div>

          <label className="mt-6 block">
            <span className="text-sm font-semibold text-slate-700">Your asking price</span>
            <div className="relative mt-1">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={askPrice}
                onChange={(e) => setAskPrice(e.target.value)}
                className="w-full rounded-md border border-slate-300 py-2.5 pr-3 pl-7 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            {ask !== null && askNum > 0 && askNum >= ask && (
              <p className="mt-1.5 text-xs text-amber-700">
                ⚠ Your price is at or above the lowest ask — sellers under you will sell first.
              </p>
            )}
            {ask !== null && askNum > 0 && askNum < ask && (
              <p className="mt-1.5 text-xs text-emerald-700">
                ✓ You&apos;ll be the new lowest ask, undercutting by {formatUSD(ask - askNum)}.
              </p>
            )}
            {bid !== null && askNum > 0 && askNum <= bid && (
              <p className="mt-1.5 text-xs text-rose-700">
                ⚡ Your price meets the highest bid — this will sell instantly for {formatUSD(bid)}.
              </p>
            )}
          </label>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Shipping</span>
              <select
                value={shipping}
                onChange={(e) => setShipping(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="0">Free shipping</option>
                <option value="10">$10 flat</option>
                <option value="15">$15 flat</option>
                <option value="calc">Calculated at checkout</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Quantity</span>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Your payout</div>
            <div className="mt-2 space-y-1.5 text-sm">
              <Row label="Sale price" value={formatUSDFull(askNum)} />
              <Row label={`${CURRENT_USER_TIER} tier fee (${(FEE_RATE * 100).toFixed(0)}%)`} value={`-${formatUSDFull(fee)}`} muted />
              <div className="my-2 border-t border-slate-100" />
              <Row label="You receive" value={formatUSDFull(payout)} bold />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Change product
            </button>
            <button
              disabled={!askNum}
              onClick={() => setStep(3)}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        </Card>
      )}

      {step === 3 && sku && (
        <Card title="3. Review listing" subtitle="Last check before it goes live">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div
                className="flex h-16 w-12 shrink-0 items-center justify-center rounded text-[8px] font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${sku.gradient[0]}, ${sku.gradient[1]})`,
                }}
              >
                {sku.brand.slice(0, 4).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-slate-900">
                  {formatSkuTitle(sku)}
                </div>
                <div className="text-sm text-slate-600">
                  {sku.sport} · {sku.product} · Factory Sealed
                </div>
              </div>
            </div>
          </div>

          <dl className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
            <Field label="Asking price" value={formatUSDFull(askNum)} />
            <Field
              label="Shipping"
              value={shipping === "0" ? "Free" : shipping === "calc" ? "Calculated at checkout" : `$${shipping} flat`}
            />
            <Field label="Quantity" value={quantity} />
            <Field label={`${CURRENT_USER_TIER} tier fee (${(FEE_RATE * 100).toFixed(0)}%)`} value={`-${formatUSDFull(fee)}`} />
            <Field label="Payout per box" value={formatUSDFull(payout)} bold />
          </dl>

          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            By listing, you agree to ship within 2 business days of sale. Buyer payment is held in
            escrow and released after delivery confirmation.
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                setSubmitted(true);
                setStep(4);
              }}
              className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Publish listing
            </button>
          </div>
        </Card>
      )}

      {step === 4 && submitted && sku && (
        <Card title="4. You're live" subtitle="Your listing is now visible to buyers">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Check className="text-emerald-600" size={28} />
            </div>
            <div className="mt-4 text-lg font-bold text-slate-900">Listing published</div>
            <div className="mt-1 text-sm text-slate-600">
              {quantity} × {sku.brand} {sku.set} {sku.product} at {formatUSDFull(askNum)} each
            </div>
            <div className="mt-6 flex gap-2">
              <Link
                href={`/product/${sku.slug}`}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                View product page
              </Link>
              <button
                onClick={() => {
                  setStep(1);
                  setSkuId(null);
                  setAskPrice("");
                  setSubmitted(false);
                }}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                List another
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["Find product", "Set price", "Review", "Done"];
  return (
    <ol className="my-6 flex items-center gap-2">
      {labels.map((label, i) => {
        const n = i + 1;
        const isDone = step > n;
        const isCurrent = step === n;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                isDone
                  ? "bg-emerald-600 text-white"
                  : isCurrent
                    ? "bg-slate-900 text-white"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {isDone ? <Check size={14} /> : n}
            </div>
            <span
              className={`hidden text-xs font-semibold sm:inline ${
                isCurrent ? "text-slate-900" : "text-slate-500"
              }`}
            >
              {label}
            </span>
            {n < labels.length && (
              <div className={`mx-1 h-px flex-1 ${isDone ? "bg-emerald-600" : "bg-slate-200"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-0.5 mb-4 text-sm text-slate-500">{subtitle}</p>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "rose";
}) {
  const tone = accent === "emerald" ? "text-emerald-700" : accent === "rose" ? "text-rose-700" : "text-slate-900";
  return (
    <div className="px-3 py-3">
      <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{label}</div>
      <div className={`mt-1 text-base font-bold ${tone}`}>{value}</div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={muted ? "text-slate-500" : "text-slate-700"}>{label}</span>
      <span className={`${bold ? "text-base font-bold text-slate-900" : "text-slate-900"}`}>{value}</span>
    </div>
  );
}

function Field({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className={`text-sm ${bold ? "font-bold text-slate-900" : "font-semibold text-slate-900"}`}>{value}</dd>
    </div>
  );
}

function SmartPricingCard({
  skuId,
  ask,
  last,
  bid,
  onApply,
}: {
  skuId: string;
  ask: number | null;
  last: number | null;
  bid: number | null;
  onApply: (price: number) => void;
}) {
  const history = priceHistoryForSku(skuId);
  const sales = recentSalesForSku(skuId);
  const last30 = history.slice(-30);
  const avg30 = last30.length ? Math.round(last30.reduce((s, h) => s + h.price, 0) / last30.length) : null;
  const prev30 = history.slice(-60, -30);
  const avgPrev = prev30.length ? prev30.reduce((s, h) => s + h.price, 0) / prev30.length : null;
  const trend = avg30 && avgPrev ? ((avg30 - avgPrev) / avgPrev) * 100 : 0;
  const recommended = ask !== null ? Math.max(ask - 5, 1) : avg30 ?? 100;
  const fastSell = bid !== null ? bid : recommended;

  return (
    <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
          <Lightbulb size={18} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-slate-900">Smart pricing</div>
          <div className="text-xs text-slate-600">
            30-day avg: <span className="font-bold text-slate-900">{avg30 ? formatUSD(avg30) : "—"}</span>
            {trend !== 0 && (
              <span
                className={`ml-1.5 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  trend >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}
              >
                {trend >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                {trend >= 0 ? "+" : ""}
                {trend.toFixed(1)}%
              </span>
            )}
            {sales.length > 0 && <span className="ml-1.5 text-slate-500">· {sales.length} recent sales</span>}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => onApply(recommended)}
          className="rounded-lg border border-emerald-200 bg-white p-3 text-left transition hover:border-emerald-400 hover:bg-emerald-50"
        >
          <div className="text-[10px] font-semibold tracking-wider text-emerald-700 uppercase">Recommended</div>
          <div className="mt-0.5 text-lg font-bold text-slate-900">{formatUSD(recommended)}</div>
          <div className="text-[11px] text-slate-500">Be the new lowest ask</div>
        </button>
        <button
          onClick={() => onApply(fastSell)}
          className="rounded-lg border border-amber-200 bg-white p-3 text-left transition hover:border-amber-400 hover:bg-amber-50"
        >
          <div className="text-[10px] font-semibold tracking-wider text-amber-700 uppercase">Quick sell</div>
          <div className="mt-0.5 text-lg font-bold text-slate-900">{formatUSD(fastSell)}</div>
          <div className="text-[11px] text-slate-500">
            {bid !== null ? "Match highest bid · sells now" : "Aggressive pricing"}
          </div>
        </button>
      </div>

      {last !== null && ask !== null && last > ask && (
        <div className="mt-3 rounded-md border border-slate-200 bg-white p-2.5 text-[11px] text-slate-600">
          💡 Last sale was {formatUSD(last)}, currently {formatUSD(last - ask)} above the lowest ask. Buyers are
          paying a premium right now.
        </div>
      )}
    </div>
  );
}
