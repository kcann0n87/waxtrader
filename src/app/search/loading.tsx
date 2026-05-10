/**
 * Search results loading skeleton. Mirrors the search page layout —
 * filter sidebar on the left, result grid on the right — so the
 * page doesn't reflow when results come in.
 */
export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6 h-9 w-full animate-pulse rounded-md bg-white/5 lg:max-w-md" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Filter sidebar skeleton */}
        <aside className="space-y-4 lg:block">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
              <div className="space-y-1.5">
                {Array.from({ length: 5 }).map((__, j) => (
                  <div
                    key={j}
                    className="h-3 animate-pulse rounded bg-white/5"
                    style={{ width: `${50 + ((i + j) * 7) % 40}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Result grid skeleton */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-lg border border-white/5 bg-[#101012]"
              >
                <div className="aspect-[4/5] animate-pulse bg-white/[0.04]" />
                <div className="p-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/5" />
                  <div className="mt-3 h-5 w-16 animate-pulse rounded bg-amber-400/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
