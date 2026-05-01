import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDownToLine, Building2, CheckCircle2, Clock, ExternalLink, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calcFee, calcPayout } from "@/lib/fees";
import { formatSkuTitle, formatUSD, formatUSDFull } from "@/lib/utils";

export const dynamic = "force-dynamic";

type LifecycleStatus = "Charged" | "InEscrow" | "Shipped" | "Delivered" | "Released";
type PayoutStatus = "Pending" | "InTransit" | "Paid" | "Failed";

type SkuJoin = {
  slug: string;
  year: number;
  brand: string;
  set_name: string;
  product: string;
  sport: string;
} | null;

type PendingOrderRow = {
  id: string;
  price_cents: number;
  status: LifecycleStatus;
  shipped_at: string | null;
  delivered_at: string | null;
  released_at: string | null;
  estimated_delivery: string | null;
  sku: SkuJoin | SkuJoin[];
};

type PayoutRow = {
  id: string;
  amount_cents: number;
  status: PayoutStatus;
  initiated_at: string;
  arrives_by: string | null;
  bank_last4: string | null;
};

export default async function PayoutsDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/payouts");

  const since30d = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [pendingRes, payoutsRes, profileRes, payoutAccountRes] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, price_cents, status, shipped_at, delivered_at, released_at, estimated_delivery, sku:skus!orders_sku_id_fkey(slug, year, brand, set_name, product, sport)",
      )
      .eq("seller_id", user.id)
      .eq("payment_status", "paid")
      .is("stripe_transfer_id", null)
      .in("status", ["Charged", "InEscrow", "Shipped", "Delivered", "Released"])
      .order("placed_at", { ascending: false }),
    supabase
      .from("payouts")
      .select("id, amount_cents, status, initiated_at, arrives_by, bank_last4")
      .eq("seller_id", user.id)
      .gte("initiated_at", since30d)
      .order("initiated_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("stripe_charges_enabled, stripe_payouts_enabled, stripe_details_submitted")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("payout_accounts")
      .select("bank_name, bank_last4, is_verified")
      .eq("seller_id", user.id)
      .maybeSingle(),
  ]);

  const pending = ((pendingRes.data ?? []) as PendingOrderRow[]).map((r) => {
    const sku = Array.isArray(r.sku) ? r.sku[0] : r.sku;
    const gross = r.price_cents / 100;
    return {
      orderId: r.id,
      sku,
      grossSale: gross,
      fee: calcFee(gross),
      processing: 0,
      netToSeller: calcPayout(gross),
      status: r.status,
      releaseEta: lifecycleEta(r),
    };
  });

  const releasedToday = pending.filter((p) => p.status === "Released" || p.status === "Delivered");
  const releasedTodayTotal = releasedToday.reduce((s, p) => s + p.netToSeller, 0);

  const enroute = pending.filter(
    (p) => p.status === "Shipped" || p.status === "InEscrow" || p.status === "Charged",
  );
  const enrouteTotal = enroute.reduce((s, p) => s + p.netToSeller, 0);

  const payouts = (payoutsRes.data ?? []) as PayoutRow[];

  const ordersByPayout = new Map<string, number>();
  if (payouts.length > 0) {
    const { data: poRows } = await supabase
      .from("payout_orders")
      .select("payout_id")
      .in(
        "payout_id",
        payouts.map((p) => p.id),
      );
    for (const row of (poRows ?? []) as { payout_id: string }[]) {
      ordersByPayout.set(row.payout_id, (ordersByPayout.get(row.payout_id) ?? 0) + 1);
    }
  }

  const last30 = payouts.reduce((s, p) => s + p.amount_cents / 100, 0);

  const profile = profileRes.data;
  const payoutAccount = payoutAccountRes.data;
  const stripeReady = !!profile?.stripe_charges_enabled && !!profile?.stripe_payouts_enabled;
  const verified = !!payoutAccount?.is_verified || stripeReady;
  const bankName = payoutAccount?.bank_name ?? (stripeReady ? "Stripe-managed" : "Not linked");
  const bankLast4 =
    payoutAccount?.bank_last4 ?? payouts.find((p) => p.bank_last4)?.bank_last4 ?? "----";
  const taxStatus = stripeReady ? "Verified · 1099-K eligible" : "Stripe setup pending";
  const payoutSchedule = "Weekly — every Friday for sales released that week";
  const nextPayoutDate = formatNextFriday();

  const hasNothing = pending.length === 0 && payouts.length === 0;

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
          label={`Next payout · ${nextPayoutDate}`}
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
          sub={`${payouts.length} weekly payout${payouts.length === 1 ? "" : "s"} to •••${bankLast4}`}
        />
      </div>

      <div
        className={`mb-6 rounded-xl border p-4 ${
          verified
            ? "border-emerald-700/40 bg-emerald-500/10"
            : "border-amber-700/40 bg-amber-500/10"
        }`}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck
            className={`mt-0.5 ${verified ? "text-emerald-400" : "text-amber-300"}`}
            size={20}
          />
          <div>
            <div
              className={`text-sm font-bold ${verified ? "text-emerald-100" : "text-amber-100"}`}
            >
              {verified ? "Account verified" : "Finish payout setup"}
            </div>
            <div
              className={`text-xs ${verified ? "text-emerald-200" : "text-amber-200"}`}
            >
              {taxStatus} · Payouts to{" "}
              <strong>
                {bankName} •••{bankLast4}
              </strong>{" "}
              · {payoutSchedule}
            </div>
          </div>
          <Link
            href="/sell/payouts"
            className={`ml-auto inline-flex items-center gap-1 text-xs font-semibold hover:underline ${
              verified ? "text-emerald-200" : "text-amber-200"
            }`}
          >
            {verified ? "Update" : "Set up"} <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {hasNothing && (
        <div className="mb-6 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/60">
            <ArrowDownToLine size={20} />
          </div>
          <h2 className="mt-4 text-base font-bold text-white">No activity yet</h2>
          <p className="mt-1 text-sm text-white/60">
            Your sales and payouts will land here once buyers start checking out from your listings.
          </p>
        </div>
      )}

      {pending.length > 0 && (
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
                {pending.map((p) => (
                  <tr key={p.orderId} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs text-white/50">{p.orderId}</td>
                    <td className="px-4 py-3">
                      {p.sku ? (
                        <Link
                          href={`/product/${p.sku.slug}`}
                          className="text-sm font-semibold text-white hover:text-amber-300"
                        >
                          {formatSkuTitle({
                            year: p.sku.year,
                            brand: p.sku.brand,
                            set: p.sku.set_name,
                            product: p.sku.product,
                            sport: p.sku.sport,
                          })}
                        </Link>
                      ) : (
                        <span className="text-sm text-white/50">Unknown product</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/80">{formatUSDFull(p.grossSale)}</td>
                    <td className="px-4 py-3 text-rose-400">-{formatUSDFull(p.fee + p.processing)}</td>
                    <td className="px-4 py-3 font-bold text-white">{formatUSDFull(p.netToSeller)}</td>
                    <td className="px-4 py-3">
                      <LifecycleBadge status={p.status} eta={p.releaseEta} />
                    </td>
                  </tr>
                ))}
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
      )}

      {payouts.length > 0 && (
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
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs text-white/50">{p.id}</td>
                    <td className="px-4 py-3 font-bold text-white">
                      {formatUSDFull(p.amount_cents / 100)}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 size={12} className="text-white/60" />
                        •••{p.bank_last4 ?? "----"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50">{formatDateLong(p.initiated_at)}</td>
                    <td className="px-4 py-3 text-white/50">
                      {p.arrives_by ? formatDateShort(p.arrives_by) : "—"}
                    </td>
                    <td className="px-4 py-3 text-white/50">{ordersByPayout.get(p.id) ?? 0}</td>
                    <td className="px-4 py-3">
                      <PayoutBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

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

function lifecycleEta(r: {
  status: LifecycleStatus;
  estimated_delivery: string | null;
  released_at: string | null;
}): string | undefined {
  switch (r.status) {
    case "Released":
      return "In Friday's payout";
    case "Delivered":
      return "Released today";
    case "Shipped":
      return r.estimated_delivery ? `Delivers ~${formatDateShort(r.estimated_delivery)}` : "Pending delivery";
    case "InEscrow":
    case "Charged":
      return "Awaiting ship";
    default:
      return undefined;
  }
}

function lifecycleLabel(s: LifecycleStatus): string {
  return {
    Charged: "Charged",
    InEscrow: "Escrow",
    Shipped: "Shipped",
    Delivered: "Delivered",
    Released: "Released",
  }[s];
}

function formatNextFriday() {
  const d = new Date();
  const day = d.getDay();
  // 5 = Friday. If today is Friday, jump to next week.
  const diff = ((5 - day + 7) % 7) || 7;
  d.setDate(d.getDate() + diff);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
          <div className="text-xs font-semibold tracking-wider text-white/60 uppercase">{label}</div>
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

function LifecycleBadge({ status, eta }: { status: LifecycleStatus; eta?: string }) {
  const cfg = {
    Charged: "bg-white/5 text-white/60",
    InEscrow: "bg-amber-500/10 text-amber-300",
    Shipped: "bg-sky-500/10 text-sky-300",
    Delivered: "bg-amber-500/10 text-amber-400",
    Released: "bg-emerald-500/10 text-emerald-300",
  }[status];
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`inline-flex w-fit rounded-md px-2 py-1 text-xs font-semibold ${cfg}`}>
        {lifecycleLabel(status)}
      </span>
      {eta && <span className="text-[11px] text-white/60">{eta}</span>}
    </div>
  );
}

function PayoutBadge({ status }: { status: PayoutStatus }) {
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
