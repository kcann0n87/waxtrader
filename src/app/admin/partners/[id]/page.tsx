import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, DollarSign, ShoppingBag, Users } from "lucide-react";
import { serviceRoleClient } from "@/lib/supabase/admin";
import { TIER_FEE } from "@/lib/fees";
import { formatUSD } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Earnings calculation, server-side:
 *
 *   1. Look up every profile with referred_by_partner_id = this.id
 *   2. For each referred user, find orders where they are seller OR
 *      buyer, status in (Released, Completed), within their
 *      referral window (referred_at + partner.commission_window_days)
 *   3. Sum order.total_cents
 *   4. Apply platform fee (Starter 12% currently; later: per-seller tier)
 *   5. Apply partner commission_rate
 *
 * Result: partner gets `gross_fee × commission_rate` per qualifying
 * order. We display gross (total user GMV), platform fees earned,
 * partner's cut, and already-paid (sum of partner_payouts).
 */
export default async function AdminPartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = serviceRoleClient();

  const { data: partner } = await sb
    .from("partners")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!partner) notFound();

  // Referred users
  const { data: refs } = await sb
    .from("profiles")
    .select("id, display_name, username, referred_at")
    .eq("referred_by_partner_id", partner.id);
  const refList = refs ?? [];

  // Orders involving any referred user as buyer OR seller. We pull
  // a generous status set; only Released/Completed actually earn
  // commission (the others might revert or refund).
  let totalGmvCents = 0;
  let qualifyingOrders = 0;
  const refIds = refList.map((r) => r.id);
  const refsById = new Map(refList.map((r) => [r.id, r]));

  if (refIds.length > 0) {
    const { data: orders } = await sb
      .from("orders")
      .select(
        "id, buyer_id, seller_id, status, total_cents, placed_at, released_at",
      )
      .or(
        `buyer_id.in.(${refIds.join(",")}),seller_id.in.(${refIds.join(",")})`,
      );

    const windowMs = partner.commission_window_days * 24 * 60 * 60 * 1000;
    const validStatuses = new Set(["Released", "Completed"]);

    for (const o of orders ?? []) {
      if (!validStatuses.has(o.status)) continue;
      // Determine the referred user on this order. If both buyer and
      // seller were referred by the same partner, count once.
      const matchedUser =
        refsById.get(o.buyer_id) ?? refsById.get(o.seller_id);
      if (!matchedUser?.referred_at) continue;

      const referredAt = new Date(matchedUser.referred_at).getTime();
      const orderAt = new Date(o.placed_at).getTime();
      if (orderAt - referredAt > windowMs) continue;

      totalGmvCents += o.total_cents;
      qualifyingOrders++;
    }
  }

  // Platform fee = average of TIER_FEE.Starter for simplicity (every
  // seller is currently hardcoded to Starter in orders.ts). Once
  // per-seller tiers wire in, recompute via seller's actual tier.
  const platformFeeCents = Math.round(totalGmvCents * TIER_FEE.Starter);
  const partnerEarnedCents = Math.round(
    platformFeeCents * partner.commission_rate,
  );

  // Already-paid
  const { data: payouts } = await sb
    .from("partner_payouts")
    .select("amount_cents, period_through, created_at, notes")
    .eq("partner_id", partner.id)
    .order("created_at", { ascending: false });
  const paidCents = (payouts ?? []).reduce(
    (s, p) => s + p.amount_cents,
    0,
  );
  const owedCents = Math.max(0, partnerEarnedCents - paidCents);

  return (
    <div>
      <Link
        href="/admin/partners"
        className="mb-3 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white"
      >
        <ArrowLeft size={12} /> All partners
      </Link>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight text-white">
            {partner.name}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <code className="rounded bg-amber-500/15 px-2 py-0.5 font-mono font-bold text-amber-300">
              {partner.code}
            </code>
            <span className="text-white/50">
              {(partner.commission_rate * 100).toFixed(1)}% of fees ·{" "}
              {partner.commission_window_days >= 36500
                ? "lifetime"
                : `${partner.commission_window_days}d window`}
            </span>
            {!partner.is_active && (
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/60">
                PAUSED
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/70">
        Share link:{" "}
        <code className="font-mono text-amber-300">
          https://waxdepot.io/?ref={partner.code}
        </code>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          icon={<Users size={14} />}
          label="Referred users"
          value={String(refList.length)}
        />
        <Stat
          icon={<ShoppingBag size={14} />}
          label="Qualifying orders"
          value={String(qualifyingOrders)}
          sub="Released or Completed within window"
        />
        <Stat
          icon={<DollarSign size={14} />}
          label="GMV from referrals"
          value={formatUSD(totalGmvCents / 100)}
        />
        <Stat
          icon={<DollarSign size={14} />}
          label="Partner earned"
          value={formatUSD(partnerEarnedCents / 100)}
          sub={`${(partner.commission_rate * 100).toFixed(0)}% of ${formatUSD(platformFeeCents / 100)} fees`}
          accent="amber"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#101012] p-4">
          <div className="text-[10px] font-semibold tracking-[0.15em] text-white/60 uppercase">
            Paid out so far
          </div>
          <div className="font-display mt-1 text-2xl font-black text-white">
            {formatUSD(paidCents / 100)}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-700/30 bg-emerald-500/[0.05] p-4">
          <div className="text-[10px] font-semibold tracking-[0.15em] text-emerald-200/80 uppercase">
            Owed now
          </div>
          <div className="font-display mt-1 text-2xl font-black text-emerald-300">
            {formatUSD(owedCents / 100)}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-bold text-white">Referred users</h2>
        {refList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-white/50">
            No signups via this code yet.
          </div>
        ) : (
          <ul className="divide-y divide-white/5 rounded-xl border border-white/10">
            {refList.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="text-sm font-semibold text-white">
                  {r.display_name ?? r.username ?? r.id}
                </div>
                {r.username && (
                  <code className="text-xs text-white/40">@{r.username}</code>
                )}
                {r.referred_at && (
                  <span className="ml-auto text-xs text-white/40">
                    Joined {new Date(r.referred_at).toLocaleDateString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-bold text-white">Payout history</h2>
        {(payouts ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-white/50">
            No payouts logged yet. When you send a payout (via Stripe Connect
            or direct bank transfer), record it via the partner_payouts
            table to subtract from &quot;Owed now.&quot;
          </div>
        ) : (
          <ul className="divide-y divide-white/5 rounded-xl border border-white/10">
            {(payouts ?? []).map((p, i) => (
              <li
                key={i}
                className="flex items-center gap-3 px-4 py-2.5 text-sm"
              >
                <span className="font-bold text-white">
                  {formatUSD(p.amount_cents / 100)}
                </span>
                <span className="text-xs text-white/50">
                  Period through{" "}
                  {new Date(p.period_through).toLocaleDateString()}
                </span>
                {p.notes && (
                  <span className="ml-auto text-xs text-white/40">
                    {p.notes}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: "amber";
}) {
  return (
    <div
      className={
        accent === "amber"
          ? "rounded-xl border border-amber-700/30 bg-amber-500/[0.05] p-4"
          : "rounded-xl border border-white/10 bg-[#101012] p-4"
      }
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/60 uppercase">
        {icon}
        {label}
      </div>
      <div
        className={
          accent === "amber"
            ? "font-display mt-2 text-2xl font-black text-amber-300"
            : "font-display mt-2 text-2xl font-black text-white"
        }
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-white/50">{sub}</div>}
    </div>
  );
}
