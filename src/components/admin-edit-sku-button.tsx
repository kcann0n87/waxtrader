import Link from "next/link";
import { Pencil } from "lucide-react";

/**
 * Admin-only pencil pill that jumps straight to the SKU's full
 * admin edit form at /admin/catalog/[id]. Every field there is
 * editable: year, brand, set, product, sport, release date,
 * description, image URL, gradient, is_published. Useful when a
 * SKU's release date was wrong (product already shipped, or date
 * was a placeholder) or any other detail needs a one-off fix.
 *
 * Sits in the top-right corner stack next to the add/pin/delete
 * pills:
 *   right-28: 🖊️  edit (slate)   ← this
 *   right-20: 📌  featured rank (amber)
 *   right-12: +   add SKU (emerald)
 *   right-3:  ✕   delete (rose)
 *
 * Renders nothing for non-admins.
 */
export function AdminEditSkuButton({
  skuId,
  isAdmin,
}: {
  skuId: string;
  isAdmin: boolean;
}) {
  if (!isAdmin) return null;

  return (
    <Link
      href={`/admin/catalog/${skuId}`}
      className="absolute top-3 right-28 z-30 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-500/40 bg-slate-500/15 text-slate-200 transition hover:scale-110 hover:border-slate-400/60 hover:bg-slate-500/30 hover:text-white"
      title="Edit this SKU (year, brand, set, release date, description, gradient, etc.)"
      aria-label="Edit SKU"
    >
      <Pencil size={12} />
    </Link>
  );
}
