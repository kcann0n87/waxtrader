"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

const KEY = "waxdepot:cart";

/**
 * Client-only helper that runs on /account/orders when the buyer lands
 * back from Stripe Checkout after a multi-item cart payment.
 *
 * Stripe's hosted page takes the buyer off-site, so the cart's
 * localStorage state is still populated when they return. We clear it
 * here once we see `?cart_payment=success`, and surface a one-time
 * confirmation banner above the orders list.
 */
export function CartCleanupOnSuccess() {
  const params = useSearchParams();
  const isSuccess = params.get("cart_payment") === "success";
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isSuccess) return;
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(KEY);
      window.dispatchEvent(new Event("waxdepot:cart-change"));
    } catch {
      // ignore — non-critical
    }
    setShowBanner(true);
  }, [isSuccess]);

  if (!showBanner) return null;
  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-700/40 bg-emerald-500/10 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
        <Check size={16} />
      </div>
      <div className="text-sm">
        <div className="font-bold text-white">Payment received — orders placed</div>
        <p className="mt-0.5 text-emerald-100/80">
          Each seller has 2 business days to ship. Funds stay in escrow until
          you confirm delivery.
        </p>
      </div>
    </div>
  );
}
