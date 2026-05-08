"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload, Loader2, Check } from "lucide-react";
import { adminUploadSkuImage } from "@/app/actions/admin";

/**
 * Admin-only drag-and-drop upload overlay that wraps the product
 * image on /product/[slug]. Lets admins replace the SKU's image
 * without leaving the page they're already viewing.
 *
 * Behavior:
 *   - Drag a file anywhere over the image → drop zone activates with
 *     amber outline + "Drop to upload" prompt
 *   - Click anywhere over the image → opens file picker
 *   - Upload via adminUploadSkuImage → server stores in Supabase
 *     storage AND updates skus.image_url, then page refreshes
 *   - Optimistic preview via FileReader so the new image shows
 *     immediately, replaced by the canonical CDN URL on refresh
 *
 * Renders nothing visible until hovered/dragged-over — the underlying
 * <ProductImageWithPreview> remains the visible image. Children get
 * positioned underneath the overlay via absolute layering.
 *
 * Server-side admin check: the upload action requireAdmin()'s before
 * doing anything. The overlay still renders for non-admins (because
 * the parent is server-side rendered without an auth check), but
 * upload attempts fail safely. Adding a render-time gate is left to
 * the caller — passing isAdmin=false simply hides the overlay.
 */
export function AdminImageDropOverlay({
  skuId,
  slug,
  isAdmin,
  children,
}: {
  skuId: string;
  slug: string;
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);

  // Non-admin: render children unchanged. The overlay code never runs.
  if (!isAdmin) return <>{children}</>;

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Drop an image file (JPG, PNG, WebP).");
      return;
    }
    setError(null);

    // Optimistic preview
    const reader = new FileReader();
    reader.onload = () => setOptimistic(reader.result as string);
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.set("file", file);
    fd.set("slug", slug);
    fd.set("skuId", skuId);

    startTransition(async () => {
      const result = await adminUploadSkuImage(fd);
      if (result.error) {
        setError(result.error);
        setOptimistic(null);
        return;
      }
      // Brief success state, then refresh the server component to pick
      // up the canonical CDN URL written to skus.image_url.
      setJustUploaded(true);
      setTimeout(() => {
        setJustUploaded(false);
        setOptimistic(null);
        router.refresh();
      }, 800);
    });
  };

  return (
    <div
      className="group relative"
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!pending) setDragActive(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only reset if leaving the wrapper, not children. relatedTarget
        // null check covers the case where the drag leaves the document.
        if (
          !(e.currentTarget as HTMLElement).contains(
            e.relatedTarget as Node | null,
          )
        ) {
          setDragActive(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) handleFile(file);
      }}
    >
      {/* Optimistic preview layer — renders ON TOP of children when
          an upload is in flight so the admin sees the new image
          immediately, even before the CDN write completes. */}
      {optimistic && (
        <div className="absolute inset-0 z-20 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={optimistic}
            alt="Uploading…"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {children}

      {/* Click target + drag-active overlay. Sits over the image, only
          visible on hover or while a drag is happening. */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={pending}
        className={
          dragActive
            ? "absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-400 bg-amber-500/30 backdrop-blur-sm"
            : "absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-transparent bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100 disabled:cursor-wait"
        }
      >
        {pending ? (
          <>
            <Loader2 size={32} className="animate-spin text-amber-300" />
            <span className="text-xs font-bold tracking-wider text-amber-200 uppercase">
              Uploading…
            </span>
          </>
        ) : justUploaded ? (
          <>
            <Check size={32} className="text-emerald-300" />
            <span className="text-xs font-bold tracking-wider text-emerald-200 uppercase">
              Uploaded
            </span>
          </>
        ) : (
          <>
            <CloudUpload size={32} className="text-amber-300" />
            <span className="text-xs font-bold tracking-wider text-white uppercase">
              {dragActive ? "Drop to upload" : "Drop or click to replace"}
            </span>
            <span className="px-3 text-center text-[10px] text-white/70">
              JPG, PNG, or WebP · Replaces the photo on this listing
            </span>
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        className="hidden"
      />

      {error && (
        <div className="absolute right-2 bottom-2 z-40 rounded-md border border-rose-500/40 bg-rose-500/15 px-2 py-1 text-[10px] font-semibold text-rose-200">
          {error}
        </div>
      )}
    </div>
  );
}
