"use client";

import { useEffect, useState } from "react";
import { type Notification, notifications as seedNotifications } from "./notifications";

const KEY = "waxmarket:notifications";
const SEED_VERSION = 2;
const SEED_KEY = "waxmarket:notifications-seed";

function read(): Notification[] {
  if (typeof window === "undefined") return seedNotifications;
  try {
    const seedV = parseInt(window.localStorage.getItem(SEED_KEY) || "0", 10);
    if (seedV < SEED_VERSION) {
      window.localStorage.setItem(KEY, JSON.stringify(seedNotifications));
      window.localStorage.setItem(SEED_KEY, String(SEED_VERSION));
      return seedNotifications;
    }
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Notification[]) : seedNotifications;
  } catch {
    return seedNotifications;
  }
}

function write(items: Notification[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("waxmarket:notifications-change"));
}

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>(seedNotifications);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(read());
    setHydrated(true);
    const onChange = () => setItems(read());
    window.addEventListener("waxmarket:notifications-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("waxmarket:notifications-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const markRead = (id: string) => {
    const next = read().map((n) => (n.id === id ? { ...n, unread: false } : n));
    setItems(next);
    write(next);
  };

  const markAllRead = () => {
    const next = read().map((n) => ({ ...n, unread: false }));
    setItems(next);
    write(next);
  };

  return {
    items,
    hydrated,
    unread: items.filter((n) => n.unread).length,
    markRead,
    markAllRead,
  };
}
