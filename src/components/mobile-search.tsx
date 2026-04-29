"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

export function MobileSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
      >
        <Search size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-white">
          <form
            action="/search"
            method="get"
            className="flex items-center gap-2 border-b border-slate-200 px-3 py-3"
            onSubmit={() => setOpen(false)}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Close search"
            >
              <X size={18} />
            </button>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={16} />
              <input
                autoFocus
                name="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder='Search "2025 Bowman Hobby"'
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-9 text-sm focus:border-slate-400 focus:bg-white focus:outline-none"
              />
            </div>
          </form>
          {q && (
            <div className="px-4 py-2 text-xs text-slate-500">
              Press enter to search for &ldquo;{q}&rdquo;
            </div>
          )}
        </div>
      )}
    </>
  );
}
