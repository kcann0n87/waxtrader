"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { adminRemoveVariantGroup } from "@/app/actions/admin";

/**
 * Floating ✕ button on a homepage / browse / search product card.
 * Removes the ENTIRE product (every SKU sharing the variant_group)
 * in one click — Hobby Box + Hobby Case + Mega Box + Blaster + … all
 * gone together.
 *
 * Distinguished from the per-SKU ✕ on the product detail page:
 *   - Detail-page ✕ → adminRemoveSku → one variant
 *   - Card ✕ (this) → adminRemoveVariantGroup → whole product card
 *
 * Falls back to hide (is_published=false) for any variant referenced
 * by listings/orders/sales/bids/watches, exactly like the single-SKU
 * version. Reports a "Removed 12 variants (8 deleted, 4 hidden)"
 * summary so the admin sees what happened.
 *
 * Renders as a small rose ✕ pill in the top-right of each card,
 * visible only on card hover (and only for admins). Uses absolute
 * positioning + z-30 so it sits above the card's Link without
 * intercepting Link clicks elsewhere on the card.
 */
export function AdminCardDeleteButton({
  variantGroup,
  productLabel,
  isAdmin,
}: {
  variantGroup: string;
  productLabel: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const doRemove = () => {
    setError(null);
    setSuccess(null);
    start(async () => {
      const res = await adminRemoveVariantGroup(variantGroup);
      if (res.error) {
        setError(res.error);
        return;
      }
      const deleted = res.deleted ?? 0;
      const hidden = res.hidden ?? 0;
      const total = res.total ?? deleted + hidden;
      setSuccess(
        `Removed ${total} variant${total === 1 ? "" : "s"}` +
          (hidden > 0
            ? ` (${deleted} deleted, ${hidden} hidden — referenced by orders/listings).`
            : "."),
      );
      // Refresh the page so the card disappears from the grid.
      router.refresh();
      setTimeout(() => setOpen(false), 1100);
    });
  };

  return (
    <>
      {/* The ✕ trigger — sits absolute in the parent's top-right.
          Visible on card hover only (group-hover pattern); click
          stops propagation so the card's Link doesn't fire. */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
          setError(null);
          setSuccess(null);
        }}
        className="absolute top-3 right-3 z-30 inline-flex h-7 w-7 items-center justify-center rounded-full border border-rose-700/40 bg-rose-500/15 text-rose-200 opacity-0 transition group-hover:opacity-100 hover:scale-110 hover:border-rose-500/60 hover:bg-rose-500/30 hover:text-rose-100"
        title="Remove this product (all variants)"
        aria-label="Remove product"
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
                  Remove this product?
                </h2>
                <p className="mt-1 text-xs text-white/60">
                  <span className="font-mono text-rose-200">{productLabel}</span>
                </p>
                <p className="mt-3 text-sm text-white/70">
                  Removes every variant of this product (Hobby Box, Hobby
                  Case, Mega Box, etc.) from the public catalog. Variants
                  with linked orders / listings get hidden instead of
                  deleted to preserve history.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-md border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-100">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100">
                {success}
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
                onClick={doRemove}
                disabled={pending || !!success}
                className="inline-flex items-center gap-1.5 rounded-md bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/30 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Trash2 size={11} />
                )}
                {pending ? "Removing…" : "Remove product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
