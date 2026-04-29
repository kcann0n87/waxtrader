"use client";

import { useEffect, useState } from "react";

const KEY = "waxmarket:following";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(usernames: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(usernames));
  window.dispatchEvent(new Event("waxmarket:follow-change"));
}

export function useFollowing() {
  const [usernames, setUsernames] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUsernames(read());
    setHydrated(true);
    const onChange = () => setUsernames(read());
    window.addEventListener("waxmarket:follow-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("waxmarket:follow-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return {
    usernames,
    hydrated,
    has: (u: string) => usernames.includes(u),
    toggle: (u: string) => {
      const next = usernames.includes(u) ? usernames.filter((x) => x !== u) : [...usernames, u];
      setUsernames(next);
      write(next);
    },
  };
}
