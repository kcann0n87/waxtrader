"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let initialized = false;

/**
 * Mounted in the root layout. Initializes PostHog the first time the page
 * loads (gated on NEXT_PUBLIC_POSTHOG_KEY being set, so we no-op cleanly
 * in dev / preview environments without a key) and tracks SPA route
 * changes thereafter — Next's app router doesn't fire page-load events
 * for client-side navigations, so we capture them manually.
 */
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    if (initialized) return;
    initialized = true;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // Manual capture mode — we trigger our own $pageview on route change
      // below. PostHog's auto-capture would still fire for clicks/inputs
      // which is fine.
      capture_pageview: false,
      capture_pageleave: true,
      // Defer until after first paint to avoid jank.
      loaded: () => {
        if (typeof window !== "undefined") {
          posthog.capture("$pageview");
        }
      },
    });
  }, []);

  useEffect(() => {
    if (!POSTHOG_KEY || !initialized) return;
    if (typeof window === "undefined") return;
    const url = window.location.origin + pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}
