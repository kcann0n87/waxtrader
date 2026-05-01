import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { serviceRoleClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { formatUSDFull } from "@/lib/utils";
import { UserAdminActions } from "./user-actions";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await requireAdmin();
  const sb = serviceRoleClient();

  const { data: user } = await sb
    .from("profiles")
    .select(
      "id, username, display_name, bio, location, is_admin, is_seller, is_verified, banned_at, ban_reason, seller_tier, created_at, stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled",
    )
    .eq("id", id)
    .maybeSingle();

  if (!user) notFound();

  // Pull a few stats in parallel
  const [listingsRes, ordersBuyerRes, ordersSellerRes, salesRes] = await Promise.all([
    sb.from("listings").select("id, status", { count: "exact" }).eq("seller_id", id),
    sb.from("orders").select("id", { count: "exact", head: true }).eq("buyer_id", id),
    sb.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", id),
    sb
      .from("orders")
      .select("total_cents")
      .eq("seller_id", id)
      .eq("status", "Released"),
  ]);

  const activeListings =
    listingsRes.data?.filter((l) => l.status === "Active").length ?? 0;
  const totalListings = listingsRes.count ?? 0;
  const ordersAsBuyer = ordersBuyerRes.count ?? 0;
  const ordersAsSeller = ordersSellerRes.count ?? 0;
  const lifetimeSalesCents =
    salesRes.data?.reduce((sum, o) => sum + (o.total_cents ?? 0), 0) ?? 0;

  const isSelf = me?.id === user.id;

  return (
    <div>
      <Link
        href="/admin/users"
        className="mb-3 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white"
      >
        <ArrowLeft size={12} /> All users
      </Link>

      <div className="mb-1 flex items-center gap-3">
        <h1 className="font-display text-2xl font-black text-white">
          {user.display_name}
        </h1>
        {user.banned_at && (
          <span className="rounded bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300">
            BANNED
          </span>
        )}
        {user.is_admin && (
          <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
            ADMIN
          </span>
        )}
      </div>
      <p className="mb-6 text-sm text-white/60">
        @{user.username} · joined {new Date(user.created_at).toLocaleDateString()}
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card title="Profile">
            <Row k="ID" v={user.id} mono />
            <Row k="Username" v={`@${user.username}`} />
            <Row k="Display name" v={user.display_name} />
            <Row k="Location" v={user.location ?? "—"} />
            <Row k="Bio" v={user.bio ?? "—"} />
          </Card>

          <Card title="Activity">
            <Row k="Active listings" v={String(activeListings)} />
            <Row k="Total listings" v={String(totalListings)} />
            <Row k="Orders as buyer" v={String(ordersAsBuyer)} />
            <Row k="Orders as seller" v={String(ordersAsSeller)} />
            <Row k="Lifetime sales (released)" v={formatUSDFull(lifetimeSalesCents / 100)} />
          </Card>

          <Card title="Seller account">
            <Row k="Tier" v={user.seller_tier ?? "Starter"} />
            <Row k="Stripe account" v={user.stripe_account_id ?? "—"} mono />
            <Row k="Charges enabled" v={user.stripe_charges_enabled ? "yes" : "no"} />
            <Row k="Payouts enabled" v={user.stripe_payouts_enabled ? "yes" : "no"} />
          </Card>

          {user.banned_at && (
            <Card title="Ban">
              <Row k="Banned at" v={new Date(user.banned_at).toLocaleString()} />
              <Row k="Reason" v={user.ban_reason ?? "—"} />
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <UserAdminActions
            userId={user.id}
            username={user.username}
            isBanned={!!user.banned_at}
            isAdmin={!!user.is_admin}
            tier={(user.seller_tier as "Starter" | "Pro" | "Elite") ?? "Starter"}
            isSelf={isSelf}
          />

          <div className="rounded-xl border border-white/10 bg-[#101012] p-4 text-xs text-white/60">
            <div className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-white/60 uppercase">
              Quick links
            </div>
            <div className="space-y-1.5">
              <Link
                href={`/seller/${user.username}`}
                className="block text-white/80 hover:text-amber-300"
              >
                Public seller profile →
              </Link>
              <Link
                href={`/admin/orders?q=${user.id}`}
                className="block text-white/80 hover:text-amber-300"
              >
                Orders involving this user →
              </Link>
              <Link
                href={`/admin/listings?seller=${user.username}`}
                className="block text-white/80 hover:text-amber-300"
              >
                Active listings by this user →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#101012] p-4">
      <div className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-white/60 uppercase">
        {title}
      </div>
      <dl className="space-y-1.5 text-xs">{children}</dl>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-white/60">{k}</dt>
      <dd className={`text-right text-white ${mono ? "font-mono break-all" : ""}`}>{v}</dd>
    </div>
  );
}
