"use client";

import { useEffect, useState } from "react";

const KEY = "waxmarket:recently-viewed";
const MAX = 10;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("waxmarket:recent-change"));
}

export function trackRecentlyViewed(skuId: string) {
  if (typeof window === "undefined") return;
  const current = read().filter((x) => x !== skuId);
  const next = [skuId, ...current].slice(0, MAX);
  write(next);
}

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(read());
    setHydrated(true);
    const onChange = () => setIds(read());
    window.addEventListener("waxmarket:recent-change", onChange);
    return () => window.removeEventListener("waxmarket:recent-change", onChange);
  }, []);

  return { ids, hydrated };
}
