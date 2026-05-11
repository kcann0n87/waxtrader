import Link from "next/link";
import { Users } from "lucide-react";
import { serviceRoleClient } from "@/lib/supabase/admin";
import { NewPartnerForm } from "./new-partner-form";

export const dynamic = "force-dynamic";

type PartnerRow = {
  id: string;
  code: string;
  name: string;
  email: string | null;
  commission_rate: number;
  commission_window_days: number;
  is_active: boolean;
  created_at: string;
  referred_count?: number;
};

export default async function AdminPartnersPage() {
  const sb = serviceRoleClient();
  const { data: rows } = await sb
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false });

  // Get referred user counts per partner in one round-trip.
  const partners: PartnerRow[] = rows ?? [];
  if (partners.length > 0) {
    const { data: refs } = await sb
      .from("profiles")
      .select("referred_by_partner_id")
      .in(
        "referred_by_partner_id",
        partners.map((p) => p.id),
      );
    const counts: Record<string, number> = {};
    for (const r of refs ?? []) {
      const k = r.referred_by_partner_id as string;
      counts[k] = (counts[k] ?? 0) + 1;
    }
    for (const p of partners) p.referred_count = counts[p.id] ?? 0;
  }

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight text-white">
            Partners
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Referral codes for group owners / influencers / community admins.
            Each partner gets a unique code, earns a percentage of platform
            fees from users who sign up via their code, for a configurable
            window.
          </p>
        </div>
      </div>

      <NewPartnerForm />

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-bold text-white">
          {partners.length === 0
            ? "No partners yet"
            : `${partners.length} partner${partners.length === 1 ? "" : "s"}`}
        </h2>
        {partners.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center text-sm text-white/50">
            Create your first partner using the form above. Once you have a
            code, share it as <code className="font-mono text-amber-300">waxdepot.io/?ref=CODE</code>{" "}
            to any group / community / influencer you&apos;re partnering
            with.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-white/[0.03] text-left text-[10px] font-semibold tracking-[0.15em] text-white/50 uppercase">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Window</th>
                  <th className="px-4 py-3">Referred</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {partners.map((p) => (
                  <tr key={p.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-amber-300">
                      <Link
                        href={`/admin/partners/${p.id}`}
                        className="hover:text-amber-200"
                      >
                        {p.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-white">
                      {p.name}
                      {p.email && (
                        <div className="text-xs font-normal text-white/50">
                          {p.email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80">
                      {(p.commission_rate * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-white/70">
                      {p.commission_window_days >= 36500
                        ? "Lifetime"
                        : `${p.commission_window_days}d`}
                    </td>
                    <td className="px-4 py-3 inline-flex items-center gap-1.5 text-sm text-white/80">
                      <Users size={12} className="text-white/40" />
                      {p.referred_count ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      {p.is_active ? (
                        <span className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/60">
                          PAUSED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
