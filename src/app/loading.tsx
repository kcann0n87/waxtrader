/**
 * Homepage loading skeleton — renders during the data fetch for
 * getCatalogWithPricing + getMarketplaceStats. The visual structure
 * mirrors the actual home layout (hero band + 4-col card grid) so
 * the page doesn't reflow when it resolves.
 *
 * No client JS — this is a static fallback rendered server-side
 * via Next.js's loading.tsx convention.
 */
export default function HomeLoading() {
  return (
    <div>
      {/* Hero band — matches the height of the real hero so the page
          doesn't shift when the live data arrives. */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-10%,rgba(212,175,55,0.18),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_110%,rgba(124,58,237,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-6 h-6 w-64 animate-pulse rounded-full bg-white/10" />
            <div className="space-y-3">
              <div className="h-12 w-full animate-pulse rounded-md bg-white/10 lg:h-16" />
              <div className="h-12 w-3/4 animate-pulse rounded-md bg-white/10 lg:h-16" />
              <div className="h-12 w-2/3 animate-pulse rounded-md bg-white/10 lg:h-16" />
            </div>
            <div className="mt-6 h-4 w-3/4 animate-pulse rounded bg-white/5" />
            <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </section>

      {/* Catalog grid skeleton — 8 placeholder cards in the same 4-col
          layout the real grid uses. */}
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="mb-8 h-6 w-40 animate-pulse rounded bg-white/10" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-white/5 bg-[#101012]">
      <div className="aspect-[4/5] animate-pulse bg-white/[0.04]" />
      <div className="p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/5" />
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="h-2 w-12 animate-pulse rounded bg-white/5" />
            <div className="mt-1 h-5 w-16 animate-pulse rounded bg-amber-400/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
