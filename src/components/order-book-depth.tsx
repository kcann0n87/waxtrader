import { formatUSD, formatUSDFull } from "@/lib/utils";
import type { Listing } from "@/lib/data";

type Bid = { id: string; price: number; expiresAt: string };

/**
 * Stock-market-style depth-of-market visualization. Aggregates listings (asks)
 * and bids by price level, then renders them stacked above and below a center
 * spread row — best ask just above center, best bid just below.
 *
 * Server component; pure render off props. Hide entirely if there's no data.
 */
export function OrderBookDepth({
  listings,
  bids,
  last,
}: {
  listings: Listing[];
  bids: Bid[];
  last: number | null;
}) {
  // Aggregate asks (listings) by price level.
  const askMap = new Map<number, number>();
  for (const l of listings) {
    askMap.set(l.price, (askMap.get(l.price) ?? 0) + l.quantity);
  }
  const askLevels = [...askMap.entries()]
    .map(([price, qty]) => ({ price, qty }))
    .sort((a, b) => a.price - b.price); // ascending: best ask first

  // Aggregate bids by price level (each bid = 1 contract).
  const bidMap = new Map<number, number>();
  for (const b of bids) {
    bidMap.set(b.price, (bidMap.get(b.price) ?? 0) + 1);
  }
  const bidLevels = [...bidMap.entries()]
    .map(([price, qty]) => ({ price, qty }))
    .sort((a, b) => b.price - a.price); // descending: best bid first

  if (askLevels.length === 0 && bidLevels.length === 0) {
    return null;
  }

  // Cap at top 8 levels per side so the table stays compact.
  const topAsks = askLevels.slice(0, 8);
  const topBids = bidLevels.slice(0, 8);

  // Cumulative size for each side, used to size the depth bars.
  let cum = 0;
  const askRows = topAsks.map((l) => {
    cum += l.qty;
    return { ...l, cum };
  });
  cum = 0;
  const bidRows = topBids.map((l) => {
    cum += l.qty;
    return { ...l, cum };
  });

  // Max cumulative size across both sides — gives both depth bars a shared
  // scale so the visual comparison is honest.
  const maxCum = Math.max(
    askRows.length ? askRows[askRows.length - 1].cum : 0,
    bidRows.length ? bidRows[bidRows.length - 1].cum : 0,
    1,
  );

  const bestAsk = askLevels[0]?.price ?? null;
  const bestBid = bidLevels[0]?.price ?? null;
  const spread = bestAsk !== null && bestBid !== null ? bestAsk - bestBid : null;
  const spreadPct =
    spread !== null && bestAsk !== null && bestAsk > 0
      ? (spread / bestAsk) * 100
      : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#101012] p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="text-[10px] font-semibold tracking-[0.18em] text-amber-400/80 uppercase">
            Depth of market
          </div>
          <h2 className="font-display mt-1 text-2xl font-black tracking-tight text-white">
            Order book
          </h2>
        </div>
        <div className="hidden text-right sm:block">
          <div className="text-[10px] font-semibold tracking-[0.15em] text-white/50 uppercase">
            Levels
          </div>
          <div className="text-xs text-white/70">
            <span className="text-rose-300">{askLevels.length}</span> ask
            {askLevels.length === 1 ? "" : "s"} ·{" "}
            <span className="text-emerald-300">{bidLevels.length}</span> bid
            {bidLevels.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 border-b border-white/5 pb-2 text-[10px] font-semibold tracking-[0.15em] text-white/50 uppercase">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="w-12 text-right tabular-nums">Cum.</span>
      </div>

      {/* ASKS — render highest-to-lowest so best ask sits just above the spread. */}
      <div>
        {askRows.length === 0 ? (
          <div className="px-2 py-3 text-xs text-white/40 italic">No asks</div>
        ) : (
          [...askRows].reverse().map((r) => (
            <DepthRow
              key={`ask-${r.price}`}
              price={r.price}
              qty={r.qty}
              cum={r.cum}
              cumPct={(r.cum / maxCum) * 100}
              side="ask"
            />
          ))
        )}
      </div>

      {/* SPREAD divider */}
      <div className="my-1 flex items-center justify-between rounded-md border border-amber-700/30 bg-amber-500/[0.06] px-3 py-2 text-xs">
        <span className="text-[10px] font-semibold tracking-[0.15em] text-amber-300/80 uppercase">
          Spread
        </span>
        <span className="text-white/80">
          {spread !== null ? (
            <>
              <span className="font-display font-black text-amber-300">
                {formatUSD(spread)}
              </span>
              {spreadPct !== null && (
                <span className="ml-1.5 text-[11px] text-white/60">
                  ({spreadPct.toFixed(1)}%)
                </span>
              )}
            </>
          ) : (
            <span className="text-white/50 italic">one-sided market</span>
          )}
          {last && (
            <span className="ml-3 text-[11px] text-white/50">
              last {formatUSDFull(last)}
            </span>
          )}
        </span>
      </div>

      {/* BIDS — render highest-to-lowest, best bid first. */}
      <div>
        {bidRows.length === 0 ? (
          <div className="px-2 py-3 text-xs text-white/40 italic">No bids</div>
        ) : (
          bidRows.map((r) => (
            <DepthRow
              key={`bid-${r.price}`}
              price={r.price}
              qty={r.qty}
              cum={r.cum}
              cumPct={(r.cum / maxCum) * 100}
              side="bid"
            />
          ))
        )}
      </div>
    </div>
  );
}

function DepthRow({
  price,
  qty,
  cum,
  cumPct,
  side,
}: {
  price: number;
  qty: number;
  cum: number;
  cumPct: number;
  side: "ask" | "bid";
}) {
  const tint =
    side === "ask"
      ? "from-rose-500/15 to-rose-500/0 text-rose-300"
      : "from-emerald-500/15 to-emerald-500/0 text-emerald-300";
  const priceColor = side === "ask" ? "text-rose-200" : "text-emerald-200";
  return (
    <div className="relative grid grid-cols-[1fr_auto_auto] items-center gap-x-3 px-1 py-1.5 text-sm">
      {/* Depth bar — anchored right edge for asks, right edge for bids; same
          direction so the eye reads it as "size at this price". */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 rounded bg-gradient-to-l ${tint}`}
        style={{ width: `${cumPct}%` }}
      />
      <span className={`relative font-display font-black tabular-nums ${priceColor}`}>
        {formatUSDFull(price)}
      </span>
      <span className="relative text-right tabular-nums text-white/80">{qty}</span>
      <span className="relative w-12 text-right text-[11px] tabular-nums text-white/50">
        {cum}
      </span>
    </div>
  );
}
