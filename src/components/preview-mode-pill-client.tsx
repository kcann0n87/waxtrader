"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, X } from "lucide-react";
import { setPreviewMode } from "@/app/actions/preview-mode";

/**
 * Floating bottom-right pill that confirms preview mode is on and
 * lets the admin click to disable it. Renders only when the parent
 * server component has confirmed preview is currently active.
 */
export function PreviewModePillClient() {
  const router = useRouter();
  const [pending, start] = useTransition();

  const disable = () => {
    start(async () => {
      await setPreviewMode(false);
      router.refresh();
    });
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-fuchsia-500/40 bg-fuchsia-500/15 px-3 py-1.5 text-xs font-semibold text-fuchsia-200 shadow-lg shadow-fuchsia-900/40 backdrop-blur-md">
        <Eye size={11} />
        <span>Preview mode — staged products visible</span>
        <button
          type="button"
          onClick={disable}
          disabled={pending}
          className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-[10px] font-bold transition hover:bg-fuchsia-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={9} />
          {pending ? "OFF…" : "Disable"}
        </button>
      </div>
    </div>
  );
}
