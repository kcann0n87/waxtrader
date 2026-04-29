"use client";

import { Check, UserPlus } from "lucide-react";
import { useFollowing } from "@/lib/follow";

export function FollowButton({ username }: { username: string }) {
  const { has, toggle, hydrated } = useFollowing();
  const following = hydrated && has(username);

  return (
    <button
      onClick={() => toggle(username)}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-semibold transition ${
        following
          ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {following ? (
        <>
          <Check size={14} />
          Following
        </>
      ) : (
        <>
          <UserPlus size={14} />
          Follow
        </>
      )}
    </button>
  );
}
