"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useCart } from "@/lib/cart";
import type { Listing } from "@/lib/data";

export function AddToCartButton({
  listing,
  size = "md",
}: {
  listing: Listing;
  size?: "sm" | "md";
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handle = () => {
    add({
      skuId: listing.skuId,
      listingId: listing.id,
      seller: listing.seller,
      sellerRating: listing.sellerRating,
      price: listing.price,
      shipping: listing.shipping,
      qty: 1,
    });
    setAdded(true);
    window.dispatchEvent(new Event("waxmarket:cart-open"));
    setTimeout(() => setAdded(false), 1500);
  };

  const cls =
    size === "sm"
      ? "rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      : "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50";

  return (
    <button onClick={handle} className={`${cls} inline-flex items-center gap-1`}>
      {added ? (
        <>
          <Check size={12} className="text-emerald-600" /> Added
        </>
      ) : (
        <>
          <Plus size={12} /> Cart
        </>
      )}
    </button>
  );
}
