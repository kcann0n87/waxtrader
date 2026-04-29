import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageCircle, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { BuyBidActions } from "@/components/buy-bid-actions";
import { PresaleBanner } from "@/components/presale-banner";
import { PriceChart } from "@/components/price-chart";
import { ProductImage } from "@/components/product-image";
import { RecentlyViewed } from "@/components/recently-viewed";
import { TrackView } from "@/components/track-view";
import { WatchButton } from "@/components/watch-button";
import {
  bidsForSku,
  highestBid,
  lastSale,
  listingsForSku,
  lowestAsk,
  priceHistoryForSku,
  recentSalesForSku,
  skus,
} from "@/lib/data";
import { formatSkuTitle, formatUSD, formatUSDFull, isPresale } from "@/lib/utils";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sku = skus.find((s) => s.slug === slug);
  if (!sku) notFound();

  const listings = listingsForSku(sku.id);
  const bids = bidsForSku(sku.id);
  const history = priceHistoryForSku(sku.id);
  const sales = recentSalesForSku(sku.id);
  const ask = lowestAsk(sku.id);
  const bid = highestBid(sku.id);
  const last = lastSale(sku.id);
  const previous = history[history.length - 8]?.price ?? last ?? 0;
  const change = last && previous ? last - previous : 0;
  const changePct = previous ? (change / previous) * 100 : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <Link href="/" className="hover:text-white">
          All
        </Link>
        <ChevronRight size={12} />
        <Link href={`/?sport=${sku.sport}`} className="hover:text-white">
          {sku.sport}
        </Link>
        <ChevronRight size={12} />
        <span className="text-white/60">{sku.brand}</span>
        <ChevronRight size={12} />
        <span className="text-white">{sku.set}</span>
      </nav>

      {isPresale(sku.releaseDate) && <PresaleBanner releaseDate={sku.releaseDate} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101012] p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
              <ProductImage sku={sku} size="lg" className="aspect-[4/5] rounded-xl border border-white/5" />

              <div>
                <div className="flex items-start justify-between gap-3">
                  <h1 className="font-display text-3xl leading-[1.1] font-black tracking-tight text-white">
                    {formatSkuTitle(sku)}
                  </h1>
                  <WatchButton skuId={sku.id} variant="compact" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{sku.description}</p>

                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <Spec label="Sport" value={sku.sport} />
                  <Spec label="Brand" value={sku.brand} />
                  <Spec label="Set" value={sku.set} />
                  <Spec label="Year" value={String(sku.year)} />
                  <Spec label="Product" value={sku.product} />
                  <Spec
                    label="Release"
                    value={new Date(sku.releaseDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  />
                </dl>

                <div className="mt-6 flex items-start gap-2 rounded-lg border border-emerald-700/30 bg-emerald-500/5 px-3 py-2.5 text-xs text-emerald-100/80">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                  <span>
                    <strong className="text-emerald-300">Buyer Protection:</strong> Held in escrow.
                    Refund if your box doesn&apos;t arrive sealed.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#101012] p-6">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="text-[10px] font-semibold tracking-[0.18em] text-amber-400/80 uppercase">
                  Price history
                </div>
                <h2 className="font-display mt-1 text-2xl font-black tracking-tight text-white">
                  Last 90 days
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-bold ${
                    change >= 0
                      ? "border-emerald-700/40 bg-emerald-500/10 text-emerald-400"
                      : "border-rose-700/40 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {change >= 0 ? "+" : ""}
                  {formatUSD(Math.abs(change))} ({changePct.toFixed(1)}%)
                </span>
                <span className="text-xs text-white/40">7d</span>
              </div>
            </div>
            <PriceChart data={history} />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#101012] p-6">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="text-[10px] font-semibold tracking-[0.18em] text-amber-400/80 uppercase">
                  Order book
                </div>
                <h2 className="font-display mt-1 text-2xl font-black tracking-tight text-white">
                  Available listings
                </h2>
              </div>
              <span className="text-xs text-white/50">{listings.length} sellers · lowest first</span>
            </div>
            <div className="overflow-x-auto rounded-lg border border-white/5">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-white/5 text-left text-[10px] font-semibold tracking-[0.15em] text-white/50 uppercase">
                  <tr>
                    <th className="px-4 py-3">Seller</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Shipping</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {listings.map((l) => (
                    <tr key={l.id} className="transition hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/seller/${l.seller}`}
                            className="font-semibold text-white transition hover:text-amber-300"
                          >
                            {l.seller}
                          </Link>
                          <Link
                            href={`/account/messages/new?to=${l.seller}&sku=${sku.id}`}
                            className="rounded-md p-1 text-white/30 transition hover:bg-white/5 hover:text-amber-300"
                            aria-label={`Message ${l.seller}`}
                            title={`Message ${l.seller}`}
                          >
                            <MessageCircle size={12} />
                          </Link>
                        </div>
                        <div className="text-xs text-emerald-400">
                          {l.sellerRating}% · {l.sellerSales.toLocaleString()} sales
                        </div>
                      </td>
                      <td className="px-4 py-3 font-display font-black text-amber-400">
                        {formatUSDFull(l.price)}
                      </td>
                      <td className="px-4 py-3 text-white/60">
                        {l.shipping === 0 ? (
                          <span className="font-semibold text-emerald-400">Free</span>
                        ) : (
                          formatUSD(l.shipping)
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/60">{l.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        <AddToCartButton listing={l} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#101012] p-6">
              <div className="text-[10px] font-semibold tracking-[0.18em] text-amber-400/80 uppercase">
                Tape
              </div>
              <h2 className="font-display mt-1 mb-3 text-xl font-black tracking-tight text-white">
                Recent sales
              </h2>
              <ul className="divide-y divide-white/5">
                {sales.slice(0, 6).map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-white/50">
                      {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="font-display font-black text-amber-300">
                      {formatUSDFull(s.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#101012] p-6">
              <div className="text-[10px] font-semibold tracking-[0.18em] text-amber-400/80 uppercase">
                Standing
              </div>
              <h2 className="font-display mt-1 mb-3 text-xl font-black tracking-tight text-white">
                Open bids
              </h2>
              <ul className="divide-y divide-white/5">
                {bids.map((b) => (
                  <li key={b.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-white/50">expires in {b.expires}</span>
                    <span className="font-display font-black text-white">{formatUSDFull(b.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-amber-700/30 bg-gradient-to-b from-[#13130f] to-[#101012] p-5 shadow-xl shadow-amber-500/5">
            <BuyBidActions sku={sku} ask={ask} bid={bid} last={last} />
          </div>
        </aside>
      </div>

      <div className="mt-12">
        <RecentlyViewed excludeSkuId={sku.id} />
      </div>

      <TrackView skuId={sku.id} />
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-[0.18em] text-white/40 uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-white">{value}</dd>
    </div>
  );
}
