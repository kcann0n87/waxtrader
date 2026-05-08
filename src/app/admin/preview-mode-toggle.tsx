"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { setPreviewMode } from "@/app/actions/preview-mode";

/**
 * Big visible toggle on /admin overview. Flips the wd_preview cookie
 * for the current admin so every catalog page (home, browse, search,
 * release calendar, product pages) renders staged is_published=false
 * SKUs as if they were published.
 */
export function PreviewModeToggle({ previewOn }: { previewOn: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const toggle = () => {
    start(async () => {
      await setPreviewMode(!previewOn);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={
        previewOn
          ? "inline-flex items-center gap-2 rounded-md border border-fuchsia-500/40 bg-fuchsia-500/15 px-3 py-2 text-xs font-bold text-fuchsia-200 transition hover:bg-fuchsia-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          : "inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 transition hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
      }
      title={
        previewOn
          ? "Preview mode is ON — staged products visible across the site"
          : "Enable preview mode to see staged is_published=false products as if they were live"
      }
    >
      {pending ? (
        <Loader2 size={12} className="animate-spin" />
      ) : previewOn ? (
        <Eye size={12} />
      ) : (
        <EyeOff size={12} />
      )}
      Preview mode: {previewOn ? "ON" : "OFF"}
    </button>
  );
}
