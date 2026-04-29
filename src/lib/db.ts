import "server-only";
import { createClient } from "./supabase/server";
import type { Sport, Sku, Listing } from "./data";

type Row<T> = T extends null | undefined ? never : T;

function rowToSku(row: {
  id: string;
  slug: string;
  year: number;
  brand: string;
  sport: Sport;
  set_name: string;
  product: string;
  release_date: string;
  description: string | null;
  image_url: string | null;
  gradient_from: string | null;
  gradient_to: string | null;
}): Sku & { uuid: string } {
  return {
    id: row.id, // uuid
    uuid: row.id,
    slug: row.slug,
    year: row.year,
    brand: row.brand,
    sport: row.sport,
    set: row.set_name,
    product: row.product,
    releaseDate: row.release_date,
    description: row.description ?? "",
    imageUrl: row.image_url ?? undefined,
    gradient: [row.gradient_from ?? "#475569", row.gradient_to ?? "#0f172a"],
  };
}

export async function getAllSkus(): Promise<Sku[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skus")
    .select("*")
    .order("release_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToSku);
}

export async function getSkuBySlug(slug: string): Promise<Sku | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skus")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToSku(data) : null;
}

export async function getListingsForSku(skuId: string): Promise<Listing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, sku_id, price_cents, shipping_cents, quantity, seller:profiles!listings_seller_id_fkey(username, is_verified)")
    .eq("sku_id", skuId)
    .eq("status", "Active")
    .order("price_cents", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: Row<typeof data>[number]) => ({
    id: r.id,
    skuId: r.sku_id,
    seller: (r.seller as { username: string } | null)?.username ?? "unknown",
    sellerRating: 100, // TODO compute from reviews
    sellerSales: 0, // TODO compute from completed orders
    price: r.price_cents / 100,
    shipping: r.shipping_cents / 100,
    quantity: r.quantity,
  }));
}

export async function getLowestAsk(skuId: string): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("price_cents")
    .eq("sku_id", skuId)
    .eq("status", "Active")
    .order("price_cents", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? data.price_cents / 100 : null;
}

export async function getLastSale(skuId: string): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select("price_cents")
    .eq("sku_id", skuId)
    .order("sold_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? data.price_cents / 100 : null;
}

export async function getRecentSales(
  skuId: string,
  limit = 10,
): Promise<{ id: string; date: string; price: number }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select("id, sold_at, price_cents")
    .eq("sku_id", skuId)
    .order("sold_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r: Row<typeof data>[number]) => ({
    id: r.id,
    date: r.sold_at.slice(0, 10),
    price: r.price_cents / 100,
  }));
}

/**
 * Returns all SKUs along with their lowest ask + last sale in a single round-trip.
 * Used by the homepage and search to avoid N+1 queries.
 */
export async function getCatalogWithPricing(): Promise<
  (Sku & { lowestAsk: number | null; lastSale: number | null })[]
> {
  const supabase = await createClient();

  const [skusRes, listingsRes, salesRes] = await Promise.all([
    supabase.from("skus").select("*").order("release_date", { ascending: false }),
    supabase.from("listings").select("sku_id, price_cents").eq("status", "Active"),
    supabase.from("sales").select("sku_id, price_cents, sold_at").order("sold_at", { ascending: false }),
  ]);
  if (skusRes.error) throw skusRes.error;
  if (listingsRes.error) throw listingsRes.error;
  if (salesRes.error) throw salesRes.error;

  const lowestBySku = new Map<string, number>();
  for (const l of listingsRes.data ?? []) {
    const cur = lowestBySku.get(l.sku_id);
    if (cur === undefined || l.price_cents < cur) lowestBySku.set(l.sku_id, l.price_cents);
  }
  const lastBySku = new Map<string, number>();
  for (const s of salesRes.data ?? []) {
    if (!lastBySku.has(s.sku_id)) lastBySku.set(s.sku_id, s.price_cents);
  }

  return (skusRes.data ?? []).map((row) => {
    const sku = rowToSku(row);
    return {
      ...sku,
      lowestAsk: lowestBySku.has(sku.id) ? lowestBySku.get(sku.id)! / 100 : null,
      lastSale: lastBySku.has(sku.id) ? lastBySku.get(sku.id)! / 100 : null,
    };
  });
}
