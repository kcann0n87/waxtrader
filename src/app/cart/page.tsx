"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Building2, Check, CreditCard, Lock, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { groupBySeller, useCart } from "@/lib/cart";
import { skus } from "@/lib/data";
import { formatSkuTitle, formatUSD, formatUSDFull } from "@/lib/utils";

export default function CartPage() {
  const { items, hydrated, subtotal, shipping, tax, total, itemCount, updateQty, remove, clear } = useCart();

  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");
  const [shipName, setShipName] = useState("Kyle Cannon");
  const [shipAddr, setShipAddr] = useState("123 Main St");
  const [shipCity, setShipCity] = useState("Austin");
  const [shipState, setShipState] = useState("TX");
  const [shipZip, setShipZip] = useState("78701");
  const [confirmed, setConfirmed] = useState(false);

  const cardValid =
    cardNumber.replace(/\s/g, "").length >= 13 && exp.length === 5 && cvc.length >= 3 && zip.length >= 5;
  const shipValid = shipName && shipAddr && shipCity && shipState.length === 2 && shipZip.length >= 5;
  const canSubmit = cardValid && shipValid && items.length > 0;

  if (confirmed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="text-emerald-600" size={32} />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900">Orders placed</h1>
          <p className="mt-2 text-sm text-slate-600">
            You ordered {itemCount} {itemCount === 1 ? "box" : "boxes"} for {formatUSDFull(total)}.
            Each seller has 2 business days to ship. Payment is held in escrow until you confirm
            delivery.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link
              href="/account"
              onClick={clear}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              View orders
            </Link>
            <Link
              href="/"
              onClick={clear}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Keep shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400">
            <ShoppingBag size={24} />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Your cart is empty</h1>
          <p className="mt-1 text-sm text-slate-500">Add boxes from any product page to get started.</p>
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
      <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={14} /> Continue shopping
      </Link>

      <h1 className="text-2xl font-black tracking-tight text-slate-900">Checkout</h1>
      <p className="text-sm text-slate-500">
        {itemCount} {itemCount === 1 ? "item" : "items"} from{" "}
        {hydrated ? groupBySeller(items).length : 0} sellers
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {hydrated &&
            groupBySeller(items).map(([seller, sellerItems]) => (
              <div key={seller} className="overflow-hidden rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                  <div className="text-sm">
                    Sold by <span className="font-bold text-slate-900">{seller}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {sellerItems.length} {sellerItems.length === 1 ? "item" : "items"} ·{" "}
                    {sellerItems.every((i) => i.shipping === 0) ? "Free shipping" : "Standard shipping"}
                  </div>
                </div>
                <ul className="divide-y divide-slate-100">
                  {sellerItems.map((item) => {
                    const sku = skus.find((s) => s.id === item.skuId);
                    if (!sku) return null;
                    return (
                      <li key={item.id} className="flex gap-4 p-4">
                        <Link
                          href={`/product/${sku.slug}`}
                          className="block h-20 w-16 shrink-0 overflow-hidden rounded text-[8px] font-bold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${sku.gradient[0]}, ${sku.gradient[1]})`,
                          }}
                        >
                          <div className="flex h-full items-center justify-center">
                            {sku.brand.slice(0, 4).toUpperCase()}
                          </div>
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/product/${sku.slug}`}
                            className="text-sm font-bold text-slate-900 hover:text-indigo-600"
                          >
                            {formatSkuTitle(sku)}
                          </Link>
                          <div className="text-xs text-slate-500">{sku.sport} · Factory Sealed</div>
                          <div className="mt-3 flex items-center gap-3">
                            <div className="inline-flex items-center rounded-md border border-slate-300">
                              <button
                                onClick={() => updateQty(item.id, item.qty - 1)}
                                className="px-2 py-1 text-slate-500 hover:text-slate-900"
                                aria-label="Decrease"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="px-3 text-sm font-semibold text-slate-900">{item.qty}</span>
                              <button
                                onClick={() => updateQty(item.id, item.qty + 1)}
                                className="px-2 py-1 text-slate-500 hover:text-slate-900"
                                aria-label="Increase"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => remove(item.id)}
                              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 size={12} />
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-base font-bold text-slate-900">
                            {formatUSDFull(item.price * item.qty)}
                          </div>
                          {item.qty > 1 && (
                            <div className="text-xs text-slate-400">{formatUSDFull(item.price)} ea</div>
                          )}
                          <div className="mt-1 text-xs text-emerald-600">
                            {item.shipping === 0 ? "Free shipping" : `+${formatUSD(item.shipping)} shipping`}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

          <Section icon={<Building2 size={16} />} title="Ship to">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full name">
                <input value={shipName} onChange={(e) => setShipName(e.target.value)} className={input} />
              </Field>
              <Field label="ZIP">
                <input value={shipZip} onChange={(e) => setShipZip(e.target.value.replace(/\D/g, "").slice(0, 5))} className={input} />
              </Field>
            </div>
            <Field label="Address">
              <input value={shipAddr} onChange={(e) => setShipAddr(e.target.value)} className={input} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <input value={shipCity} onChange={(e) => setShipCity(e.target.value)} className={input} />
              </Field>
              <Field label="State">
                <input
                  value={shipState}
                  onChange={(e) => setShipState(e.target.value.slice(0, 2).toUpperCase())}
                  maxLength={2}
                  className={input}
                />
              </Field>
            </div>
          </Section>

          <Section icon={<CreditCard size={16} />} title="Payment" right={<Lock size={11} className="text-slate-400" />}>
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
          </Section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-base font-bold text-slate-900">Order summary</h2>
            <dl className="space-y-1.5 text-sm">
              <Row label={`Subtotal (${itemCount} ${itemCount === 1 ? "item" : "items"})`} value={formatUSDFull(subtotal)} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : formatUSDFull(shipping)} />
              <Row label="Sales tax (est)" value={formatUSDFull(tax)} />
              <div className="my-2 border-t border-slate-100" />
              <Row label="Total" value={formatUSDFull(total)} bold />
            </dl>

            <button
              disabled={!canSubmit}
              onClick={() => setConfirmed(true)}
              className="mt-5 flex w-full items-center justify-between rounded-md bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Place orders</span>
              <span>{formatUSD(total)}</span>
            </button>

            <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-[11px] text-emerald-800">
              <ShieldCheck size={11} className="mr-1 inline align-text-bottom" />
              Buyer Protection on every order. Payment held in escrow until each box arrives sealed.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const input =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

function Section({
  icon,
  title,
  right,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
        <span className="text-slate-400">{icon}</span>
        {title}
        {right && <span className="ml-auto inline-flex items-center gap-1 text-xs text-slate-400">{right} Encrypted</span>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? "font-bold text-slate-900" : "text-slate-600"}>{label}</dt>
      <dd className={bold ? "text-base font-bold text-slate-900" : "font-semibold text-slate-900"}>{value}</dd>
    </div>
  );
}
