"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ListingMgmtResult = { ok?: boolean; error?: string };

async function getOwnedListing(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." as const };

  const { data: listing } = await supabase
    .from("listings")
    .select("id, seller_id, status, sku:skus!listings_sku_id_fkey(slug)")
    .eq("id", listingId)
    .maybeSingle();
  if (!listing) return { error: "Listing not found." as const };
  if (listing.seller_id !== user.id) return { error: "Not your listing." as const };
  const skuRel = Array.isArray(listing.sku) ? listing.sku[0] : listing.sku;
  return { user, listing, skuSlug: (skuRel as { slug?: string } | null)?.slug, supabase };
}

function bumpPaths(listingId: string, slug?: string | null) {
  revalidatePath(`/account/listings/${listingId}`);
  revalidatePath("/account");
  revalidatePath("/");
  if (slug) revalidatePath(`/product/${slug}`);
}

export async function updateListing(formData: FormData): Promise<ListingMgmtResult> {
  const listingId = String(formData.get("listingId") || "").trim();
  const priceStr = String(formData.get("price") || "");
  const qtyStr = String(formData.get("quantity") || "");

  if (!listingId) return { error: "Missing listing id." };
  const priceCents = Math.round(parseFloat(priceStr) * 100);
  const quantity = parseInt(qtyStr, 10);
  if (!Number.isFinite(priceCents) || priceCents <= 0)
    return { error: "Price must be greater than zero." };
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 100)
    return { error: "Quantity must be between 1 and 100." };

  const ctx = await getOwnedListing(listingId);
  if ("error" in ctx) return { error: ctx.error };
  const { listing, skuSlug, supabase } = ctx;

  if (listing.status !== "Active" && listing.status !== "Paused")
    return { error: `Can't edit a ${listing.status} listing.` };

  const { error } = await supabase
    .from("listings")
    .update({
      price_cents: priceCents,
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId);
  if (error) return { error: "Could not save changes." };

  bumpPaths(listingId, skuSlug);
  return { ok: true };
}

export async function pauseListing(formData: FormData): Promise<ListingMgmtResult> {
  const listingId = String(formData.get("listingId") || "").trim();
  if (!listingId) return { error: "Missing listing id." };

  const ctx = await getOwnedListing(listingId);
  if ("error" in ctx) return { error: ctx.error };
  const { listing, skuSlug, supabase } = ctx;

  if (listing.status !== "Active") return { error: `Listing is ${listing.status}.` };

  const { error } = await supabase
    .from("listings")
    .update({ status: "Paused", updated_at: new Date().toISOString() })
    .eq("id", listingId);
  if (error) return { error: "Could not pause listing." };

  bumpPaths(listingId, skuSlug);
  return { ok: true };
}

export async function resumeListing(formData: FormData): Promise<ListingMgmtResult> {
  const listingId = String(formData.get("listingId") || "").trim();
  if (!listingId) return { error: "Missing listing id." };

  const ctx = await getOwnedListing(listingId);
  if ("error" in ctx) return { error: ctx.error };
  const { listing, skuSlug, supabase } = ctx;

  if (listing.status !== "Paused") return { error: `Listing is ${listing.status}.` };

  const { error } = await supabase
    .from("listings")
    .update({ status: "Active", updated_at: new Date().toISOString() })
    .eq("id", listingId);
  if (error) return { error: "Could not resume listing." };

  bumpPaths(listingId, skuSlug);
  return { ok: true };
}

/**
 * "End" a listing — sets status to Expired (one-way; can't be resumed).
 * Doesn't hard-delete the row so existing orders / bids referencing it stay
 * valid for record-keeping.
 */
export async function endListing(formData: FormData): Promise<ListingMgmtResult> {
  const listingId = String(formData.get("listingId") || "").trim();
  if (!listingId) return { error: "Missing listing id." };

  const ctx = await getOwnedListing(listingId);
  if ("error" in ctx) return { error: ctx.error };
  const { listing, skuSlug, supabase } = ctx;

  if (!["Active", "Paused"].includes(listing.status))
    return { error: `Listing is already ${listing.status}.` };

  const { error } = await supabase
    .from("listings")
    .update({ status: "Expired", updated_at: new Date().toISOString() })
    .eq("id", listingId);
  if (error) return { error: "Could not end listing." };

  bumpPaths(listingId, skuSlug);
  return { ok: true };
}
