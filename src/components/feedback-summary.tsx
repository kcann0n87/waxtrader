import { Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { feedbackStatsForSeller, sellerStatusBadge, type SubRatings } from "@/lib/sellers";

const subLabels: Record<keyof SubRatings, string> = {
  itemAccuracy: "Item as described",
  communication: "Communication",
  shippingSpeed: "Shipping speed",
  shippingCost: "Shipping cost",
};

export function FeedbackSummary({ username }: { username: string }) {
  const lifetime = feedbackStatsForSeller(username);
  const past12 = feedbackStatsForSeller(username, 365);
  const past30 = feedbackStatsForSeller(username, 30);
  const status = sellerStatusBadge(lifetime);

  return (
    <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-wider text-white/60 uppercase">
            Buyer feedback
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className={`text-4xl font-black tracking-tight ${tonePctColor(lifetime.positivePct)}`}>
              {lifetime.total > 0 ? `${lifetime.positivePct.toFixed(1)}%` : "—"}
            </div>
            <div className="text-sm font-semibold text-white/50">positive</div>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="font-bold text-white/80">
              {lifetime.avgStars > 0 ? lifetime.avgStars.toFixed(1) : "—"}
            </span>
            <span>·</span>
            <span>{lifetime.total} lifetime ratings</span>
          </div>
        </div>
        {status && (
          <span
            className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-bold ${statusToneClass(status.tone)}`}
          >
            {status.label}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-lg border border-white/10 bg-white/[0.02] text-center">
        <Window label="30 days" stats={past30} />
        <Window label="12 months" stats={past12} />
        <Window label="Lifetime" stats={lifetime} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {(Object.keys(subLabels) as Array<keyof SubRatings>).map((key) => (
          <SubRatingBar key={key} label={subLabels[key]} value={lifetime.subAverages[key]} />
        ))}
      </div>

      <div className="mt-4 flex gap-1.5 text-xs">
        <Pill icon={<ThumbsUp size={11} />} label="Positive" value={lifetime.positive} tone="emerald" />
        <Pill label="Neutral" value={lifetime.neutral} tone="amber" />
        <Pill icon={<ThumbsDown size={11} />} label="Negative" value={lifetime.negative} tone="rose" />
      </div>
    </div>
  );
}

function Window({ label, stats }: { label: string; stats: ReturnType<typeof feedbackStatsForSeller> }) {
  return (
    <div className="px-3 py-3">
      <div className="text-[10px] font-semibold tracking-wider text-white/60 uppercase">{label}</div>
      <div className={`mt-1 text-base font-bold ${tonePctColor(stats.positivePct)}`}>
        {stats.total > 0 ? `${stats.positivePct.toFixed(1)}%` : "—"}
      </div>
      <div className="text-[11px] text-white/50">{stats.total} ratings</div>
    </div>
  );
}

function SubRatingBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const color = value >= 4.5 ? "bg-emerald-500" : value >= 4 ? "bg-emerald-400" : value >= 3 ? "bg-amber-400" : "bg-rose-400";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="font-bold text-white">{value > 0 ? value.toFixed(1) : "—"}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Pill({
  icon,
  label,
  value,
  tone,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number;
  tone: "emerald" | "amber" | "rose";
}) {
  const tones = {
    emerald: "bg-emerald-500/10 text-emerald-300",
    amber: "bg-amber-500/10 text-amber-300",
    rose: "bg-rose-500/10 text-rose-300",
  }[tone];
  return (
    <div className={`inline-flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 font-semibold ${tones}`}>
      {icon}
      <span>{label}</span>
      <span className="opacity-70">·</span>
      <span>{value}</span>
    </div>
  );
}

function tonePctColor(pct: number) {
  if (pct >= 99) return "text-emerald-300";
  if (pct >= 95) return "text-emerald-400";
  if (pct >= 90) return "text-amber-400";
  return "text-rose-400";
}

function statusToneClass(tone: "gold" | "blue" | "slate") {
  return {
    gold: "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950",
    blue: "bg-sky-500/15 text-sky-800",
    slate: "bg-white/5 text-white/80",
  }[tone];
}
