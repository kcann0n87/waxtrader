"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CreditCard, Lock, X } from "lucide-react";
import { Sku } from "@/lib/data";
import { formatSkuTitle, formatUSD, formatUSDFull } from "@/lib/utils";

import { CURRENT_USER_TIER, TIER_FEE } from "@/lib/fees";

const FEE_RATE = TIER_FEE[CURRENT_USER_TIER];

type Mode = "closed" | "buy" | "bid" | "buy-confirmed" | "bid-confirmed";

export function BuyBidActions({
  sku,
  ask,
  bid,
  last,
}: {
  sku: Sku;
  ask: number | null;
  bid: number | null;
  last: number | null;
}) {
  const [mode, setMode] = useState<Mode>("closed");
  const [bidAmount, setBidAmount] = useState<string>(
    bid !== null ? String(bid + 5) : ask !== null ? String(Math.max(ask - 25, 1)) : "0",
  );
  const [bidDays, setBidDays] = useState<string>("7");
  const [orderId] = useState(() => `WM-${Math.floor(Math.random() * 900000 + 100000)}`);

  const close = () => setMode("closed");
  const bidNum = parseFloat(bidAmount) || 0;
  const buyTax = ask ? Math.round(ask * 0.07 * 100) / 100 : 0;
  const buyShipping = 0;
  const buyTotal = (ask || 0) + buyTax + buyShipping;

  return (
    <>
      <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
        <Stat label="Lowest Ask" value={ask !== null ? formatUSD(ask) : "—"} accent />
        <Stat label="Last Sale" value={last !== null ? formatUSD(last) : "—"} />
        <Stat label="Highest Bid" value={bid !== null ? formatUSD(bid) : "—"} />
      </div>

      <div className="mt-5 space-y-2.5">
        <button
          disabled={ask === null}
          onClick={() => setMode("buy")}
          className="flex w-full items-center justify-between rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 font-bold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span>Buy Now</span>
          <span>{ask !== null ? formatUSD(ask) : "—"}</span>
        </button>
        <button
          onClick={() => setMode("bid")}
          className="flex w-full items-center justify-between rounded-md border border-white/15 bg-white/5 px-4 py-3 font-bold text-white transition hover:border-amber-400/40 hover:bg-amber-500/5"
        >
          <span>Place Bid</span>
          <span>{bid !== null ? formatUSD(bid + 5) : "—"}</span>
        </button>
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <Link
          href="/sell"
          className="block w-full rounded-md border border-white/10 bg-white/[0.03] px-4 py-2.5 text-center text-sm font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
        >
          Sell yours →
        </Link>
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-white/50">
        <div className="flex items-center justify-between">
          <span>Seller fee ({CURRENT_USER_TIER} tier)</span>
          <span className="font-semibold text-amber-300">{(FEE_RATE * 100).toFixed(0)}% flat</span>
        </div>
        <div className="text-[10px] text-white/40">No buyer fees · payment processing absorbed</div>
      </div>

      {mode !== "closed" && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {mode === "buy" && (
              <BuyModal
                sku={sku}
                ask={ask!}
                tax={buyTax}
                shipping={buyShipping}
                total={buyTotal}
                onClose={close}
                onConfirm={() => setMode("buy-confirmed")}
              />
            )}
            {mode === "bid" && (
              <BidModal
                sku={sku}
                bidAmount={bidAmount}
                onChangeAmount={setBidAmount}
                bidDays={bidDays}
                onChangeDays={setBidDays}
                currentHighest={bid}
                lowestAsk={ask}
                onClose={close}
                onConfirm={() => {
                  if (bidNum >= (ask ?? Infinity)) {
                    setMode("buy-confirmed");
                  } else {
                    setMode("bid-confirmed");
                  }
                }}
              />
            )}
            {mode === "buy-confirmed" && (
              <ConfirmedModal
                title="Order placed"
                lines={[
                  `${formatSkuTitle(sku)}`,
                  `Order ${orderId} · ${formatUSDFull(buyTotal)}`,
                  `Payment held in escrow until your box ships and arrives sealed.`,
                ]}
                ctaLabel="View order"
                ctaHref="/account"
                onClose={close}
              />
            )}
            {mode === "bid-confirmed" && (
              <ConfirmedModal
                title="Bid placed"
                lines={[
                  `${formatSkuTitle(sku)}`,
                  `Your bid: ${formatUSD(bidNum)} · expires in ${bidDays} days`,
                  `If a seller accepts, you&apos;ll be charged automatically.`,
                ]}
                ctaLabel="View my bids"
                ctaHref="/account"
                onClose={close}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-2">
      <div className="text-[10px] font-semibold tracking-[0.15em] text-white/40 uppercase">
        {label}
      </div>
      <div
        className={`mt-1 font-display text-lg font-black tracking-tight ${accent ? "text-amber-400" : "text-white"}`}
      >
        {value}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between border-b border-slate-100 p-5">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <button
        onClick={onClose}
        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function BuyModal({
  sku,
  ask,
  tax,
  shipping,
  total,
  onClose,
  onConfirm,
}: {
  sku: Sku;
  ask: number;
  tax: number;
  shipping: number;
  total: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  const cardValid = cardNumber.replace(/\s/g, "").length >= 13 && exp.length === 5 && cvc.length >= 3 && zip.length >= 5;

  return (
    <>
      <ModalHeader title="Confirm purchase" onClose={onClose} />
      <div className="max-h-[80vh] overflow-y-auto p-5">
        <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div
            className="flex h-14 w-11 shrink-0 items-center justify-center rounded text-[8px] font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${sku.gradient[0]}, ${sku.gradient[1]})` }}
          >
            {sku.brand.slice(0, 4).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{formatSkuTitle(sku)}</div>
            <div className="text-xs text-slate-500">{sku.sport} · Factory Sealed</div>
          </div>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Item price" value={formatUSDFull(ask)} />
          <Row label="Shipping" value={shipping === 0 ? "Free" : formatUSDFull(shipping)} />
          <Row label="Sales tax (est)" value={formatUSDFull(tax)} />
          <div className="my-2 border-t border-slate-100" />
          <Row label="Total" value={formatUSDFull(total)} bold />
        </dl>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Payment</span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <Lock size={11} /> Encrypted
            </span>
          </div>
          <div className="rounded-lg border border-slate-300 bg-white p-3">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-slate-400" />
              <input
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 19)
                      .replace(/(\d{4})(?=\d)/g, "$1 "),
                  )
                }
                placeholder="1234 1234 1234 1234"
                className="flex-1 text-sm focus:outline-none"
              />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 border-t border-slate-100 pt-2">
              <input
                inputMode="numeric"
                value={exp}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                  if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                  setExp(v);
                }}
                placeholder="MM/YY"
                className="text-sm focus:outline-none"
              />
              <input
                inputMode="numeric"
                value={cvc}
                maxLength={4}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                placeholder="CVC"
                className="text-sm focus:outline-none"
              />
              <input
                inputMode="numeric"
                value={zip}
                maxLength={5}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                placeholder="ZIP"
                className="text-sm focus:outline-none"
              />
            </div>
          </div>
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
            />
            Save card for future purchases
          </label>
        </div>

        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <strong>Buyer Protection:</strong> Your payment is held in escrow. Released to the seller
          only after you confirm the box arrived sealed.
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={!cardValid}
            onClick={onConfirm}
            className="flex-1 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Pay {formatUSD(total)}
          </button>
        </div>
      </div>
    </>
  );
}

function BidModal({
  sku,
  bidAmount,
  onChangeAmount,
  bidDays,
  onChangeDays,
  currentHighest,
  lowestAsk,
  onClose,
  onConfirm,
}: {
  sku: Sku;
  bidAmount: string;
  onChangeAmount: (v: string) => void;
  bidDays: string;
  onChangeDays: (v: string) => void;
  currentHighest: number | null;
  lowestAsk: number | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const bidNum = parseFloat(bidAmount) || 0;
  const meetsAsk = lowestAsk !== null && bidNum >= lowestAsk;
  const tooLow = currentHighest !== null && bidNum > 0 && bidNum <= currentHighest;
  const fee = bidNum * FEE_RATE;
  const total = bidNum + Math.round(bidNum * 0.07 * 100) / 100;

  return (
    <>
      <ModalHeader title="Place a bid" onClose={onClose} />
      <div className="p-5">
        <div className="mb-4 text-sm text-slate-600">{formatSkuTitle(sku)}</div>

        <div className="grid grid-cols-2 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-slate-50 text-center">
          <div className="px-3 py-3">
            <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Highest Bid</div>
            <div className="mt-1 text-base font-bold text-slate-900">
              {currentHighest !== null ? formatUSD(currentHighest) : "—"}
            </div>
          </div>
          <div className="px-3 py-3">
            <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Lowest Ask</div>
            <div className="mt-1 text-base font-bold text-emerald-700">
              {lowestAsk !== null ? formatUSD(lowestAsk) : "—"}
            </div>
          </div>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-700">Your bid</span>
          <div className="relative mt-1">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">$</span>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => onChangeAmount(e.target.value)}
              className="w-full rounded-md border border-slate-300 py-2.5 pr-3 pl-7 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          {tooLow && (
            <p className="mt-1.5 text-xs text-amber-700">
              ⚠ Below the current highest bid of {formatUSD(currentHighest!)} — yours won&apos;t win
              first.
            </p>
          )}
          {meetsAsk && (
            <p className="mt-1.5 text-xs text-emerald-700">
              ⚡ This meets the lowest ask — buying instantly for {formatUSD(lowestAsk!)}.
            </p>
          )}
          {!tooLow && !meetsAsk && bidNum > 0 && (
            <p className="mt-1.5 text-xs text-slate-500">
              You&apos;ll be the new highest bid if a seller doesn&apos;t accept it sooner.
            </p>
          )}
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-slate-700">Expires</span>
          <select
            value={bidDays}
            onChange={(e) => onChangeDays(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="1">1 day</option>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </label>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
          <div className="font-semibold text-slate-700">If accepted</div>
          <div className="mt-1.5 space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Bid amount</span>
              <span>{formatUSDFull(bidNum)}</span>
            </div>
            <div className="flex justify-between">
              <span>Sales tax (est)</span>
              <span>{formatUSDFull(total - bidNum)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
              <span>Charged to your card</span>
              <span>{formatUSDFull(total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={bidNum <= 0}
            onClick={onConfirm}
            className="flex-1 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-40"
          >
            {meetsAsk ? `Buy for ${formatUSD(lowestAsk!)}` : `Place bid — ${formatUSD(bidNum)}`}
          </button>
        </div>

        <div className="mt-3 text-[11px] text-slate-400">
          Flat {(FEE_RATE * 100).toFixed(0)}% seller fee — no buyer fees, no separate processing.
        </div>
        {/* keep referenced so the var isn't unused */}
        <div className="hidden">{fee}</div>
      </div>
    </>
  );
}

function ConfirmedModal({
  title,
  lines,
  ctaLabel,
  ctaHref,
  onClose,
}: {
  title: string;
  lines: string[];
  ctaLabel: string;
  ctaHref: string;
  onClose: () => void;
}) {
  return (
    <>
      <ModalHeader title={title} onClose={onClose} />
      <div className="flex flex-col items-center px-5 py-7 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <Check className="text-emerald-600" size={28} />
        </div>
        <div className="mt-4 space-y-1.5 text-sm">
          {lines.map((l, i) => (
            <div
              key={i}
              className={i === 0 ? "text-base font-bold text-slate-900" : "text-slate-600"}
            >
              {l}
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
          <Link
            href={ctaHref}
            onClick={onClose}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? "font-bold text-slate-900" : "text-slate-600"}>{label}</dt>
      <dd className={bold ? "font-bold text-slate-900" : "font-semibold text-slate-900"}>{value}</dd>
    </div>
  );
}
