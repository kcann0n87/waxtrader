import Link from "next/link";
import { ArrowDownToLine, Building2, CheckCircle2, Clock, ExternalLink, ShieldCheck } from "lucide-react";
import { skus } from "@/lib/data";
import { lifecycleLabel, payoutHistory, pending, seller } from "@/lib/payouts";
import { formatSkuTitle, formatUSD, formatUSDFull } from "@/lib/utils";

export default function PayoutsDashboard() {
  const releasedToday = pending.filter((p) => p.status === "Released" || p.status === "Delivered");
  const releasedTodayTotal = releasedToday.reduce((s, p) => s + p.netToSeller, 0);

  const enroute = pending.filter((p) => p.status === "Shipped" || p.status === "InEscrow");
  const enrouteTotal = enroute.reduce((s, p) => s + p.netToSeller, 0);

  const last30 = payoutHistory.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-white/50">
        <Link href="/account" className="hover:text-white">
          Account
        </Link>
        <span>/</span>
        <span className="text-white">Payouts</span>
      </div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Payouts</h1>
          <p className="text-sm text-white/50">Weekly ACH every Friday for sales released that week</p>
        </div>
        <Link
          href="/sell/payouts"
          className="rounded-md border border-white/15 bg-[#101012] px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/[0.02]"
        >
          Manage payout settings
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <BigStat
          icon={<ArrowDownToLine size={18} />}
          accent="emerald"
          label={`Next payout · ${seller.nextPayoutDate}`}
          value={formatUSD(releasedTodayTotal)}
          sub={`${releasedToday.length} released order${releasedToday.length === 1 ? "" : "s"} · arrives ACH next business day`}
        />
        <BigStat
          icon={<Clock size={18} />}
          accent="amber"
          label="Held / pending"
          value={formatUSD(enrouteTotal)}
          sub={`${enroute.length} order${enroute.length === 1 ? "" : "s"} · awaiting ship or delivery`}
        />
        <BigStat
          icon={<CheckCircle2 size={18} />}
          accent="slate"
          label="Paid in last 30d"
          value={formatUSD(last30)}
          sub={`${payoutHistory.length} weekly payouts to •••${seller.bankLast4}`}
        />
      </div>

      <div className="mb-6 rounded-xl border border-emerald-700/40 bg-emerald-500/10 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 text-emerald-400" size={20} />
          <div>
            <div className="text-sm font-bold text-emerald-100">Account verified</div>
            <div className="text-xs text-emerald-200">
              {seller.taxStatus} · Payouts to <strong>{seller.bankName} •••{seller.bankLast4}</strong> · {seller.payoutSchedule}
            </div>
          </div>
          <Link
            href="/sell/payouts"
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-200 hover:underline"
          >
            Update <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      <Section title="Pending balance" subtitle="Sales not yet paid out — broken down by lifecycle status">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-white/[0.02] text-left text-xs font-semibold tracking-wider text-white/50 uppercase">
              <tr>
                <th className="px-4 py-2.5">Order</th>
                <th className="px-4 py-2.5">Product</th>
                <th className="px-4 py-2.5">Gross</th>
                <th className="px-4 py-2.5">Fee</th>
                <th className="px-4 py-2.5">Net to you</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pending.map((p) => {
                const sku = skus.find((s) => s.id === p.skuId)!;
                return (
                  <tr key={p.orderId} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs text-white/50">{p.orderId}</td>
                    <td className="px-4 py-3">
                      <Link href={`/product/${sku.slug}`} className="text-sm font-semibold text-white hover:text-amber-300">
                        {formatSkuTitle(sku)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white/80">{formatUSDFull(p.grossSale)}</td>
                    <td className="px-4 py-3 text-rose-400">-{formatUSDFull(p.fee + p.processing)}</td>
                    <td className="px-4 py-3 font-bold text-white">{formatUSDFull(p.netToSeller)}</td>
                    <td className="px-4 py-3">
                      <LifecycleBadge status={p.status} eta={p.releaseEta} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-white/[0.02] text-sm font-bold text-white">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right">
                  Total pending
                </td>
                <td className="px-4 py-3">{formatUSDFull(releasedTodayTotal + enrouteTotal)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>

      <Section title="Payout history" subtitle="ACH transfers to your bank account">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-white/[0.02] text-left text-xs font-semibold tracking-wider text-white/50 uppercase">
              <tr>
                <th className="px-4 py-2.5">Payout</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Bank</th>
                <th className="px-4 py-2.5">Initiated</th>
                <th className="px-4 py-2.5">Arrived</th>
                <th className="px-4 py-2.5">Orders</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payoutHistory.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs text-white/50">{p.id}</td>
                  <td className="px-4 py-3 font-bold text-white">{formatUSDFull(p.amount)}</td>
                  <td className="px-4 py-3 text-white/60">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={12} className="text-white/40" />
                      •••{p.bankLast4}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50">{formatDate(p.initiated)}</td>
                  <td className="px-4 py-3 text-white/50">{formatDate(p.arrivesBy)}</td>
                  <td className="px-4 py-3 text-white/50">{p.ordersIncluded.length}</td>
                  <td className="px-4 py-3">
                    <PayoutBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/60">
        <div className="font-semibold text-white/90">When you get paid</div>
        <p className="mt-1.5">
          Buyer payments are charged at checkout and held in escrow. When the buyer confirms
          delivery (or the 3-day auto-confirm window passes), funds are released to your pending
          balance. Every Friday, all released sales for the week are bundled into a single ACH
          transfer that lands in your bank by the next business day.
        </p>
      </div>
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function BigStat({
  icon,
  accent,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  accent: "emerald" | "amber" | "slate";
  label: string;
  value: string;
  sub: string;
}) {
  const tones = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-700/40",
    amber: "bg-amber-500/10 text-amber-400 border-amber-700/40",
    slate: "bg-white/5 text-white/60 border-white/10",
  }[accent];
  return (
    <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${tones}`}>
          {icon}
        </div>
        <div>
          <div className="text-xs font-semibold tracking-wider text-white/40 uppercase">{label}</div>
          <div className="text-2xl font-bold text-white">{value}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-white/50">{sub}</div>
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
        <h2 className="text-base font-bold text-white">{title}</h2>
        <p className="text-xs text-white/50">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function LifecycleBadge({
  status,
  eta,
}: {
  status: import("@/lib/payouts").OrderLifecycleStatus;
  eta?: string;
}) {
  const cfg = {
    Charged: "bg-white/5 text-white/60",
    InEscrow: "bg-amber-500/10 text-amber-300",
    Shipped: "bg-sky-500/10 text-sky-300",
    Delivered: "bg-amber-500/10 text-amber-400",
    Released: "bg-emerald-500/10 text-emerald-300",
    PaidOut: "bg-white/5 text-white/60",
  }[status];
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`inline-flex w-fit rounded-md px-2 py-1 text-xs font-semibold ${cfg}`}>
        {lifecycleLabel(status)}
      </span>
      {eta && <span className="text-[11px] text-white/40">{eta}</span>}
    </div>
  );
}

function PayoutBadge({ status }: { status: import("@/lib/payouts").PayoutStatus }) {
  const cfg = {
    Pending: "bg-white/5 text-white/60",
    InTransit: "bg-sky-500/10 text-sky-300",
    Paid: "bg-emerald-500/10 text-emerald-300",
    Failed: "bg-rose-500/10 text-rose-300",
  }[status];
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${cfg}`}>
      {status === "InTransit" ? "In transit" : status}
    </span>
  );
}
