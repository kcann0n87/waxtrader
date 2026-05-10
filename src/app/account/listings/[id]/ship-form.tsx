"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Loader2, Truck, X } from "lucide-react";
import { markShipped } from "@/app/actions/orders";

export function ShipForm({
  orderId,
  initialCarrier,
  initialTracking,
  needsShipBy,
  requiresPhoto = false,
}: {
  orderId: string;
  initialCarrier?: string | null;
  initialTracking?: string | null;
  needsShipBy?: string;
  // True for orders over $500 — server-enforced too, this gates the
  // submit button + flips the callout copy from "recommended" to
  // "required for orders over $500".
  requiresPhoto?: boolean;
}) {
  const router = useRouter();
  const [carrier, setCarrier] = useState(initialCarrier ?? "");
  const [tracking, setTracking] = useState(initialTracking ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [shipped, setShipped] = useState(!!initialTracking);
  const [pending, startTransition] = useTransition();

  const photoOk = !requiresPhoto || photo !== null;
  const valid = carrier && tracking.length >= 8 && photoOk;

  const onPickPhoto = (file: File | null) => {
    if (!file) {
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Photo must be JPG, PNG, or WebP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Photo must be 8MB or smaller.");
      return;
    }
    setError(null);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const submit = () => {
    if (!valid) return;
    setError(null);
    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("carrier", carrier);
    formData.set("tracking", tracking);
    if (photo) formData.set("photo", photo);
    startTransition(async () => {
      const result = await markShipped(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setShipped(true);
      router.refresh();
    });
  };

  if (shipped) {
    return (
      <div className="rounded-md border border-emerald-700/40 bg-emerald-500/10 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-100">
          <Check size={16} /> Marked as shipped
        </div>
        <div className="mt-1 text-xs text-emerald-200">
          {carrier} · <span className="font-mono">{tracking}</span>
        </div>
        <p className="mt-2 text-xs text-emerald-200">
          The buyer was notified. Once they confirm delivery (or auto-release fires), funds move to
          your pending balance.
        </p>
        <button
          onClick={() => setShipped(false)}
          className="mt-2 text-xs font-semibold text-emerald-300 transition hover:underline"
        >
          Update tracking
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-white/10 bg-[#101012] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
        <Truck size={16} className="text-white/60" />
        Mark as shipped
      </div>
      {needsShipBy && (
        <div className="mb-2 text-xs text-white/50">
          Ship by <strong className="text-white/80">{needsShipBy}</strong> to keep your seller score
          in good standing.
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr]">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-white/80">Carrier</span>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          >
            <option value="">Select…</option>
            <option>USPS</option>
            <option>UPS</option>
            <option>FedEx</option>
            <option>DHL</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-white/80">Tracking number</span>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="1Z999AA10123456784"
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </label>
      </div>

      <div
        className={
          requiresPhoto
            ? "mt-4 rounded-md border border-amber-500/50 bg-amber-500/[0.06] p-3"
            : "mt-4 rounded-md border border-emerald-700/40 bg-emerald-500/[0.04] p-3"
        }
      >
        <div className="flex items-start gap-2">
          <Camera
            size={14}
            className={
              requiresPhoto
                ? "mt-0.5 text-amber-300"
                : "mt-0.5 text-emerald-300"
            }
          />
          <div className="flex-1">
            <div
              className={
                requiresPhoto
                  ? "flex items-center gap-2 text-xs font-bold text-amber-100"
                  : "text-xs font-bold text-emerald-200"
              }
            >
              {requiresPhoto ? (
                <>
                  Packing photo
                  <span className="rounded-full bg-amber-500/30 px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase text-amber-100">
                    Required
                  </span>
                </>
              ) : (
                "Add a packing photo (recommended)"
              )}
            </div>
            <p
              className={
                requiresPhoto
                  ? "mt-0.5 text-[11px] leading-relaxed text-amber-100/80"
                  : "mt-0.5 text-[11px] leading-relaxed text-emerald-200/70"
              }
            >
              {requiresPhoto
                ? "Required for orders over $500. Snap a photo of the sealed box + shipping label before drop-off — this is the single strongest piece of evidence in a chargeback dispute."
                : "A photo of the sealed box + shipping label is the strongest chargeback defense we offer. Sellers who include one win disputes at significantly higher rates."}
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)}
          className="hidden"
        />

        {photoPreview ? (
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreview}
              alt="Packing preview"
              className="h-16 w-16 rounded-md border border-white/10 object-cover"
            />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-emerald-200">
                {photo?.name}
              </span>
              <button
                type="button"
                onClick={() => onPickPhoto(null)}
                className="inline-flex w-fit items-center gap-1 text-[11px] font-semibold text-rose-300 hover:text-rose-200"
              >
                <X size={11} /> Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-emerald-700/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/25"
          >
            <Camera size={12} /> Attach photo
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded border border-rose-700/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </div>
      )}

      <button
        disabled={!valid || pending}
        onClick={submit}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-sm font-bold text-slate-900 shadow-md shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : null}
        Mark as shipped
      </button>
    </div>
  );
}
