"use server";

import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { requireAdmin, logAdminAction } from "@/lib/admin";
import { serviceRoleClient } from "@/lib/supabase/admin";
import { releaseOrderToSeller } from "@/app/actions/orders";

type Result = { ok?: boolean; error?: string; data?: unknown };

/**
 * Refund an order's charge in full. Updates the order to Canceled +
 * payment_status=refunded. Idempotent — refusing if a transfer has already
 * fired (use Stripe directly for that case).
 */
export async function adminRefundOrder(
  orderId: string,
  reason: string,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };
  if (!stripe) return { error: "Stripe not configured" };

  const sb = serviceRoleClient();
  const { data: order } = await sb
    .from("orders")
    .select("id, stripe_charge_id, stripe_transfer_id, payment_status, status, total_cents")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { error: "Order not found." };
  if (!order.stripe_charge_id) return { error: "No charge to refund." };
  if (order.stripe_transfer_id)
    return {
      error:
        "Order has been released to seller — refund via Stripe directly + recover from seller.",
    };
  if (order.payment_status === "refunded")
    return { error: "Already refunded." };

  try {
    const refund = await stripe.refunds.create({
      charge: order.stripe_charge_id,
      reason: "requested_by_customer",
      metadata: { admin_id: admin.id, admin_reason: reason },
    });
    await sb
      .from("orders")
      .update({
        payment_status: "refunded",
        status: "Canceled",
        canceled_at: new Date().toISOString(),
        cancel_reason: reason,
      })
      .eq("id", orderId);
    await logAdminAction(admin.id, "refund_order", "order", orderId, {
      reason,
      refund_id: refund.id,
      amount_cents: order.total_cents,
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true, data: { refund_id: refund.id } };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("adminRefundOrder failed:", e);
    return { error: `Refund failed: ${message}` };
  }
}

/**
 * Force-release escrow to the seller (skips the 2-day wait, bypasses
 * buyer confirmation). Use when buyer is unresponsive or in a resolved
 * dispute that favors the seller.
 */
