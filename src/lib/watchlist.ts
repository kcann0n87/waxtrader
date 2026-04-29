"use client";

import { useEffect, useState } from "react";

const KEY = "waxmarket:watchlist";

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
  window.dispatchEvent(new Event("waxmarket:watchlist-change"));
}

export function useWatchlist() {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(read());
    setHydrated(true);
    const onChange = () => setIds(read());
    window.addEventListener("waxmarket:watchlist-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("waxmarket:watchlist-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return {
    ids,
    hydrated,
    has: (skuId: string) => ids.includes(skuId),
    toggle: (skuId: string) => {
      const next = ids.includes(skuId) ? ids.filter((x) => x !== skuId) : [...ids, skuId];
      setIds(next);
      write(next);
    },
  };
}
