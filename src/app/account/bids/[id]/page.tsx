import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, TrendingDown, TrendingUp } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { findBid } from "@/lib/bids";
import { highestBid, listingsForSku, skus } from "@/lib/data";
import { BidActions } from "./bid-actions";
import { formatSkuTitle, formatUSD, formatUSDFull } from "@/lib/utils";

export default async function BidDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bid = findBid(id);
  if (!bid) notFound();
  const sku = skus.find((s) => s.id === bid.skuId);
  if (!sku) notFound();

  const ask = listingsForSku(sku.id)[0]?.price ?? null;
  const currentHighest = highestBid(sku.id);
  const youAreHighest = currentHighest !== null && bid.price >= currentHighest;
  const askGap = ask !== null ? ask - bid.price : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/account" className="inline-flex items-center gap-1 hover:text-slate-900">
          <ArrowLeft size={14} /> Account
        </Link>
        <span>/</span>
        <span className="hover:text-slate-900">Bids</span>
        <span>/</span>
        <span className="font-mono text-slate-900">{bid.id}</span>
      </div>

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Bid {bid.id}</h1>
          <p className="text-sm text-slate-500">
            Placed {formatDate(bid.placedAt)} · expires {formatDate(bid.expiresAt)}
          </p>
        </div>
        <StatusBadge status={bid.status} />
      </div>

      <Link
        href={`/product/${sku.slug}`}
        className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
      >
        <div className="flex gap-4">
          <ProductImage sku={sku} size="md" className="aspect-[4/5] w-24 shrink-0 rounded" />
          <div className="flex-1">
            <div className="text-base font-bold text-slate-900">{formatSkuTitle(sku)}</div>
            <div className="text-xs text-slate-500">
              {sku.sport} · {sku.brand}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <Pillar label="Your bid" value={formatUSD(bid.price)} accent="indigo" />
              <Pillar
                label="Highest bid"
                value={currentHighest !== null ? formatUSD(currentHighest) : "—"}
              />
              <Pillar label="Lowest ask" value={ask !== null ? formatUSD(ask) : "—"} accent="emerald" />
            </div>
          </div>
        </div>
      </Link>

      {bid.status === "Active" && (
        <>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            {youAreHighest ? (
              <div className="flex items-start gap-2">
                <TrendingUp size={16} className="mt-0.5 text-emerald-600" />
                <div>
                  <div className="font-bold text-slate-900">You&apos;re the top bidder.</div>
                  <p className="mt-0.5 text-slate-600">
                    Sellers will see your bid first. If one accepts, your card is charged
                    automatically.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <TrendingDown size={16} className="mt-0.5 text-rose-600" />
                <div>
                  <div className="font-bold text-slate-900">
                    {currentHighest !== null && currentHighest > bid.price
                      ? `You're below the top bid by ${formatUSD(currentHighest - bid.price)}.`
                      : "You're not the top bidder."}
                  </div>
                  <p className="mt-0.5 text-slate-600">
                    Raise your bid to take the lead, or wait — if a seller accepts your offer
                    anyway, you still win.
                  </p>
                </div>
              </div>
            )}
            {ask !== null && askGap > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <Calendar size={12} className="text-slate-400" />
                Buy instantly at the lowest ask: {formatUSD(ask)} ({formatUSD(askGap)} above your bid)
              </div>
            )}
          </div>

          <BidActions bidId={bid.id} currentPrice={bid.price} lowestAsk={ask} highestBid={currentHighest} skuSlug={sku.slug} />
        </>
      )}

      {bid.status === "Outbid" && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm">
          <div className="flex items-start gap-2">
            <TrendingDown size={16} className="mt-0.5 text-rose-600" />
            <div className="flex-1">
              <div className="font-bold text-rose-900">You were outbid.</div>
              <p className="mt-0.5 text-rose-800">
                Someone placed a higher bid. Raise yours or move on.
              </p>
              <Link
                href={`/product/${sku.slug}`}
                className="mt-2 inline-block rounded-md bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
              >
                Raise your bid →
              </Link>
            </div>
          </div>
        </div>
      )}

      {bid.status === "Won" && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <div className="font-bold text-emerald-900">Bid accepted</div>
          <p className="mt-1 text-emerald-800">
            A seller accepted your bid. Your card was charged {formatUSDFull(bid.price)}.
          </p>
        </div>
      )}

      {(bid.status === "Expired" || bid.status === "Canceled") && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          This bid has been {bid.status.toLowerCase()}. No charge will be made.
        </div>
      )}
    </div>
  );
}

function Pillar({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "indigo" | "emerald";
}) {
  const tone =
    accent === "indigo" ? "text-indigo-700" : accent === "emerald" ? "text-emerald-700" : "text-slate-900";
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-center">
      <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{label}</div>
      <div className={`mt-0.5 text-base font-bold ${tone}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: import("@/lib/bids").MyBid["status"] }) {
  const cfg = {
    Active: "bg-indigo-50 text-indigo-700",
    Won: "bg-emerald-50 text-emerald-700",
    Outbid: "bg-rose-50 text-rose-700",
    Expired: "bg-slate-100 text-slate-600",
    Canceled: "bg-slate-100 text-slate-600",
  }[status];
  return (
    <span className={`inline-flex rounded-md px-3 py-1.5 text-sm font-bold ${cfg}`}>{status}</span>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