export async function adminForceReleaseOrder(
  orderId: string,
  reason: string,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const result = await releaseOrderToSeller(orderId);
  if (result.error) return { error: result.error };

  await logAdminAction(admin.id, "force_release_order", "order", orderId, {
    reason,
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

/**
 * Force an order into the Delivered state. Sets `delivered_at = now()`,
 * which starts the 2-day auto-release clock — the buyer can either confirm
 * delivery (immediate release) or open a dispute. After 2 days the
 * /api/cron/auto-release job releases funds to the seller automatically.
 *
 * Useful when:
 *   - The carrier's delivery webhook didn't fire (lost in EasyPost)
 *   - The seller hand-delivered it and there's no tracking event
 *   - The buyer claims non-receipt but the package was clearly received
 *
 * Idempotent — safe to call on Delivered/Released/Completed orders (just
 * does nothing). Uses the same logic as buyer/seller markDelivered but
 * bypasses the "must be Shipped" check so admins can recover stuck orders.
 */
export async function adminMarkDelivered(
  orderId: string,
  reason: string,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };
  if (!reason.trim()) return { error: "Reason required for the audit log." };

  const sb = serviceRoleClient();
  const { data: order } = await sb
    .from("orders")
    .select("id, status, delivered_at, buyer_id, seller_id, sku:skus!orders_sku_id_fkey(year, brand, product)")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { error: "Order not found." };
  if (["Released", "Completed", "Canceled"].includes(order.status))
    return { error: `Order is already ${order.status}.` };
  if (order.status === "Delivered")
    return { error: "Order is already Delivered." };

  const now = new Date().toISOString();
  const { error } = await sb
    .from("orders")
    .update({ status: "Delivered", delivered_at: now })
    .eq("id", orderId);
  if (error) return { error: error.message };

  // Notify the buyer so they know the dispute window is now open.
  const skuRel = Array.isArray(order.sku) ? order.sku[0] : order.sku;
  const skuMeta = skuRel as
    | { year?: number; brand?: string; product?: string }
    | null;
  if (skuMeta) {
    await sb.from("notifications").insert({
      user_id: order.buyer_id,
      type: "order-delivered",
      title: "Marked delivered by support",
      body: `WaxDepot marked ${skuMeta.year} ${skuMeta.brand} ${skuMeta.product} delivered. Funds auto-release in 2 days unless you open a dispute.`,
      href: `/account/orders/${orderId}`,
    });
  }

  await logAdminAction(admin.id, "mark_delivered", "order", orderId, {
    reason,
    previous_status: order.status,
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

/**
 * Cancel an order without refunding (for orders that never charged, or
 * that already refunded but need status cleanup).
 */
export async function adminCancelOrder(
  orderId: string,
  reason: string,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const sb = serviceRoleClient();
  const { error } = await sb
    .from("orders")
    .update({
      status: "Canceled",
      canceled_at: new Date().toISOString(),
      cancel_reason: reason,
    })
    .eq("id", orderId);
  if (error) return { error: error.message };

  await logAdminAction(admin.id, "cancel_order", "order", orderId, { reason });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

/**
 * Resolve a dispute. Outcomes:
 *   - refund_buyer: full refund to buyer, order canceled
 *   - release_seller: dispute dismissed, force-release escrow
 *   - partial: partial refund, remaining released to seller
 */
export async function adminResolveDispute(
  disputeId: string,
  outcome: "refund_buyer" | "release_seller" | "partial",
  notes: string,
  partialRefundCents?: number,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const sb = serviceRoleClient();
  const { data: dispute } = await sb
    .from("disputes")
    .select("id, order_id, status")
    .eq("id", disputeId)
    .maybeSingle();
  if (!dispute) return { error: "Dispute not found." };
  if (dispute.status === "Resolved")
    return { error: "Dispute already resolved." };

  let actionResult: Result;
  if (outcome === "refund_buyer") {
    actionResult = await adminRefundOrder(dispute.order_id, `dispute ${disputeId}: ${notes}`);
  } else if (outcome === "release_seller") {
    actionResult = await adminForceReleaseOrder(
      dispute.order_id,
      `dispute ${disputeId}: ${notes}`,
    );
  } else {
    // Partial — issue partial refund, release remainder
    if (!stripe) return { error: "Stripe not configured" };
    if (!partialRefundCents || partialRefundCents <= 0)
      return { error: "Specify partialRefundCents > 0" };
    const { data: order } = await sb
      .from("orders")
      .select("stripe_charge_id, total_cents")
      .eq("id", dispute.order_id)
      .maybeSingle();
    if (!order?.stripe_charge_id) return { error: "No charge to refund." };
    if (partialRefundCents >= order.total_cents)
      return { error: "Partial refund must be less than total." };
    try {
      const refund = await stripe.refunds.create({
        charge: order.stripe_charge_id,
        amount: partialRefundCents,
        reason: "requested_by_customer",
        metadata: { admin_id: admin.id, dispute_id: disputeId },
      });
      // Release remainder to seller (the existing release logic handles
      // tier-fee math on the remaining amount via the charge's net).
      const release = await releaseOrderToSeller(dispute.order_id);
      actionResult = { ok: true, data: { refund_id: refund.id, release } };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { error: `Partial refund failed: ${message}` };
    }
  }

  if (actionResult.error) return actionResult;

  await sb
    .from("disputes")
    .update({
      status: "Resolved",
      resolution: outcome,
      resolved_at: new Date().toISOString(),
      admin_notes: notes,
    })
    .eq("id", disputeId);

  await logAdminAction(admin.id, `resolve_dispute_${outcome}`, "dispute", disputeId, {
    notes,
    partialRefundCents,
  });
  revalidatePath("/admin/disputes");
  revalidatePath(`/admin/disputes/${disputeId}`);
  return { ok: true };
}

/**
 * Create a new SKU in the catalog.
 */
export async function adminCreateSku(input: {
  slug: string;
  year: number;
  brand: string;
  set_name: string;
  product: string;
  sport: "NBA" | "MLB" | "NFL" | "NHL" | "Pokemon" | "Soccer";
  release_date: string;
  description?: string;
  image_url?: string;
  gradient_from?: string;
  gradient_to?: string;
  is_published?: boolean;
  // Sibling-variant flow (the floating "+" on a product page) passes
  // variant_group through so the new SKU joins the source's product
  // page instead of standing alone. variant_type is derived from the
  // product label here so the DB trigger doesn't have to know about
  // every suffix variant we support (mega-case, fotl-hobby-case, etc.).
  variant_group?: string;
  variant_type?: string;
}): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  // Derive variant_type from the product label if the caller didn't
  // pass one explicitly. "Hobby Box" → "hobby-box", "Mega Case" →
  // "mega-case", etc. — matches the keys in src/lib/variants.ts.
  const variantType =
    input.variant_type ??
    input.product
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const sb = serviceRoleClient();
  const { data, error } = await sb
    .from("skus")
    .insert({
      slug: input.slug,
      year: input.year,
      brand: input.brand,
      set_name: input.set_name,
      product: input.product,
      sport: input.sport,
      release_date: input.release_date,
      description: input.description ?? "",
      image_url: input.image_url ?? null,
      gradient_from: input.gradient_from ?? "#475569",
      gradient_to: input.gradient_to ?? "#0f172a",
      is_published: input.is_published ?? true,
      variant_group: input.variant_group ?? null,
      variant_type: variantType || null,
    })
    .select("id, slug")
    .maybeSingle();
  if (error) return { error: error.message };

  await logAdminAction(admin.id, "create_sku", "sku", data?.id ?? input.slug, {
    slug: input.slug,
  });
  // Flush homepage / browse caches too — a fresh SKU should appear
  // on the public-facing rails immediately (esp. the +variant flow
  // where the admin expects to navigate back and see the new card).
  revalidatePath("/admin/catalog");
  revalidatePath("/", "layout");
  return { ok: true, data };
}

/**
 * Update an existing SKU (any subset of fields).
 */
export async function adminUpdateSku(
  id: string,
  patch: Partial<{
    year: number;
    brand: string;
    set_name: string;
    product: string;
    sport: "NBA" | "MLB" | "NFL" | "NHL" | "Pokemon" | "Soccer";
    release_date: string;
    description: string;
    image_url: string | null | undefined;
    gradient_from: string;
    gradient_to: string;
    is_published: boolean;
  }>,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const sb = serviceRoleClient();
  const { error } = await sb.from("skus").update(patch).eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(admin.id, "update_sku", "sku", id, { patch });
  revalidatePath("/admin/catalog");
  revalidatePath(`/admin/catalog/${id}`);
  // Edits to title / image / gradient / is_published all show on the
  // public homepage and product pages — flush root layout too.
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Upload an image to the public `product-images` Supabase Storage bucket and
 * return its public URL. Caller (the SKU form) decides what to do with the
 * URL — typically pasting it into the form's image_url field, or saving it
 * straight to the SKU.
 *
 * The slug is used as the path key so re-uploads replace the existing file
 * and the URL stays stable across edits. A short timestamp suffix is added
 * so CDN caches drop the old version when admins replace an image.
 */
export async function adminUploadSkuImage(
  formData: FormData,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const file = formData.get("file");
  const slug = String(formData.get("slug") || "").trim().toLowerCase();
  const skuId = String(formData.get("skuId") || "").trim() || null;

  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug))
    return { error: "Slug is required (lowercase, hyphens only)." };
  if (!(file instanceof File))
    return { error: "No file received." };
  if (file.size === 0) return { error: "File is empty." };
  if (file.size > 5 * 1024 * 1024)
    return { error: "Max 5MB per image." };

  const allowed = new Map<string, string>([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ]);
  const ext = allowed.get(file.type);
  if (!ext) return { error: "Use JPG, PNG, or WebP." };

  // Add a short timestamp so the public URL changes whenever the admin
  // re-uploads — clients can't see a stale CDN copy.
  const stamp = Date.now().toString(36);
  const path = `${slug}-${stamp}.${ext}`;

  const sb = serviceRoleClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadErr } = await sb.storage
    .from("product-images")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
      cacheControl: "31536000",
    });
  if (uploadErr) {
    console.error("adminUploadSkuImage upload failed:", uploadErr);
    return { error: `Upload failed: ${uploadErr.message}` };
  }

  const { data: pub } = sb.storage.from("product-images").getPublicUrl(path);
  const publicUrl = pub.publicUrl;
  if (!publicUrl) return { error: "Could not derive public URL." };

  // If a skuId was provided, persist immediately so the SKU is updated even
  // if the admin closes the form before clicking Save.
  if (skuId) {
    const { error: updateErr } = await sb
      .from("skus")
      .update({ image_url: publicUrl })
      .eq("id", skuId);
    if (updateErr) {
      console.error("adminUploadSkuImage skus update failed:", updateErr);
      return { error: `Saved file but couldn't update SKU: ${updateErr.message}` };
    }
    revalidatePath("/admin/catalog");
    revalidatePath(`/admin/catalog/${skuId}`);
  }

  await logAdminAction(admin.id, "upload_sku_image", "sku", skuId ?? slug, {
    slug,
    path,
    size_bytes: file.size,
    type: file.type,
  });

  return { ok: true, data: { publicUrl, path } };
}

/**
 * Delete a SKU. Refuses if any listings reference it.
 */
/**
 * Manually pin a SKU's homepage sort position. Lower numbers rise
 * higher in the rail. Pass null to clear (back to default ordering).
 *
 * Surfaces from the floating "Featured rank" pill on product pages —
 * admins can rank top picks without leaving whatever page they're on.
 */
export async function adminSetFeaturedRank(
  id: string,
  rank: number | null,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  // Smallint range — Postgres rejects anything outside ±32767.
  if (rank !== null && (rank < 0 || rank > 32767 || !Number.isInteger(rank))) {
    return { error: "Rank must be an integer 0–32767, or null to clear." };
  }

  const sb = serviceRoleClient();
  const { error } = await sb
    .from("skus")
    .update({ featured_rank: rank })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(admin.id, "set_featured_rank", "sku", id, { rank });
  // Homepage + browse pages cache aggressively at the data layer.
  // Revalidate root layout to flush.
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Bulk-reorder SKUs by writing featured_rank = 1..N in the order the
 * admin dropped them. Drives the homepage drag-and-drop reorder UX —
 * admin grabs a card, drops it, the visible list comes back as
 * skuIds in new order, and we persist that order verbatim.
 *
 * Only the SKUs in the input list get touched. Anything not in the
 * list keeps whatever featured_rank it had (so reordering one section
 * doesn't clobber pins set elsewhere). To "unpin" something, drop a
 * shorter list — items omitted from the new order keep their old rank
 * (the homepage's "below the pinned" zone falls through to release-
 * date sort).
 *
 * Empty list = no-op (defensive — protects against a bad client send).
 */
export async function adminReorderSkus(skuIds: string[]): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };
  if (!Array.isArray(skuIds) || skuIds.length === 0) return { ok: true };
  // Cap at the smallint upper bound. We're nowhere near it in practice
  // but better to reject a 50K-item drop than write garbage.
  if (skuIds.length > 32767) return { error: "Too many SKUs to reorder at once." };

  const sb = serviceRoleClient();
  // Postgres has no "update many with different values per row" in a
  // single query without CTEs. For ~100 rows the per-row update is
  // fine; if this ever grows past a few hundred we'd switch to a
  // batched RPC. Run them sequentially to keep transaction semantics
  // simple — partial failure leaves the catalog in a half-renumbered
  // state, which is recoverable by re-dropping.
  for (let i = 0; i < skuIds.length; i++) {
    const { error } = await sb
      .from("skus")
      .update({ featured_rank: i + 1 })
      .eq("id", skuIds[i]);
    if (error) return { error: `Row ${i + 1}: ${error.message}` };
  }

  await logAdminAction(admin.id, "reorder_skus", "sku", "bulk", {
    count: skuIds.length,
    first: skuIds[0],
    last: skuIds[skuIds.length - 1],
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function adminDeleteSku(id: string): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const sb = serviceRoleClient();
  const { count } = await sb
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("sku_id", id);
  if ((count ?? 0) > 0)
    return { error: `Cannot delete: ${count} active listing(s) reference this SKU.` };

  const { error } = await sb.from("skus").delete().eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(admin.id, "delete_sku", "sku", id);
  // Revalidate the admin catalog list AND the root layout — the
  // homepage / browse pages cache catalog data aggressively at the
  // data layer, so deleting a SKU without flushing root leaves the
  // deleted card visible on the homepage until the next deploy.
  revalidatePath("/admin/catalog");
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * "Just make it go away" SKU removal.
 *
 * Tries a hard delete first. If anything's referencing the SKU
 * (listings, orders, sales, bids, watches — any FK constraint), falls
 * back to setting is_published=false so the SKU disappears from public
 * browse/search/homepage but historical records (orders, sales) keep
 * their FK pointer intact.
 *
 * The X button on product pages calls this — admins shouldn't have to
 * think "delete vs hide", they should just click ✕ and have the
 * catalog clean itself up correctly.
 *
 * Returns ok with `mode` indicating which path was taken so the UI can
 * confirm "Deleted" vs "Hidden — preserved for X linked records".
 */
export async function adminRemoveSku(
  id: string,
): Promise<Result & { mode?: "deleted" | "hidden"; reason?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const sb = serviceRoleClient();

  // Try the hard delete first. Postgres returns the FK violation as
  // error code "23503" — anything else is a real failure we should
  // surface to the admin.
  const { error: delError } = await sb.from("skus").delete().eq("id", id);

  if (!delError) {
    await logAdminAction(admin.id, "delete_sku", "sku", id);
    revalidatePath("/admin/catalog");
    revalidatePath("/", "layout");
    return { ok: true, mode: "deleted" };
  }

  // FK constraint violation — something references this SKU. Fall
  // back to hiding so the public catalog still gets cleaned up.
  // Postgres FK error code is 23503; supabase-js exposes it on .code.
  const isFkError =
    (delError as { code?: string }).code === "23503" ||
    /foreign key/i.test(delError.message);

  if (!isFkError) {
    return { error: delError.message };
  }

  const { error: hideError } = await sb
    .from("skus")
    .update({ is_published: false })
    .eq("id", id);
  if (hideError) return { error: hideError.message };

  await logAdminAction(admin.id, "hide_sku", "sku", id, {
    reason: "fk_blocked",
  });
  revalidatePath("/admin/catalog");
  revalidatePath("/", "layout");
  return {
    ok: true,
    mode: "hidden",
    reason:
      "Hidden instead of deleted — listings, orders, or other records reference this SKU and would break if it were removed. The SKU no longer appears on the public catalog.",
  };
}

/**
 * Send a Supabase magic-link invite to an email address. The invitee gets
 * an email with a link that signs them in and lands them at NEXT_PUBLIC_SITE_URL
 * (or localhost in dev). On first sign-in the handle_new_user trigger
 * creates their profile with username derived from email + display_name
 * from the metadata we pass here.
 *
 * Used while we're invite-only — public /signup is gated by middleware.
 */
export async function adminInviteUser(input: {
  email: string;
  displayName?: string;
}): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const email = input.email.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const sb = serviceRoleClient();

  // Look up any existing auth user for this email. There are two cases:
  //   1. Real activated user (email_confirmed_at set, has logged in) →
  //      reject as a duplicate. They should sign in, not be re-invited.
  //   2. Stale unactivated invite (email_confirmed_at null, no last_sign_in
  //      _at) → silently revoke + reinvite. This is the "I sent the
  //      invite but the link was broken / they never clicked" case;
  //      forcing the admin to delete in the Supabase dashboard before
  //      resending is needless friction.
  const { data: existing } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existingUser = existing?.users.find(
    (u) => u.email?.toLowerCase() === email,
  );
  if (existingUser) {
    const everSignedIn =
      !!existingUser.email_confirmed_at || !!existingUser.last_sign_in_at;
    if (everSignedIn) {
      return { error: "An account with that email already exists." };
    }
    // Unactivated — revoke and reinvite. Defensive: if the user managed
    // to leave behind FK rows (shouldn't happen for an unactivated invite
    // but the cascade handles it anyway), the auth deletion cascades
    // through profiles → all dependent tables.
    const { error: delErr } = await sb.auth.admin.deleteUser(existingUser.id);
    if (delErr) {
      console.error("adminInviteUser: revoke unactivated invite failed:", delErr);
      return {
        error:
          "An invite was already sent to that email but couldn't be auto-revoked. Delete the user manually in Supabase Authentication → Users, then retry.",
      };
    }
    await logAdminAction(admin.id, "revoke_unactivated_invite", "user", existingUser.id, {
      email,
    });
  }

  const redirectTo =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  // Route through /auth/callback so PKCE code exchange happens (Supabase
  // SSR uses PKCE by default — appending ?code=... to the redirect_to).
  // Without this, the link lands on /account with the code unexchanged,
  // middleware sees anon, and beta-gated invitees get bounced to
  // /coming-soon. /auth is in ALWAYS_PUBLIC_PREFIXES so the callback
  // itself is reachable; it exchanges the code, sets the session
  // cookies, then forwards to ?next=.
  const { data, error } = await sb.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${redirectTo}/auth/callback`,
    data: input.displayName
      ? { display_name: input.displayName.trim() }
      : undefined,
  });
  if (error) return { error: error.message };

  await logAdminAction(admin.id, "invite_user", "user", data.user?.id ?? email, {
    email,
    display_name: input.displayName ?? null,
  });
  revalidatePath("/admin/invite");
  revalidatePath("/admin/users");
  return { ok: true, data: { user_id: data.user?.id ?? null, email } };
}

/**
 * Resend a sign-in link to any user, regardless of state. Used from
 * /admin/users so admins can recover stuck invitees with one click
 * without juggling Supabase tabs.
 *
 * Branches on the auth user's state:
 *   - No user yet → adminInviteUser (creates account + invite email)
 *   - Unactivated invite (no email_confirmed_at, no last_sign_in_at) →
 *     adminInviteUser, which auto-revokes + reissues a fresh invite
 *   - Activated user → send a magic-link sign-in email so they can
 *     get back in without resetting a password
 *
 * Always lands the user on /auth/callback regardless of
 * path so PKCE works.
 */
export async function adminSendSignInLink(input: {
  userId?: string;
  email?: string;
}): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const sb = serviceRoleClient();

  // Resolve to an email — either provided directly, or look up by user id.
  let email = (input.email ?? "").trim().toLowerCase();
  if (!email && input.userId) {
    const { data } = await sb.auth.admin.getUserById(input.userId);
    email = data?.user?.email?.toLowerCase() ?? "";
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Couldn't resolve a valid email for that user." };
  }

  // Find the existing auth row (if any). For activated users we send a
  // magic link; for missing/unactivated we delegate to adminInviteUser
  // which already does the right thing.
  const { data: list } = await sb.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const existing = list?.users.find(
    (u) => u.email?.toLowerCase() === email,
  );
  const everSignedIn =
    !!existing?.email_confirmed_at || !!existing?.last_sign_in_at;

  if (!existing || !everSignedIn) {
    // No user OR pending invite → invite path (handles auto-revoke).
    return adminInviteUser({ email });
  }

  // Activated user → magic link. generateLink returns a URL we then
  // pass to Supabase's email-send infrastructure via signInWithOtp's
  // shouldCreateUser=false path, which sends the configured magic-link
  // template. Either approach works; signInWithOtp keeps the email
  // template wiring identical to the rest of the app.
  const redirectTo =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${redirectTo}/auth/callback`,
    },
  });
  if (error) {
    console.error("adminSendSignInLink magic link failed:", error);
    return { error: error.message };
  }

  await logAdminAction(admin.id, "send_signin_link", "user", existing.id, {
    email,
  });
  revalidatePath("/admin/users");
  return { ok: true, data: { user_id: existing.id, email } };
}

