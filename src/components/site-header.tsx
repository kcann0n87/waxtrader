import Link from "next/link";
import { Search } from "lucide-react";
import { AuthMenu } from "./auth-menu";
import { CartDrawer } from "./cart-drawer";
import { LogoMark } from "./logo-mark";
import { NotificationsBell } from "./notifications-bell";
import { MobileSearch } from "./mobile-search";
import { createClient } from "@/lib/supabase/server";

const SPORT_TABS: { id: string; label: string }[] = [
  { id: "NBA", label: "NBA" },
  { id: "MLB", label: "MLB" },
  { id: "NFL", label: "NFL" },
  { id: "NHL", label: "NHL" },
];

/**
 * Pull the distinct (sport, year) tuples from the catalog so each sport tab's
 * hover menu shows the actual years we have SKUs for. Falls back to the
 * current year if the lookup fails so the menu still renders.
 */
async function loadYearsBySport(): Promise<Record<string, number[]>> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("skus")
      .select("sport, year")
      .order("year", { ascending: false });
    const out: Record<string, Set<number>> = {};
    for (const row of data ?? []) {
      const sport = row.sport as string;
      if (!out[sport]) out[sport] = new Set();
      out[sport].add(row.year as number);
    }
    return Object.fromEntries(
      Object.entries(out).map(([k, v]) => [k, [...v].sort((a, b) => b - a)]),
    );
  } catch {
    const y = new Date().getFullYear();
    return { NBA: [y, y - 1], MLB: [y, y - 1], NFL: [y, y - 1], NHL: [y, y - 1] };
  }
}

function formatYearLabel(sport: string, year: number) {
  return ["NBA", "NHL"].includes(sport) ? `${year}-${(year + 1).toString().slice(2)}` : String(year);
}

export async function SiteHeader() {
  const yearsBySport = await loadYearsBySport();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0a0a0b]/95 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-amber-400 focus:px-3 focus:py-1.5 focus:text-sm focus:font-bold focus:text-slate-900"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5" aria-label="WaxDepot home">
          <LogoMark size={32} />
          <span className="font-display text-lg font-black tracking-tight text-white">
            Wax<span className="text-amber-400">Depot</span>
          </span>
        </Link>

        <Link
          href="/sell"
          className="rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-sm font-bold text-slate-900 shadow-md shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400"
        >
          Sell
        </Link>

        <form action="/search" method="get" role="search" className="relative hidden flex-1 md:block">
          <label htmlFor="site-search" className="sr-only">
            Search the marketplace
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-white/50" size={16} aria-hidden="true" />
          <input
            id="site-search"
            type="search"
            name="q"
            placeholder='Search "2025 Bowman Hobby"'
            className="w-full rounded-md border border-white/10 bg-white/5 py-2 pr-3 pl-9 text-sm text-white placeholder:text-white/50 focus:border-amber-400/50 focus:bg-white/10 focus:outline-none"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <Link
            href="/releases"
            className="rounded-md px-3 py-1.5 text-[13px] font-medium tracking-wide text-white/70 transition hover:text-white"
          >
            Releases
          </Link>
          {SPORT_TABS.map((s) => (
            <SportTabWithMenu
              key={s.id}
              sport={s.id}
              label={s.label}
              years={yearsBySport[s.id] ?? []}
            />
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <MobileSearch />
          <NotificationsBell />
          <CartDrawer />
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}

/**
 * A sport tab with a CSS-only hover dropdown that lists the years we have
 * SKUs for. No JS, no client component — just :hover and focus-within so it
 * also works for keyboard users. Tab itself links to the all-sports filter;
 * each year link narrows further.
 */
function SportTabWithMenu({
  sport,
  label,
  years,
}: {
  sport: string;
  label: string;
  years: number[];
}) {
  return (
    <div className="group relative">
      <Link
        href={`/?sport=${sport}`}
        className="block rounded-md px-3 py-1.5 text-[13px] font-medium tracking-wide text-white/70 transition hover:text-white group-hover:text-white group-focus-within:text-white"
      >
        {label}
      </Link>
      {years.length > 0 && (
        <div className="invisible absolute right-0 top-full z-40 mt-1 min-w-[160px] origin-top-right rounded-md border border-white/10 bg-[#101012] p-1 opacity-0 shadow-xl shadow-black/40 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <Link
            href={`/?sport=${sport}`}
            className="block rounded px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/5"
          >
            All {label}
          </Link>
          <div className="my-1 border-t border-white/5" />
          {years.map((y) => (
            <Link
              key={y}
              href={`/?sport=${sport}&year=${y}`}
              className="block rounded px-3 py-1.5 text-[12px] font-medium text-white/80 hover:bg-white/5 hover:text-white"
            >
              {formatYearLabel(sport, y)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
