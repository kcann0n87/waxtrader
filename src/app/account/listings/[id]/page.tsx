import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Eye, Heart } from "lucide-react";
import { findListing } from "@/lib/orders";
import { skus } from "@/lib/data";
import { CURRENT_USER_TIER, TIER_FEE } from "@/lib/fees";
import { ListingActions } from "./listing-actions";
import { ShipForm } from "./ship-form";
import { formatSkuTitle, formatUSD, formatUSDFull } from "@/lib/utils";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = findListing(id);
  if (!listing) notFound();
  const sku = skus.find((s) => s.id === listing.skuId)!;

  const fee = listing.ask * TIER_FEE[CURRENT_USER_TIER];
  const payout = listing.ask - fee;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-white/50">
        <Link href="/account" className="inline-flex items-center gap-1 hover:text-white">
          <ArrowLeft size={14} /> Account
        </Link>
        <span>/</span>
        <span className="hover:text-white">Listings</span>
        <span>/</span>
        <span className="font-mono text-white">{listing.id}</span>
      </div>

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Listing {listing.id}
          </h1>
          <p className="text-sm text-white/50">
            Listed {formatDate(listing.listedAt)} · {listing.qty} qty available
          </p>
        </div>
        <ListingStatusBadge status={listing.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
            <div className="flex items-start gap-4">
              <Link
                href={`/product/${sku.slug}`}
                className="block h-20 w-16 shrink-0 overflow-hidden rounded text-[8px] font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${sku.gradient[0]}, ${sku.gradient[1]})` }}
              >
                <div className="flex h-full items-center justify-center">
                  {sku.brand.slice(0, 4).toUpperCase()}
                </div>
              </Link>
              <div className="flex-1">
                <Link
                  href={`/product/${sku.slug}`}
                  className="text-base font-bold text-white hover:text-amber-300"
                >
                  {formatSkuTitle(sku)}
                </Link>
                <div className="text-xs text-white/50">
                  {sku.sport} · Factory Sealed
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                  <Stat icon={<Eye size={12} />} label="Views" value={String(listing.views)} />
                  <Stat icon={<Heart size={12} />} label="Watching" value={String(listing.watching)} />
                  <Stat icon={<Calendar size={12} />} label="Listed" value={formatDate(listing.listedAt)} />
                </div>
              </div>
            </div>
          </div>

          {listing.status === "Active" && (
            <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
              <h2 className="mb-3 text-base font-bold text-white">Listing details</h2>
              <dl className="divide-y divide-white/5 rounded-lg border border-white/10">
                <Row label="Asking price" value={formatUSDFull(listing.ask)} />
                <Row
                  label="Shipping"
                  value={listing.shipping === "calc" ? "Calculated at checkout" : listing.shipping === 0 ? "Free" : `$${listing.shipping}`}
                />
                <Row label="Quantity available" value={String(listing.qty)} />
                <Row label={`${CURRENT_USER_TIER} tier fee (${(TIER_FEE[CURRENT_USER_TIER] * 100).toFixed(0)}%)`} value={`-${formatUSDFull(fee)}`} />
                <Row label="Payout per box" value={formatUSDFull(payout)} bold />
              </dl>
              <ListingActions listingId={listing.id} currentAsk={listing.ask} />
            </div>
          )}

          {listing.status === "Sold" && listing.soldOrder && (
            <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
              <h2 className="mb-1 text-base font-bold text-white">Sold to a buyer</h2>
              <p className="mb-4 text-xs text-white/50">
                Order{" "}
                <Link
                  href={`/account/orders/${listing.soldOrder.id}`}
                  className="font-mono text-amber-300 hover:underline"
                >
                  {listing.soldOrder.id}
                </Link>{" "}
                · sold {formatDate(listing.soldOrder.soldAt)}
              </p>

              <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center text-sm">
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">Sold for</div>
                  <div className="mt-0.5 font-bold text-white">{formatUSDFull(listing.ask)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">Fees</div>
                  <div className="mt-0.5 font-bold text-rose-400">-{formatUSDFull(fee)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">Net to you</div>
                  <div className="mt-0.5 font-bold text-emerald-300">{formatUSD(payout)}</div>
                </div>
              </div>

              <ShipForm
                orderId={listing.soldOrder.id}
                initialCarrier={listing.soldOrder.carrier}
                initialTracking={listing.soldOrder.tracking}
                needsShipBy={listing.soldOrder.needsShipBy}
              />
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
            <div className="text-xs font-semibold tracking-wider text-white/40 uppercase">Listing ID</div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-white">{listing.id}</div>
            <div className="mt-3 text-xs font-semibold tracking-wider text-white/40 uppercase">SKU</div>
            <div className="mt-0.5 text-sm font-semibold text-white">{formatSkuTitle(sku)}</div>
          </div>

          {listing.status === "Active" && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/60">
              <div className="font-semibold text-white/90">Tip</div>
              <p className="mt-1">
                Lowering your ask by even $5 below the current lowest can dramatically increase
                visibility. Your listing is currently {listing.watching > 5 ? "well-watched" : "below average attention"}.
              </p>
            </div>
          )}

          {listing.status === "Sold" && listing.soldOrder && !listing.soldOrder.tracking && (
            <div className="rounded-xl border border-amber-700/40 bg-amber-500/10 p-4 text-xs text-amber-100">
              <div className="font-semibold">Ship by {formatDate(listing.soldOrder.needsShipBy)}</div>
              <p className="mt-1">
                Add tracking before this date to keep your seller score high. Late shipments hurt
                your reputation.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
        <span className="text-white/30">{icon}</span>
        {label}
      </dt>
      <dd className="text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <dt className="text-sm text-white/60">{label}</dt>
      <dd className={`text-sm ${bold ? "font-bold text-white" : "font-semibold text-white"}`}>{value}</dd>
    </div>
  );
}

function ListingStatusBadge({ status }: { status: import("@/lib/orders").ListingStatus }) {
  const cfg = {
    Active: "bg-emerald-500/10 text-emerald-300",
    Sold: "bg-amber-500/10 text-amber-400",
    Expired: "bg-white/5 text-white/60",
  }[status];
  return (
    <span className={`inline-flex rounded-md px-3 py-1.5 text-sm font-bold ${cfg}`}>{status}</span>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
