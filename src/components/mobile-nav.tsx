"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Tag, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart";

const tabs = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/search", label: "Search", icon: Search, match: (p: string) => p.startsWith("/search") },
  { href: "/sell", label: "Sell", icon: Tag, match: (p: string) => p.startsWith("/sell") },
  { href: "/cart", label: "Cart", icon: ShoppingBag, match: (p: string) => p.startsWith("/cart"), badge: "cart" as const },
  { href: "/account", label: "Account", icon: User, match: (p: string) => p.startsWith("/account") },
];

export function MobileNav() {
  const pathname = usePathname() || "/";
  const { itemCount, hydrated } = useCart();

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = t.match(pathname);
          const showBadge = t.badge === "cart" && hydrated && itemCount > 0;
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={`relative flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-semibold transition ${
                  active ? "text-indigo-600" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span className="relative">
                  <Icon size={20} />
                  {showBadge && (
                    <span className="absolute -top-1 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
