import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSD(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function formatUSDFull(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/**
 * Format a year for display as either "2025" or "2025-26" depending on the
 * sport. NBA and NHL seasons span the calendar boundary (Oct/Nov–Apr/Jun),
 * so they always get YYYY-YY. MLB and NFL are referenced by start year.
 * Pokemon is single-year. Soccer is mixed: European leagues (UEFA, PL,
 * Bundesliga, La Liga, Serie A, Ligue 1) split, but MLS and World Cup
 * products are single-year — we look at the set name to disambiguate.
 */
export function formatSeasonYear(year: number, sport?: string, set?: string) {
  if (year < 2024) return String(year);
  if (sport === "NBA" || sport === "NHL") {
    return `${year}-${(year + 1).toString().slice(2)}`;
  }
  if (sport === "Soccer" && set && isSplitSeasonSoccerSet(set)) {
    return `${year}-${(year + 1).toString().slice(2)}`;
  }
  return String(year);
}

// European league products span Aug-May, so they're labeled YYYY-YY.
// MLS (Mar-Nov) and World Cup / Copa (single tournament) are single-year.
function isSplitSeasonSoccerSet(set: string) {
  const s = set.toLowerCase();
  if (s.includes("mls")) return false;
  if (s.includes("world cup") || s.includes("copa")) return false;
  return true;
}

export function formatSkuTitle(sku: {
  year: number;
  brand: string;
  set: string;
  product: string;
  sport?: string;
}) {
  const brandSet = sku.set.toLowerCase().startsWith(sku.brand.toLowerCase())
    ? sku.set
    : `${sku.brand} ${sku.set}`;
  return `${formatSeasonYear(sku.year, sku.sport, sku.set)} ${brandSet} ${sku.product}`;
}

// Real time, not a pinned demo date. Earlier iterations froze "today" to
// stabilize seed data; with a real catalog + real launch we want presale
// banners to reflect actual time-to-release.
function todayMs() {
  return Date.now();
}

export function isPresale(releaseDate: string) {
  const [y, m, d] = releaseDate.split("-").map(Number);
  return new Date(y, m - 1, d).getTime() > todayMs();
}

export function daysUntilRelease(releaseDate: string) {
  const [y, m, d] = releaseDate.split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  return Math.ceil((target - todayMs()) / 86400000);
}

export function formatReleaseDateLong(releaseDate: string) {
  const [y, m, d] = releaseDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
