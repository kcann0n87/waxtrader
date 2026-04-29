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
          ? "border-emerald-700/50 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
          : "border-white/15 bg-[#101012] text-white/80 hover:bg-white/[0.02]"
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
