import Link from "next/link";
import { AlertTriangle, ArrowDownToLine, BarChart3, Bell, Box, Clock, DollarSign, Heart, MessageCircle, Package, Settings, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { payoutHistory, seller } from "@/lib/payouts";
import { skus, lastSale } from "@/lib/data";
import { formatSkuTitle, formatUSD, formatUSDFull } from "@/lib/utils";

type OrderStatus = "Escrow" | "Shipped" | "Delivered" | "Completed";
type ListingStatus = "Active" | "Sold" | "Expired";
type BidStatus = "Active" | "Won" | "Outbid" | "Expired";

function formatShort(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const orders = [
  { id: "WM-706373", skuId: "1", price: 990, status: "Escrow" as OrderStatus, date: "2026-04-26" },
  { id: "WM-704112", skuId: "5", price: 580, status: "Shipped" as OrderStatus, date: "2026-04-23" },
  { id: "WM-700891", skuId: "10", price: 110, status: "Delivered" as OrderStatus, date: "2026-04-15" },
  { id: "WM-695420", skuId: "4", price: 195, status: "Completed" as OrderStatus, date: "2026-04-02" },
];

const myBids = [
  { id: "B-1042", skuId: "2", price: 705, status: "Active" as BidStatus, expires: "in 6 days" },
  { id: "B-1019", skuId: "11", price: 1310, status: "Active" as BidStatus, expires: "in 13 days" },
  { id: "B-998", skuId: "9", price: 215, status: "Outbid" as BidStatus, expires: "in 2 days" },
];

const myListings = [
  { id: "L-2208", skuId: "7", price: 489, status: "Active" as ListingStatus, qty: 2, listed: "2026-04-21" },
  { id: "L-2150", skuId: "10", price: 109, status: "Sold" as ListingStatus, qty: 1, listed: "2026-04-12" },
  { id: "L-2099", skuId: "12", price: 380, status: "Active" as ListingStatus, qty: 3, listed: "2026-04-08" },
];

export default function AccountPage() {
  const totalSpent = orders.reduce((sum, o) => sum + o.price, 0);
  const activeBids = myBids.filter((b) => b.status === "Active").length;
  const activeListings = myListings.filter((l) => l.status === "Active").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Account</h1>
          <p className="text-sm text-slate-500">Your orders, bids, and listings</p>
        </div>
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
          <Link
            href="/account/messages"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <MessageCircle size={14} />
            Messages
          </Link>
          <Link
            href="/account/watchlist"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Heart size={14} />
            Watchlist
          </Link>
          <Link
            href="/account/following"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Users size={14} />
            Following
          </Link>
          <Link
            href="/account/disputes"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <AlertTriangle size={14} />
            Disputes
          </Link>
          <Link
            href="/account/analytics"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <BarChart3 size={14} />
            Analytics
          </Link>
          <Link
            href="/account/payouts"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowDownToLine size={14} />
            Payouts
          </Link>
          <Link
            href="/account/alerts"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Bell size={14} />
            Alerts
          </Link>
          <Link
            href="/account/settings"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Settings size={14} />
            Settings
          </Link>
        </div>
      </div>

      <Link
        href="/account/payouts"
        className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-sm transition hover:bg-emerald-50"
      >
        <ArrowDownToLine className="text-emerald-700" size={16} />
        <span className="flex-1 text-emerald-900">
          <strong>Next payout {seller.nextPayoutDate}</strong> · {payoutHistory.length} weekly
          payouts to {seller.bankName} •••{seller.bankLast4}
        </span>
        <span className="text-xs font-semibold text-emerald-700">View →</span>
      </Link>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={<Package size={16} />} label="Orders" value={String(orders.length)} sub="all time" />
        <Stat icon={<DollarSign size={16} />} label="Spent" value={formatUSD(totalSpent)} sub="lifetime" />
        <Stat icon={<TrendingUp size={16} />} label="Active bids" value={String(activeBids)} sub="open" />
        <Stat icon={<Box size={16} />} label="Listings" value={String(activeListings)} sub="active" />
      </div>

      <Section title="Recent orders" subtitle="Includes escrow status">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-2.5">Order</th>
                <th className="px-4 py-2.5">Product</th>
                <th className="px-4 py-2.5">Price</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => {
                const sku = skus.find((s) => s.id === o.skuId)!;
                return (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/account/orders/${o.id}`} className="text-indigo-600 hover:underline">
                        {o.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/account/orders/${o.id}`} className="text-sm font-semibold text-slate-900 hover:text-indigo-600">
                        {formatSkuTitle(sku)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatUSDFull(o.price)}</td>
                    <td className="px-4 py-3">
                      <OrderBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatShort(o.date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="My bids" subtitle="Open offers waiting for a seller">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-2.5">Bid</th>
                <th className="px-4 py-2.5">Product</th>
                <th className="px-4 py-2.5">Bid price</th>
                <th className="px-4 py-2.5">Last sale</th>
                <th className="px-4 py-2.5">Expires</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myBids.map((b) => {
                const sku = skus.find((s) => s.id === b.skuId)!;
                const last = lastSale(b.skuId);
                return (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/account/bids/${b.id}`} className="text-indigo-600 hover:underline">
                        {b.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/account/bids/${b.id}`} className="text-sm font-semibold text-slate-900 hover:text-indigo-600">
                        {formatSkuTitle(sku)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatUSDFull(b.price)}</td>
                    <td className="px-4 py-3 text-slate-500">{last ? formatUSDFull(last) : "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{b.expires}</td>
                    <td className="px-4 py-3">
                      <BidBadge status={b.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="My listings" subtitle="Boxes you've put on the market">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-2.5">Listing</th>
                <th className="px-4 py-2.5">Product</th>
                <th className="px-4 py-2.5">Ask</th>
                <th className="px-4 py-2.5">Qty</th>
                <th className="px-4 py-2.5">Listed</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myListings.map((l) => {
                const sku = skus.find((s) => s.id === l.skuId)!;
                return (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/account/listings/${l.id}`} className="text-indigo-600 hover:underline">
                        {l.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/account/listings/${l.id}`} className="text-sm font-semibold text-slate-900 hover:text-indigo-600">
                        {formatSkuTitle(sku)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatUSDFull(l.price)}</td>
                    <td className="px-4 py-3 text-slate-500">{l.qty}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatShort(l.listed)}
                    </td>
                    <td className="px-4 py-3">
                      <ListingBadge status={l.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-400">{sub}</div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function OrderBadge({ status }: { status: OrderStatus }) {
  const config = {
    Escrow: { bg: "bg-amber-50", text: "text-amber-700", icon: <ShieldCheck size={11} /> },
    Shipped: { bg: "bg-sky-50", text: "text-sky-700", icon: <Package size={11} /> },
    Delivered: { bg: "bg-emerald-50", text: "text-emerald-700", icon: <Package size={11} /> },
    Completed: { bg: "bg-slate-100", text: "text-slate-600", icon: <Clock size={11} /> },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  );
}

function BidBadge({ status }: { status: BidStatus }) {
  const config = {
    Active: "bg-indigo-50 text-indigo-700",
    Won: "bg-emerald-50 text-emerald-700",
    Outbid: "bg-rose-50 text-rose-700",
    Expired: "bg-slate-100 text-slate-600",
  }[status];
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${config}`}>
      {status}
    </span>
  );
}

function ListingBadge({ status }: { status: ListingStatus }) {
  const config = {
    Active: "bg-emerald-50 text-emerald-700",
    Sold: "bg-indigo-50 text-indigo-700",
    Expired: "bg-slate-100 text-slate-600",
  }[status];
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${config}`}>
      {status}
    </span>
  );
}
