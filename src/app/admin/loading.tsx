/**
 * Skeleton shown while admin pages SSR. Each admin page makes 2-4 parallel
 * Supabase queries via the service-role client, so a couple hundred ms of
 * blank time is real. This keeps the layout stable so users see structure
 * immediately on click-through from the sidebar.
 */
export default function AdminLoading() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="h-9 flex-1 min-w-0 animate-pulse rounded-md bg-white/5" />
        <div className="h-9 w-32 animate-pulse rounded-md bg-white/5" />
        <div className="h-9 w-20 animate-pulse rounded-md bg-amber-400/20" />
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#101012]">
        <div className="border-b border-white/5 bg-white/5 px-4 py-3">
          <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
        </div>
        <div className="divide-y divide-white/5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <div className="h-4 flex-1 animate-pulse rounded bg-white/5" />
              <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
              <div className="h-4 w-16 animate-pulse rounded bg-white/5" />
              <div className="h-4 w-20 animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
