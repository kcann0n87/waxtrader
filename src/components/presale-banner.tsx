import { Calendar, Clock, ShieldCheck } from "lucide-react";
import { daysUntilRelease, formatReleaseDateLong } from "@/lib/utils";

export function PresaleBanner({ releaseDate }: { releaseDate: string }) {
  const days = daysUntilRelease(releaseDate);
  const formatted = formatReleaseDateLong(releaseDate);

  let urgency: { label: string; tone: string } = { label: "Pre-order open", tone: "indigo" };
  if (days === 0) urgency = { label: "Releases today", tone: "rose" };
  else if (days === 1) urgency = { label: "Tomorrow", tone: "rose" };
  else if (days <= 7) urgency = { label: `${days} days out`, tone: "amber" };
  else if (days <= 30) urgency = { label: `${days} days out`, tone: "sky" };
  else urgency = { label: `${days} days out`, tone: "indigo" };

  const tones: Record<string, string> = {
    indigo: "bg-amber-500/15 text-amber-200",
    sky: "bg-sky-500/15 text-sky-200",
    amber: "bg-amber-400/20 text-amber-200",
    rose: "bg-rose-500/20 text-rose-200",
  };

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-amber-700/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-700/40 bg-amber-500/10 text-amber-400">
            <Calendar size={18} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold tracking-[0.2em] text-amber-400/80 uppercase">
                Pre-order open
              </span>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${tones[urgency.tone]}`}>
                {urgency.label}
              </span>
            </div>
            <div className="font-display mt-1 text-xl font-black tracking-tight text-white">
              Releases {formatted}
            </div>
            <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-white/60">
              <ShieldCheck size={11} className="mr-1 inline align-text-bottom text-emerald-400" />
              Lock in your price now. Sellers ship within 2 business days of release. Your payment is held in
              escrow until the box arrives sealed — no risk if a seller can&apos;t fulfill.
            </p>
          </div>
        </div>
        <div className="hidden shrink-0 text-right md:block">
          <div className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.18em] text-white/50 uppercase">
            <Clock size={11} />
            Countdown
          </div>
          <div className="font-display text-3xl font-black tracking-tight text-amber-400">
            {days}d
          </div>
        </div>
      </div>
    </div>
  );
}
