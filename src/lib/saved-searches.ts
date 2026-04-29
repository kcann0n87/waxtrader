"use client";

import { useEffect, useState } from "react";

const KEY = "waxmarket:saved-searches";

export type SavedSearch = {
  id: string;
  query: string;
  sport?: string;
  brand?: string;
  priceMax?: number;
  alerts: { newListing: boolean; priceDrop: boolean; email: boolean };
  createdAt: number;
};

function read(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(items: SavedSearch[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("waxmarket:saved-search-change"));
}

export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSearches(read());
    setHydrated(true);
    const onChange = () => setSearches(read());
    window.addEventListener("waxmarket:saved-search-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("waxmarket:saved-search-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const save = (params: Omit<SavedSearch, "id" | "createdAt" | "alerts"> & Partial<Pick<SavedSearch, "alerts">>) => {
    const next: SavedSearch[] = [
      {
        id: `ss-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        query: params.query,
        sport: params.sport,
        brand: params.brand,
        priceMax: params.priceMax,
        alerts: params.alerts ?? { newListing: true, priceDrop: true, email: false },
        createdAt: Date.now(),
      },
      ...searches,
    ];
    setSearches(next);
    write(next);
  };

  const remove = (id: string) => {
    const next = searches.filter((s) => s.id !== id);
    setSearches(next);
    write(next);
  };

  const updateAlerts = (id: string, alerts: Partial<SavedSearch["alerts"]>) => {
    const next = searches.map((s) => (s.id === id ? { ...s, alerts: { ...s.alerts, ...alerts } } : s));
    setSearches(next);
    write(next);
  };

  return { searches, hydrated, save, remove, updateAlerts };
}
