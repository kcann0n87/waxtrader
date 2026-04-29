"use client";

import { useEffect } from "react";
import { trackRecentlyViewed } from "@/lib/recently-viewed";

export function TrackView({ skuId }: { skuId: string }) {
  useEffect(() => {
    trackRecentlyViewed(skuId);
  }, [skuId]);
  return null;
}
