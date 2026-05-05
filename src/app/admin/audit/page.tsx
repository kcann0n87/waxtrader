import Link from "next/link";
import { serviceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const TARGET_HREFS: Record<string, (id: string) => string> = {
  order: (id) => `/admin/orders/${id}`,
  user: (id) => `/admin/users/${id}`,
  listing: (id) => `/admin/listings?q=${id}`,
  dispute: (id) => `/admin/disputes`,
  sku: (id) => `/admin/catalog/${id}`,
};

const ACTION_STYLES: Record<string, string> = {
  refund_order: "bg-rose-500/15 text-rose-300",
  cancel_order: "bg-rose-500/15 text-rose-300",
  force_release_order: "bg-amber-500/15 text-amber-300",
  ban_user: "bg-rose-500/15 text-rose-300",
  unban_user: "bg-emerald-500/15 text-emerald-300",
  promote_admin: "bg-amber-500/15 text-amber-300",
  demote_admin: "bg-amber-500/15 text-amber-300",
  set_seller_tier: "bg-sky-500/15 text-sky-300",
  delist_listing: "bg-rose-500/15 text-rose-300",
  resolve_dispute: "bg-emerald-500/15 text-emerald-300",
  create_sku: "bg-emerald-500/15 text-emerald-300",
  update_sku: "bg-sky-500/15 text-sky-300",
  delete_sku: "bg-rose-500/15 text-rose-300",
};

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string }>;
}) {
  const { q, action } = await searchParams;

  const sb = serviceRoleClient();
  let query = sb
    .from("admin_actions")
    .select(
      "id, admin_id, action, target_type, target_id, details, created_at, admin:profiles!admin_actions_admin_id_fkey(username, display_name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (action) query = query.eq("action", action);
  if (q) query = query.or(`target_id.ilike.%${q}%,action.ilike.%${q}%`);

  const { data: rows, error } = await query;
  if (error) console.error(error);

  // Pull distinct action names for the filter dropdown
  const allActions = Array.from(
    new Set((rows ?? []).map((r) => r.action)),
  ).sort();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-black text-white">Audit log</h1>
        <span className="text-xs text-white/60">{rows?.length ?? 0} entries</span>
      </div>

      <p className="mb-4 max-w-prose text-sm text-white/60">
        Every destructive admin action is recorded here — refunds, bans, force releases, SKU changes,
        dispute resolutions. Read-only.
      </p>

      <form className="mb-4 flex flex-wrap items-center gap-2" action="/admin/audit" method="get">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search target ID or action"
          className="flex-1 min-w-0 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/50"
        />
        <select
          name="action"
          defaultValue={action ?? ""}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white"
        >
          <option value="">All actions</option>
          {allActions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-amber-400 px-3 py-1.5 text-sm font-bold text-slate-900 hover:bg-amber-300"
        >
          Apply
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101012]">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-white/5 text-left text-[10px] font-semibold tracking-[0.15em] text-white/60 uppercase">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(rows ?? []).map((r) => {
              const adminProfile = Array.isArray(r.admin) ? r.admin[0] : r.admin;
              const hrefBuilder = TARGET_HREFS[r.target_type];
              const detailStr = r.details
                ? Object.entries(r.details as Record<string, unknown>)
                    .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
                    .join(" · ")
                : "";
              return (
                <tr key={r.id} className="hover:bg-white/[0.02] align-top">
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-white/60">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/80">
                    {adminProfile ? `@${adminProfile.username}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-1 text-[10px] font-bold ${ACTION_STYLES[r.action] ?? "bg-white/10 text-white/80"}`}
                    >
                      {r.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {hrefBuilder ? (
                      <Link
                        href={hrefBuilder(r.target_id)}
                        className="font-mono text-amber-300 hover:underline"
                      >
                        {r.target_type}/{r.target_id.slice(0, 8)}
                      </Link>
                    ) : (
                      <span className="font-mono text-white/60">
                        {r.target_type}/{r.target_id.slice(0, 8)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-md text-[11px] text-white/70">
                    {detailStr || <span className="text-white/40">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(rows ?? []).length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-white/60">No audit entries match.</div>
        )}
      </div>
    </div>
  );
}
