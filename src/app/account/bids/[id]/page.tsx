import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Calendar, TrendingDown, TrendingUp } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { createClient } from "@/lib/supabase/server";
import type { Sku } from "@/lib/data";
import { BidActions } from "./bid-actions";
import { formatSkuTitle, formatUSD, formatUSDFull } from "@/lib/utils";

export const dynamic = "force-dynamic";

type DbBidStatus = "Active" | "Won" | "Outbid" | "Expired" | "Canceled";

type SkuRel = {
  slug: string;
  year: number;
  brand: string;
  set_name: string;
  product: string;
  sport: string;
  description: string | null;
  release_date: string;
  image_url: string | null;
  gradient_from: string | null;
  gradient_to: string | null;
};

type BidRow = {
  id: string;
  sku_id: string;
  buyer_id: string;
  price_cents: number;
  status: DbBidStatus;
  expires_at: string;
  created_at: string;
  sku: SkuRel | SkuRel[] | null;
};

export default async function BidDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/account/bids/${id}`);

  // The dashboard truncates UUIDs to 8 chars in URLs, so fetch all of the
  // current user's bids and match by exact id or prefix. RLS already scopes
  // writes; we additionally filter by buyer_id to enforce ownership on read.
  const { data: candidates } = (await supabase
    .from("bids")
    .select(
      "id, sku_id, buyer_id, price_cents, status, expires_at, created_at, sku:skus!bids_sku_id_fkey(slug, year, brand, set_name, product, sport, description, release_date, image_url, gradient_from, gradient_to)",
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })) as { data: BidRow[] | null };

  const bidRow = (candidates ?? []).find((b) => b.id === id || b.id.startsWith(id));
  if (!bidRow) notFound();

  const skuRel = Array.isArray(bidRow.sku) ? bidRow.sku[0] : bidRow.sku;
  if (!skuRel) notFound();

  const sku: Sku = {
    id: bidRow.sku_id,
    slug: skuRel.slug,
    year: skuRel.year,
    brand: skuRel.brand,
    sport: skuRel.sport as Sku["sport"],
    set: skuRel.set_name,
    product: skuRel.product,
    releaseDate: skuRel.release_date,
    description: skuRel.description ?? "",
    imageUrl: skuRel.image_url ?? undefined,
    gradient: [skuRel.gradient_from ?? "#475569", skuRel.gradient_to ?? "#0f172a"],
  };

  const bid = {
    id: bidRow.id.length > 8 ? bidRow.id.slice(0, 8) : bidRow.id,
    skuId: bidRow.sku_id,
    price: bidRow.price_cents / 100,
    status: bidRow.status,
    expiresAt: bidRow.expires_at,
    placedAt: bidRow.created_at,
  };

  // Lowest active ask + highest active bid for market context.
  const [askRes, highestRes] = await Promise.all([
    supabase
      .from("listings")
      .select("price_cents")
      .eq("sku_id", bidRow.sku_id)
      .eq("status", "Active")
      .order("price_cents", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("bids")
      .select("price_cents")
      .eq("sku_id", bidRow.sku_id)
      .eq("status", "Active")
      .order("price_cents", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const ask = askRes.data ? askRes.data.price_cents / 100 : null;
  const currentHighest = highestRes.data ? highestRes.data.price_cents / 100 : null;
  const youAreHighest = currentHighest !== null && bid.price >= currentHighest;
  const askGap = ask !== null ? ask - bid.price : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-white/50">
        <Link href="/account" className="inline-flex items-center gap-1 hover:text-white">
          <ArrowLeft size={14} /> Account
        </Link>
        <span>/</span>
        <span className="hover:text-white">Bids</span>
        <span>/</span>
        <span className="font-mono text-white">{bid.id}</span>
      </div>

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Bid {bid.id}</h1>
          <p className="text-sm text-white/50">
            Placed {formatDate(bid.placedAt)} · expires {formatDate(bid.expiresAt)}
          </p>
        </div>
        <StatusBadge status={bid.status} />
      </div>

      <Link
        href={`/product/${sku.slug}`}
        className="block rounded-xl border border-white/10 bg-[#101012] p-5 transition hover:shadow-md"
      >
        <div className="flex gap-4">
          <ProductImage sku={sku} size="md" className="aspect-[4/5] w-24 shrink-0 rounded" />
          <div className="flex-1">
            <div className="text-base font-bold text-white">{formatSkuTitle(sku)}</div>
            <div className="text-xs text-white/50">
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
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm">
            {youAreHighest ? (
              <div className="flex items-start gap-2">
                <TrendingUp size={16} className="mt-0.5 text-emerald-400" />
                <div>
                  <div className="font-bold text-white">You&apos;re the top bidder.</div>
                  <p className="mt-0.5 text-white/60">
                    Sellers will see your bid first. If one accepts, your card is charged
                    automatically.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <TrendingDown size={16} className="mt-0.5 text-rose-400" />
                <div>
                  <div className="font-bold text-white">
                    {currentHighest !== null && currentHighest > bid.price
                      ? `You're below the top bid by ${formatUSD(currentHighest - bid.price)}.`
                      : "You're not the top bidder."}
                  </div>
                  <p className="mt-0.5 text-white/60">
                    Raise your bid to take the lead, or wait — if a seller accepts your offer
                    anyway, you still win.
                  </p>
                </div>
              </div>
            )}
            {ask !== null && askGap > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
                <Calendar size={12} className="text-white/60" />
                Buy instantly at the lowest ask: {formatUSD(ask)} ({formatUSD(askGap)} above your bid)
              </div>
            )}
          </div>

          <BidActions bidId={bid.id} currentPrice={bid.price} lowestAsk={ask} highestBid={currentHighest} skuSlug={sku.slug} />
        </>
      )}

      {bid.status === "Outbid" && (
        <div className="mt-4 rounded-xl border border-rose-700/40 bg-rose-500/10 p-4 text-sm">
          <div className="flex items-start gap-2">
            <TrendingDown size={16} className="mt-0.5 text-rose-400" />
            <div className="flex-1">
              <div className="font-bold text-rose-900">You were outbid.</div>
              <p className="mt-0.5 text-rose-200">
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
        <div className="mt-4 rounded-xl border border-emerald-700/40 bg-emerald-500/10 p-4 text-sm">
          <div className="font-bold text-emerald-100">Bid accepted</div>
          <p className="mt-1 text-emerald-200">
            A seller accepted your bid. Your card was charged {formatUSDFull(bid.price)}.
          </p>
        </div>
      )}

      {(bid.status === "Expired" || bid.status === "Canceled") && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/60">
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
    accent === "indigo" ? "text-amber-400" : accent === "emerald" ? "text-emerald-300" : "text-white";
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.02] p-2 text-center">
      <div className="text-[10px] font-semibold tracking-wider text-white/60 uppercase">{label}</div>
      <div className={`mt-0.5 text-base font-bold ${tone}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: DbBidStatus }) {
  const cfg = {
    Active: "bg-amber-500/10 text-amber-400",
    Won: "bg-emerald-500/10 text-emerald-300",
    Outbid: "bg-rose-500/10 text-rose-300",
    Expired: "bg-white/5 text-white/60",
    Canceled: "bg-white/5 text-white/60",
  }[status];
  return (
    <span className={`inline-flex rounded-md px-3 py-1.5 text-sm font-bold ${cfg}`}>{status}</span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
