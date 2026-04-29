"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Circle, MapPin, Truck } from "lucide-react";
import type { TrackingEvent } from "@/lib/orders";

export function TrackingTimeline({
  events,
  carrier,
  tracking,
  estimatedDelivery,
}: {
  events: TrackingEvent[];
  carrier: string;
  tracking: string;
  estimatedDelivery?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? events : events.slice(0, 4);
  const latest = events[0];
  const hasMore = events.length > 4;

  return (
    <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-white">
            <Truck size={16} className="text-white/40" />
            Shipment tracking
          </h2>
          <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
            <span>{carrier}</span>
            <span>·</span>
            <span className="font-mono text-white/80">{tracking}</span>
            <a
              href="#"
              className="font-semibold text-amber-300 hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              Track on {carrier} →
            </a>
          </div>
        </div>
        {latest?.isDelivered ? (
          <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300">
            Delivered
          </span>
        ) : (
          <span className="rounded-md bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-300">
            In transit
          </span>
        )}
      </div>

      {!latest?.isDelivered && estimatedDelivery && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-sky-700/40 bg-sky-500/10 px-3 py-2 text-xs text-sky-900">
          <MapPin size={12} className="text-sky-300" />
          <span>
            <strong>Estimated arrival:</strong>{" "}
            {formatDateLong(estimatedDelivery)} ·{" "}
            <span className="text-sky-300">last update {timeAgo(latest.ts)}</span>
          </span>
        </div>
      )}

      <ol className="relative">
        {visible.map((e, i) => {
          const isLast = i === visible.length - 1 && !hasMore;
          return (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                {e.isLatest ? (
                  e.isDelivered ? (
                    <CheckCircle2 className="text-emerald-400" size={16} />
                  ) : (
                    <div className="flex h-4 w-4 items-center justify-center">
                      <span className="absolute h-3 w-3 animate-ping rounded-full bg-sky-400 opacity-75" />
                      <span className="relative h-2.5 w-2.5 rounded-full bg-sky-600" />
                    </div>
                  )
                ) : (
                  <Circle className="text-white/30" size={14} fill="currentColor" />
                )}
                {!isLast && <div className="mt-0.5 h-full w-px flex-1 bg-slate-200" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-baseline justify-between gap-3">
                  <div
                    className={`text-sm ${
                      e.isLatest ? "font-bold text-white" : "font-semibold text-white/80"
                    }`}
                  >
                    {e.status}
                  </div>
                  <div className="shrink-0 text-[11px] text-white/40">{formatDateTime(e.ts)}</div>
                </div>
                {e.location && (
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-white/50">
                    <MapPin size={10} className="text-white/40" />
                    {e.location}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="-mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-white/10 bg-white/[0.02] py-2 text-xs font-semibold text-white/80 hover:bg-white/5"
        >
          {expanded ? (
            <>
              <ChevronUp size={12} /> Show less
            </>
          ) : (
            <>
              <ChevronDown size={12} /> Show {events.length - 4} earlier event{events.length - 4 === 1 ? "" : "s"}
            </>
          )}
        </button>
      )}
    </div>
  );
}

function formatDateTime(ts: string) {
  if (!ts) return "";
  const [date, time] = ts.split(" ");
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${dt.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${time}`;
}

function formatDateLong(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function timeAgo(ts: string) {
  if (!ts) return "";
  const [date, time] = ts.split(" ");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = (time || "00:00").split(":").map(Number);
  const eventTime = new Date(y, m - 1, d, hh, mm).getTime();
  const now = new Date(2026, 3, 28, 10, 0).getTime(); // current date pinned for demo
  const diffMin = Math.max(Math.floor((now - eventTime) / 60000), 1);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
}
