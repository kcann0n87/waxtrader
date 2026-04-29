import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Package,
  ShieldCheck,
  Star,
} from "lucide-react";
import { FeedbackSummary } from "@/components/feedback-summary";
import { FollowButton } from "@/components/follow-button";
import { ProductImage } from "@/components/product-image";
import { listingsForSku, skus } from "@/lib/data";
import { findSeller, reviewsForSeller, sellers, type Verdict } from "@/lib/sellers";
import { formatSkuTitle, formatUSDFull } from "@/lib/utils";

export default async function SellerStorefrontPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const seller = findSeller(username);
  if (!seller) notFound();

  const reviews = reviewsForSeller(username);

  // Build a list of products this seller has any listings for
  const sellerListings = skus
    .map((sku) => {
      const ls = listingsForSku(sku.id).filter((l) => l.seller === username);
      if (ls.length === 0) return null;
      return { sku, listing: ls[0], stock: ls.length };
    })
    .filter((x): x is { sku: typeof skus[number]; listing: ReturnType<typeof listingsForSku>[number]; stock: number } => x !== null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link
        href="/"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={14} /> Back to marketplace
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div
          className="h-32 md:h-40"
          style={{
            background: `linear-gradient(135deg, ${gradientFromUsername(seller.username)})`,
          }}
        />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end gap-4">
            <Avatar name={seller.displayName} large />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  {seller.displayName}
                </h1>
                {seller.verified && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={12} />
                    Verified
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="font-mono">@{seller.username}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} /> {seller.location}
                </span>
                <span>Joined {formatJoined(seller.joinedAt)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/account/messages/new?to=${seller.username}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                <MessageCircle size={14} />
                Message
              </Link>
              <FollowButton username={seller.username} />
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm text-slate-600">{seller.bio}</p>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
            <Stat icon={<Package size={14} />} label="Total sales">
              <span className="font-bold text-slate-900">{seller.totalSales.toLocaleString()}</span>
            </Stat>
            <Stat icon={<Clock size={14} />} label="Response time">
              <span className="font-bold text-slate-900">{seller.responseTime}</span>
            </Stat>
            <Stat icon={<ShieldCheck size={14} />} label="Member since">
              <span className="font-bold text-slate-900">{formatJoined(seller.joinedAt)}</span>
            </Stat>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <FeedbackSummary username={username} />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active listings</h2>
            <p className="text-sm text-slate-500">
              {sellerListings.length}{" "}
              {sellerListings.length === 1 ? "product" : "products"} available
            </p>
          </div>
        </div>

        {sellerListings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <Package className="mx-auto text-slate-400" size={32} />
            <p className="mt-3 text-sm font-bold text-slate-900">No active listings</p>
            <p className="mt-1 text-sm text-slate-500">
              {seller.displayName} doesn&apos;t have anything listed right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {sellerListings.slice(0, 12).map(({ sku, listing, stock }) => (
              <Link
                key={sku.id}
                href={`/product/${sku.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:shadow-md"
              >
                <ProductImage sku={sku} size="card" className="aspect-[4/5]" />
                <div className="flex flex-1 flex-col p-3">
                  <div className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
                    {formatSkuTitle(sku)}
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                        Their ask
                      </div>
                      <div className="text-base font-bold text-slate-900">
                        {formatUSDFull(listing.price)}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">{stock} listed</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent feedback</h2>
            <p className="text-sm text-slate-500">
              {reviews.length === 0 ? "No reviews yet" : `${reviews.length} buyer reviews`}
            </p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Reviews will appear here after buyers complete orders.
          </div>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => {
              const sku = skus.find((s) => s.id === r.skuId);
              return (
                <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name={r.reviewer} />
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-slate-900">{r.reviewer}</div>
                          <VerdictTag verdict={r.verdict} />
                        </div>
                        <div className="text-xs text-slate-400">{formatTs(r.ts)}</div>
                      </div>
                      <Stars stars={r.stars} />
                      {sku && (
                        <Link
                          href={`/product/${sku.slug}`}
                          className="mt-1 block text-xs text-slate-500 hover:text-indigo-600"
                        >
                          on {formatSkuTitle(sku)}
                        </Link>
                      )}
                      <p className="mt-2 text-sm text-slate-700">{r.text}</p>
                      {r.sellerReply && (
                        <div className="mt-3 rounded-md border-l-2 border-indigo-200 bg-indigo-50/40 px-3 py-2">
                          <div className="text-xs font-bold text-slate-700">
                            {seller.displayName} replied
                          </div>
                          <p className="mt-0.5 text-sm text-slate-700">{r.sellerReply.text}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-base">{children}</div>
    </div>
  );
}

function Avatar({ name, large }: { name: string; large?: boolean }) {
  const initial = name[0]?.toUpperCase() ?? "?";
  const colors = [
    "bg-emerald-600",
    "bg-sky-600",
    "bg-rose-600",
    "bg-amber-600",
    "bg-violet-600",
    "bg-cyan-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const size = large ? "h-24 w-24 text-3xl ring-4 ring-white" : "h-10 w-10 text-base";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${color} ${size}`}
    >
      {initial}
    </div>
  );
}

function VerdictTag({ verdict }: { verdict: Verdict }) {
  const cfg = {
    positive: "bg-emerald-50 text-emerald-700",
    neutral: "bg-amber-50 text-amber-700",
    negative: "bg-rose-50 text-rose-700",
  }[verdict];
  const label = verdict[0].toUpperCase() + verdict.slice(1);
  return (
    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase ${cfg}`}>
      {label}
    </span>
  );
}

function Stars({ stars }: { stars: number }) {
  return (
    <div className="mt-1 flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          className={n <= stars ? "fill-amber-400 text-amber-400" : "text-slate-200"}
        />
      ))}
    </div>
  );
}

function gradientFromUsername(u: string) {
  const palettes = [
    "#4f46e5, #7c3aed",
    "#0ea5e9, #06b6d4",
    "#dc2626, #f59e0b",
    "#16a34a, #84cc16",
    "#7c3aed, #ec4899",
    "#0c4a6e, #0891b2",
  ];
  return palettes[u.charCodeAt(0) % palettes.length];
}

function formatJoined(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatTs(ts: string) {
  const [date] = ts.split(" ");
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function generateStaticParams() {
  return sellers.map((s) => ({ username: s.username }));
}