/**
 * Bulk-invite the next N pending waitlist entries (oldest first — first
 * sign-up gets in first). Caps at 25 per run because Supabase rate-limits
 * inviteUserByEmail. Returns counts so the admin can see what happened
 * without scrolling through individual toasts.
 *
 * Skips emails that already have an auth user (duplicate-invite check
 * baked into adminInviteUser handles this safely; we just count it as
 * "skipped" instead of "failed").
 */
export async function adminInviteBatchPending(
  maxCount = 25,
): Promise<Result & { sent?: number; skipped?: number; failed?: number }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  const cap = Math.max(1, Math.min(50, Math.floor(maxCount)));
  const sb = serviceRoleClient();

  // Build the same invitedAt set the waitlist page uses, then take the
  // oldest N pending emails. Service role to bypass RLS for the cross-
  // user reads.
  const [{ data: waitlist }, { data: inviteLogs }, usersList] = await Promise.all([
    sb
      .from("waitlist")
      .select("email, created_at")
      .order("created_at", { ascending: true }),
    sb
      .from("admin_actions")
      .select("details")
      .eq("action", "invite_user"),
    sb.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const invitedEmails = new Set(
    (inviteLogs ?? [])
      .map((r) => (r.details as { email?: string } | null)?.email?.toLowerCase())
      .filter((e): e is string => !!e),
  );
  const existingAuthEmails = new Set(
    (usersList.data?.users ?? [])
      .map((u) => u.email?.toLowerCase())
      .filter((e): e is string => !!e),
  );

  const pending = (waitlist ?? [])
    .map((w) => w.email)
    .filter(
      (email) =>
        !invitedEmails.has(email.toLowerCase()) &&
        !existingAuthEmails.has(email.toLowerCase()),
    )
    .slice(0, cap);

  if (pending.length === 0) {
    return { ok: true, sent: 0, skipped: 0, failed: 0 };
  }

  const redirectTo =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  let sent = 0;
  let failed = 0;
  for (const rawEmail of pending) {
    const email = rawEmail.trim().toLowerCase();
    try {
      // Same /auth/callback routing as the single-invite path — see
      // adminInviteUser for why direct /account skips PKCE code exchange.
      const { data, error } = await sb.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${redirectTo}/auth/callback`,
      });
      if (error) {
        failed++;
        console.error("adminInviteBatchPending invite failed:", email, error);
        continue;
      }
      await logAdminAction(
        admin.id,
        "invite_user",
        "user",
        data.user?.id ?? email,
        { email, display_name: null, batch: true },
      );
      sent++;
    } catch (e) {
      failed++;
      console.error("adminInviteBatchPending threw:", email, e);
    }
  }

  revalidatePath("/admin/waitlist");
  revalidatePath("/admin/invite");
  revalidatePath("/admin");
  return { ok: true, sent, skipped: 0, failed };
}
