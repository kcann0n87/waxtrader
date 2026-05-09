"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { adminRemoveSku } from "@/app/actions/admin";

/**
 * Admin-only ✕ "remove from catalog" button. Renders as a small icon
 * in the top-right of whatever container mounts it. Click → confirm
 * modal → server action runs adminRemoveSku which always succeeds:
 *   - hard-deletes when nothing references the SKU
 *   - falls back to is_published=false when listings / orders / sales
 *     / bids / watches reference it (preserves historical FK
 *     integrity, hides from public catalog)
 *
 * The admin doesn't have to think "delete vs hide" — clicking ✕ just
 * makes the SKU disappear from the public catalog. The modal reports
 * which path was taken on success.
 *
 * Renders nothing for non-admins.
 */
export function AdminDeleteSkuButton({
  skuId,
  skuLabel,
  isAdmin,
}: {
  skuId: string;
  skuLabel: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Lock body scroll while modal is open + close on Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isAdmin) return null;

  const doDelete = () => {
    setError(null);
    start(async () => {
      const res = await adminRemoveSku(skuId);
      if (res.error) {
        setError(res.error);
        return;
      }
      // Always navigate away on success — whether deleted or hidden,
      // the SKU is no longer on the public catalog.
      router.push("/admin/catalog");
    });
  };

  return (
    <>
      {/* The X trigger — sits absolute in the parent's top-right. */}
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
        }}
        className="absolute top-3 right-3 z-30 inline-flex h-7 w-7 items-center justify-center rounded-full border border-rose-700/40 bg-rose-500/15 text-rose-200 transition hover:scale-110 hover:border-rose-500/60 hover:bg-rose-500/30 hover:text-rose-100"
        title="Delete this SKU (admin only)"
        aria-label="Delete SKU"
      >
        <X size={14} />
      </button>

      {/* Centered confirmation modal — only renders when open. */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="mx-4 w-full max-w-md rounded-2xl border border-rose-700/50 bg-[#101012] p-6 shadow-2xl shadow-rose-900/40">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
                <AlertTriangle size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-white">
                  Delete this SKU?
                </h2>
                <p className="mt-1 text-xs text-white/60">
                  <span className="font-mono text-rose-200">{skuLabel}</span>
                </p>
                <p className="mt-3 text-sm text-white/70">
                  Removes this SKU from the public catalog. If listings,
                  orders, or sales reference it, we hide it instead of
                  deleting (preserves historical records). Either way it
                  stops showing on the homepage and search.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-md border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-100">
                {error}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doDelete}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-md bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/30 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Trash2 size={11} />
                )}
                {pending ? "Removing…" : "Remove from catalog"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
