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

export function formatSeasonYear(year: number) {
  return year >= 2024 ? `${year}-${(year + 1).toString().slice(2)}` : String(year);
}

export function formatSkuTitle(sku: { year: number; brand: string; set: string; product: string }) {
  const brandSet = sku.set.toLowerCase().startsWith(sku.brand.toLowerCase())
    ? sku.set
    : `${sku.brand} ${sku.set}`;
  return `${formatSeasonYear(sku.year)} ${brandSet} ${sku.product}`;
}

const TODAY_MS = new Date(2026, 3, 28).getTime();

export function isPresale(releaseDate: string) {
  const [y, m, d] = releaseDate.split("-").map(Number);
  return new Date(y, m - 1, d).getTime() > TODAY_MS;
}

export function daysUntilRelease(releaseDate: string) {
  const [y, m, d] = releaseDate.split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  return Math.ceil((target - TODAY_MS) / 86400000);
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
