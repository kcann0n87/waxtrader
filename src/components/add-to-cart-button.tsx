"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useCart } from "@/lib/cart";
import type { Listing, Sku } from "@/lib/data";
import { formatSkuTitle } from "@/lib/utils";

export function AddToCartButton({
  listing,
  sku,
  size = "md",
}: {
  listing: Listing;
  sku: Sku;
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
      // Snapshot SKU display fields so the cart never has to re-query them.
      skuTitle: formatSkuTitle(sku),
      skuSlug: sku.slug,
      skuBrand: sku.brand,
      skuSport: sku.sport,
      skuImageUrl: sku.imageUrl ?? null,
      skuGradient: sku.gradient,
    });
    setAdded(true);
    window.dispatchEvent(new Event("waxdepot:cart-open"));
    setTimeout(() => setAdded(false), 1500);
  };

  const cls =
    size === "sm"
      ? "rounded-md border border-white/15 bg-[#101012] px-2.5 py-1 text-xs font-semibold text-white/80 hover:bg-white/[0.02]"
      : "rounded-md border border-white/15 bg-[#101012] px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/[0.02]";

  return (
    <button onClick={handle} className={`${cls} inline-flex items-center gap-1`}>
      {added ? (
        <>
          <Check size={12} className="text-emerald-400" /> Added
        </>
      ) : (
        <>
          <Plus size={12} /> Cart
        </>
      )}
    </button>
  );
}
