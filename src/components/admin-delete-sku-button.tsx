"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { adminDeleteSku } from "@/app/actions/admin";

/**
 * Admin-only delete button that pairs with the drag-and-drop image
 * upload overlay. Sits on the product page as a small floating action
 * — clicking it asks for confirmation, then calls adminDeleteSku.
 *
 * The server action refuses to delete if any listings reference this
 * SKU (we never want to orphan listings) — surfaces that error inline
 * if it fires. Otherwise: redirect to /admin/catalog after success.
 *
 * Renders nothing for non-admins. Same pattern as
 * AdminImageDropOverlay — gated server-side, but defensive client
 * render means non-admin viewers can't even see the button.
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
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin) return null;

  const cancel = () => {
    setConfirming(false);
    setError(null);
  };

  const doDelete = () => {
    setError(null);
    start(async () => {
      const res = await adminDeleteSku(skuId);
      if (res.error) {
        setError(res.error);
        return;
      }
      // Server-side delete done — bounce admin to the catalog so they
      // don't sit on a 404 product page.
      router.push("/admin/catalog");
    });
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-rose-700/40 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-200 transition hover:border-rose-500/60 hover:bg-rose-500/20"
        title="Delete this SKU (admin only)"
      >
        <Trash2 size={11} />
        Delete SKU
      </button>
    );
  }

  return (
    <div className="rounded-md border border-rose-700/50 bg-rose-500/10 p-3">
      <div className="flex items-start gap-2 text-xs text-rose-100">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-300" />
        <div className="min-w-0 flex-1">
          <div className="font-bold">Permanently delete this SKU?</div>
          <p className="mt-0.5 text-rose-200/80">
            <span className="font-mono text-rose-100">{skuLabel}</span> will be
            removed from the catalog. Any listings that reference it will block
            the delete and surface here. This can&apos;t be undone — but you
            can re-add via /admin/catalog/new if needed.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-2 rounded-md border border-rose-500/40 bg-rose-500/20 px-2 py-1 text-[11px] font-semibold text-rose-100">
          {error}
        </div>
      )}

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={cancel}
          disabled={pending}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={doDelete}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md bg-rose-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-rose-500/30 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Trash2 size={11} />
          )}
          {pending ? "Deleting…" : "Delete permanently"}
        </button>
      </div>
    </div>
  );
}
