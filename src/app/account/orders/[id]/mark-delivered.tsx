"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, PackageCheck } from "lucide-react";
import { markDelivered } from "@/app/actions/orders";

export function MarkDeliveredButton({
  orderId,
  isSeller,
}: {
  orderId: string;
  isSeller: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="mt-2 rounded-md border border-sky-700/40 bg-sky-500/10 p-3 text-sm">
        <div className="flex items-center gap-2 font-bold text-sky-100">
          <Check size={16} /> Marked delivered
        </div>
        <p className="mt-1 text-xs text-sky-200">
          Funds auto-release in 2 days unless the buyer disputes. They can also confirm now to
          release immediately.
        </p>
      </div>
    );
  }

  const submit = () => {
    setError(null);
    const formData = new FormData();
    formData.set("orderId", orderId);
    startTransition(async () => {
      const result = await markDelivered(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setDone(true);
      router.refresh();
    });
  };

  return (
    <div className="mt-2 rounded-md border border-sky-700/40 bg-sky-500/10 p-3">
      <div className="flex items-start gap-2">
        <PackageCheck size={16} className="mt-0.5 text-sky-300" />
        <div className="flex-1">
          <div className="text-sm font-bold text-white">
            {isSeller ? "Carrier shows delivered?" : "Did your package arrive?"}
          </div>
          <p className="mt-0.5 text-xs text-sky-100/80">
            {isSeller
              ? "Mark this order delivered. Funds auto-release in 2 days unless the buyer disputes."
              : "Mark this delivered to start the 2-day auto-release timer. (Or confirm immediately to release funds now.)"}
          </p>
        </div>
      </div>
      {error && (
        <div className="mt-2 rounded border border-rose-700/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200">
          {error}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={submit}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md border border-sky-700/40 bg-sky-500/15 px-3 py-1.5 text-xs font-bold text-sky-200 transition hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <Loader2 size={12} className="animate-spin" /> : <PackageCheck size={12} />}
          Mark delivered
        </button>
      </div>
    </div>
  );
}
