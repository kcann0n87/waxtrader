/**
 * Skeleton shown while a product page SSR. The page fan-outs 7 parallel
 * Supabase queries (listings, bids, history, sales, ask, bid, last) so
 * there's a real moment of latency on click-through from search/home.
 *
 * Mirrors the actual layout — image + spec column, price chart card,
 * order book card — so the user sees structure stay put when content
 * lands.
 */
export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <div className="mb-4 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-3 w-16 animate-pulse rounded bg-white/5" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="rounded-2xl border border-white/10 bg-[#101012] p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
              <div className="aspect-[4/5] animate-pulse rounded-xl bg-white/5" />
              <div>
                <div className="h-9 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/5" />
                <div className="mt-1.5 h-3 w-5/6 animate-pulse rounded bg-white/5" />
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i}>
                      <div className="h-2.5 w-12 animate-pulse rounded bg-white/5" />
                      <div className="mt-1 h-4 w-20 animate-pulse rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 h-48 animate-pulse rounded-2xl border border-white/10 bg-[#101012]" />
          <div className="mt-6 h-72 animate-pulse rounded-2xl border border-white/10 bg-[#101012]" />
          <div className="mt-6 h-48 animate-pulse rounded-2xl border border-white/10 bg-[#101012]" />
        </div>

        <aside>
          <div className="h-80 animate-pulse rounded-2xl border border-amber-700/30 bg-gradient-to-b from-[#13130f] to-[#101012]" />
        </aside>
      </div>
    </div>
  );
}
