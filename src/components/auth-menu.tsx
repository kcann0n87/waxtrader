import Link from "next/link";
import { ArrowDownToLine, BarChart3, Bell, Heart, LogIn, LogOut, MessageCircle, Settings, ShieldCheck, User, Users } from "lucide-react";
import { getProfile } from "@/lib/supabase/user";
import { signOut } from "@/app/auth/actions";

export async function AuthMenu() {
  const profile = await getProfile();

  if (!profile) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-white/70 transition hover:text-white"
          aria-label="Log in"
        >
          <LogIn size={14} />
          <span className="hidden sm:inline">Sign in</span>
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-sm font-bold text-amber-300 transition hover:border-amber-400/70 hover:bg-amber-500/20 hover:text-amber-200"
          aria-label="Sign up"
        >
          <span className="hidden sm:inline">Sign up</span>
          <span className="sm:hidden">Join</span>
        </Link>
      </div>
    );
  }

  return (
    <details className="group relative">
      <summary
        className="flex cursor-pointer list-none items-center gap-1.5 rounded-md p-1 transition hover:bg-white/5"
        aria-label={`Account menu for ${profile.display_name}`}
      >
        <Avatar name={profile.display_name} />
        <span className="sr-only">Account menu</span>
      </summary>
      <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#101012] shadow-xl shadow-black/40">
        <div className="border-b border-white/5 bg-gradient-to-br from-amber-500/5 to-transparent px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar name={profile.display_name} large />
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-black text-white">
                {profile.display_name}
              </div>
              <div className="truncate text-xs text-white/50">@{profile.username}</div>
            </div>
          </div>
        </div>
        <ul className="py-1">
          <Item href="/account" icon={<User size={14} />} label="Account" />
          <Item href="/account/messages" icon={<MessageCircle size={14} />} label="Messages" />
          <Item href="/account/watchlist" icon={<Heart size={14} />} label="Watchlist" />
          <Item href="/account/following" icon={<Users size={14} />} label="Following" />
          <Item href="/account/payouts" icon={<ArrowDownToLine size={14} />} label="Payouts" />
          <Item href="/account/analytics" icon={<BarChart3 size={14} />} label="Analytics" />
          <Item href="/account/disputes" icon={<ShieldCheck size={14} />} label="Disputes" />
          <Item href="/account/alerts" icon={<Bell size={14} />} label="Alerts" />
          <Item href="/account/settings" icon={<Settings size={14} />} label="Settings" />
        </ul>
        <div className="border-t border-white/5 p-1">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/10"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </details>
  );
}

function Item({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.04] hover:text-amber-300"
      >
        <span className="text-white/60">{icon}</span>
        {label}
      </Link>
    </li>
  );
}

function Avatar({ name, large }: { name: string; large?: boolean }) {
  const initial = name[0]?.toUpperCase() ?? "?";
  const colors = ["from-emerald-400 to-emerald-600", "from-sky-400 to-sky-600", "from-rose-400 to-rose-600", "from-amber-400 to-amber-600", "from-violet-400 to-violet-600", "from-cyan-400 to-cyan-600"];
  const color = colors[name.charCodeAt(0) % colors.length];
  const size = large ? "h-10 w-10 text-base" : "h-7 w-7 text-xs";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-md ${color} ${size}`}
    >
      {initial}
    </div>
  );
}
