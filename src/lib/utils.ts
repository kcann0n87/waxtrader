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
 * sport. Only NBA and NHL seasons span the calendar year boundary
 * (Oct/Nov–Apr/Jun), so only those get the YYYY-YY treatment. MLB and NFL
 * are referenced by start year (the World Series and Super Bowl are part
 * of the same "season"); Pokemon and Soccer are single-year set releases.
 */
export function formatSeasonYear(year: number, sport?: string) {
  const seasonSports = ["NBA", "NHL"];
  if (sport && seasonSports.includes(sport) && year >= 2024) {
    return `${year}-${(year + 1).toString().slice(2)}`;
  }
  return String(year);
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
  return `${formatSeasonYear(sku.year, sku.sport)} ${brandSet} ${sku.product}`;
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
