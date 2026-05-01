import { serviceRoleClient } from "@/lib/supabase/admin";
import { formatUSDFull } from "@/lib/utils";
import { AlertTriangle, Package2, Receipt, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const sb = serviceRoleClient();

  const [
    { count: orderCount },
    { count: openDisputes },
    { count: skuCount },
    { count: listingCount },
    { data: escrow },
    { data: lastActions },
  ] = await Promise.all([
    sb.from("orders").select("*", { count: "exact", head: true }),
    sb
      .from("disputes")
      .select("*", { count: "exact", head: true })
      .neq("status", "Resolved"),
    sb.from("skus").select("*", { count: "exact", head: true }),
    sb.from("listings").select("*", { count: "exact", head: true }).eq("status", "Active"),
    sb
      .from("orders")
      .select("total_cents")
      .eq("status", "InEscrow")
      .eq("payment_status", "paid"),
    sb
      .from("admin_actions")
      .select("id, action, target_type, target_id, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const escrowSum =
    (escrow ?? []).reduce((sum, o) => sum + (o.total_cents ?? 0), 0) / 100;

  return (
    <div>
      <h1 className="font-display mb-6 text-3xl font-black text-white">Overview</h1>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Receipt size={14} />} label="Total orders" value={orderCount ?? 0} />
        <Stat
          icon={<ShieldCheck size={14} />}
          label="In escrow"
          value={formatUSDFull(escrowSum)}
        />
        <Stat
          icon={<AlertTriangle size={14} />}
          label="Open disputes"
          value={openDisputes ?? 0}
          accent={(openDisputes ?? 0) > 0 ? "rose" : undefined}
        />
        <Stat
          icon={<Package2 size={14} />}
          label="Active listings"
          value={listingCount ?? 0}
          sub={`${skuCount} SKUs in catalog`}
        />
      </div>

      <h2 className="mb-3 text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">
        Recent admin actions
      </h2>
      <div className="rounded-xl border border-white/10 bg-[#101012]">
        {(lastActions ?? []).length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-white/60">
            No admin actions yet.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {(lastActions ?? []).map((a) => (
              <li key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <span className="font-mono font-semibold text-amber-300">{a.action}</span>{" "}
                  <span className="text-white/60">on</span>{" "}
                  <span className="font-mono text-white/80">
                    {a.target_type}/{a.target_id}
                  </span>
                </div>
                <div className="text-xs text-white/60">{new Date(a.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: "rose";
}) {
  return (
    <div
      className={`rounded-xl border bg-[#101012] p-4 ${accent === "rose" ? "border-rose-700/40 bg-rose-500/[0.04]" : "border-white/10"}`}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/60 uppercase">
        {icon}
        {label}
      </div>
      <div
        className={`font-display mt-2 text-2xl font-black ${accent === "rose" ? "text-rose-300" : "text-white"}`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-white/60">{sub}</div>}
    </div>
  );
}
