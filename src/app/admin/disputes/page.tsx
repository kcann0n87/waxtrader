import Link from "next/link";
import { serviceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminDisputesPage() {
  const sb = serviceRoleClient();
  const { data: disputes } = await sb
    .from("disputes")
    .select(
      "id, order_id, status, reason, created_at, opener_id, resolved_at, opener:profiles!disputes_opener_id_fkey(username)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const open = (disputes ?? []).filter((d) => d.status !== "Resolved");
  const resolved = (disputes ?? []).filter((d) => d.status === "Resolved");

  return (
    <div>
      <h1 className="font-display mb-6 text-3xl font-black text-white">Disputes</h1>

      <Section title="Open" count={open.length} accent>
        {open.length === 0 ? (
          <Empty msg="No open disputes — nice." />
        ) : (
          <List rows={open} />
        )}
      </Section>

      <div className="mt-8" />

      <Section title="Resolved" count={resolved.length}>
        {resolved.length === 0 ? <Empty msg="No history yet." /> : <List rows={resolved} />}
      </Section>
    </div>
  );
}

function Section({
  title,
  count,
  accent,
  children,
}: {
  title: string;
  count: number;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2
          className={`text-xs font-semibold tracking-[0.18em] uppercase ${accent ? "text-rose-300" : "text-white/60"}`}
        >
          {title}
        </h2>
        <span className="text-xs text-white/60">({count})</span>
      </div>
      {children}
    </div>
  );
}

function List({
  rows,
}: {
  rows: Array<{
    id: string;
    order_id: string;
    status: string;
    reason: string;
    created_at: string;
    opener: { username: string } | { username: string }[] | null;
  }>;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101012]">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-white/5 text-left text-[10px] font-semibold tracking-[0.15em] text-white/60 uppercase">
          <tr>
            <th className="px-4 py-3">Dispute</th>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Opener</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Opened</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((d) => {
            const opener = Array.isArray(d.opener) ? d.opener[0] : d.opener;
            return (
              <tr key={d.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/disputes/${d.id}`}
                    className="font-mono text-xs font-semibold text-amber-300 hover:underline"
                  >
                    {d.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${d.order_id}`}
                    className="font-mono text-xs text-white/80 hover:text-amber-300"
                  >
                    {d.order_id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-white/80">{opener?.username ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-white/80">{d.reason}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-bold ${d.status === "Resolved" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-white/60">
                  {new Date(d.created_at).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#101012] px-4 py-8 text-center text-sm text-white/60">
      {msg}
    </div>
  );
}
