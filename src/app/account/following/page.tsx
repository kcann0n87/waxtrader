"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Star, UserPlus, Users } from "lucide-react";
import { useFollowing } from "@/lib/follow";
import { feedbackStatsForSeller, sellers } from "@/lib/sellers";

export default function FollowingPage() {
  const { usernames, hydrated } = useFollowing();
  const followed = sellers.filter((s) => usernames.includes(s.username));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/account" className="inline-flex items-center gap-1 hover:text-slate-900">
          <ArrowLeft size={14} /> Account
        </Link>
        <span>/</span>
        <span className="text-slate-900">Following</span>
      </div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900">Following</h1>
      <p className="mt-1 text-sm text-slate-500">
        Sellers you follow show up in your activity feed when they list new boxes.
      </p>

      {!hydrated ? (
        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : followed.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Users size={24} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">Not following anyone yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Tap Follow on any seller&apos;s profile to track their listings.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            <UserPlus size={14} />
            Browse marketplace
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {followed.map((s) => {
            const stats = feedbackStatsForSeller(s.username);
            return (
              <li
                key={s.username}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-md"
              >
                <Avatar name={s.displayName} />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/seller/${s.username}`}
                    className="line-clamp-1 text-base font-bold text-slate-900 hover:text-indigo-600"
                  >
                    {s.displayName}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} />
                      {s.location}
                    </span>
                    {stats.total > 0 && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          {stats.avgStars.toFixed(1)}
                        </span>
                        <span className="font-semibold text-emerald-600">{stats.positivePct.toFixed(0)}%</span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 line-clamp-1 text-xs text-slate-600">{s.bio}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initial = name[0]?.toUpperCase() ?? "?";
  const colors = ["bg-emerald-600", "bg-sky-600", "bg-rose-600", "bg-amber-600", "bg-violet-600", "bg-cyan-600"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${color}`}>
      {initial}
    </div>
  );
}
