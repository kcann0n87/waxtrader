// WaxDepot fee model — flat commission, no separate payment processing line.
// (We absorb Stripe's 2.9% + $0.30 internally.)
//
// Four-tier ladder. Sellers qualify for the next tier by hitting EITHER the
// rolling-30-day sales count OR the rolling-30-day GMV threshold, plus the
// minimum positive-feedback bar. OR logic rewards both retail-volume sellers
// (lots of small orders) and high-ticket dealers (few large orders).

export type SellerTier = "Starter" | "Pro" | "Elite" | "Apex";

export const TIER_FEE: Record<SellerTier, number> = {
  Starter: 0.12,
  Pro: 0.10,
  Elite: 0.08,
  Apex: 0.06,
};

export const TIER_THRESHOLDS = {
  Pro: { sales: 30, gmvCents: 500_000, positivePct: 99 },        // $5k
  Elite: { sales: 150, gmvCents: 1_000_000, positivePct: 99.5 }, // $10k
  Apex: { sales: 1000, gmvCents: 10_000_000, positivePct: 99.5 }, // $100k
} as const;

export const TIER_PAYOUT_CADENCE: Record<SellerTier, string> = {
  Starter: "Weekly Friday",
  Pro: "Twice-weekly (Tue + Fri)",
  Elite: "Every 3 days",
  Apex: "Next business day",
};

/**
 * Default tier used by all the UI flows until we have real seller data.
 * Once auth + analytics are wired, swap this for a per-user lookup.
 */
export const CURRENT_USER_TIER: SellerTier = "Starter";

export function feeRateFor(tier: SellerTier = CURRENT_USER_TIER) {
  return TIER_FEE[tier];
}

export function calcFee(saleAmount: number, tier: SellerTier = CURRENT_USER_TIER) {
  return saleAmount * TIER_FEE[tier];
}

export function calcPayout(saleAmount: number, tier: SellerTier = CURRENT_USER_TIER) {
  return saleAmount - calcFee(saleAmount, tier);
}

/**
 * Numeric ordering of tiers so the recompute cron can compare "is the
 * qualifying tier higher / equal / lower than the current tier."
 * Higher number = more premium tier (= lower fee).
 */
export const TIER_RANK: Record<SellerTier, number> = {
  Starter: 0,
  Pro: 1,
  Elite: 2,
  Apex: 3,
};

/**
 * Returns the last moment of NEXT calendar month from `now` in UTC. Used
 * by the tier-recompute cron to set `tier_expires_at` whenever a seller
 * qualifies for or re-qualifies for a tier.
 *
 *   now = 2026-05-15  →  2026-06-30 23:59:59.999 UTC
 *   now = 2026-05-31  →  2026-06-30 23:59:59.999 UTC
 *   now = 2026-12-15  →  2027-01-31 23:59:59.999 UTC
 *
 * `Date.UTC(year, month, 0)` returns the last day of the month before
 * `month`, so passing `getUTCMonth() + 2` lands on the last day of next
 * month.
 */
export function endOfNextMonth(now: Date = new Date()): Date {
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + 2,
      0,
      23,
      59,
      59,
      999,
    ),
  );
}

/**
 * Compute the seller's tier from their rolling-30-day stats. The OR logic
 * on (sales | gmv) means a small-volume / high-ticket seller (e.g. 4 case
 * sales worth $20k) earns the same tier as a high-volume / low-ticket
 * seller (e.g. 200 blasters worth $6k).
 *
 * Apex additionally requires zero unresolved disputes — top-tier sellers
 * have to be cleanly operating, not just high-volume.
 */
export function tierFromMonthlyStats(
  salesLast30d: number,
  gmvLast30dCents: number,
  positivePct: number,
  unresolvedDisputes = 0,
): SellerTier {
  if (
    positivePct >= TIER_THRESHOLDS.Apex.positivePct &&
    unresolvedDisputes === 0 &&
    (salesLast30d >= TIER_THRESHOLDS.Apex.sales ||
      gmvLast30dCents >= TIER_THRESHOLDS.Apex.gmvCents)
  )
    return "Apex";

  if (
    positivePct >= TIER_THRESHOLDS.Elite.positivePct &&
    (salesLast30d >= TIER_THRESHOLDS.Elite.sales ||
      gmvLast30dCents >= TIER_THRESHOLDS.Elite.gmvCents)
  )
    return "Elite";

  if (
    positivePct >= TIER_THRESHOLDS.Pro.positivePct &&
    (salesLast30d >= TIER_THRESHOLDS.Pro.sales ||
      gmvLast30dCents >= TIER_THRESHOLDS.Pro.gmvCents)
  )
    return "Pro";

  return "Starter";
}
