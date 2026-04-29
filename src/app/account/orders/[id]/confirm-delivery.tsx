"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";

export function ConfirmDeliveryButton({ orderId }: { orderId: string }) {
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
        <div className="flex items-center gap-2 font-bold text-emerald-900">
          <Check size={16} /> Confirmed — funds released
        </div>
        <p className="mt-1 text-xs text-emerald-800">
          Thanks for confirming. The seller has been notified and your payment was released. They&apos;ll
          receive it in their next Friday payout.
        </p>
        <Link
          href="/account"
          className="mt-2 inline-block text-xs font-semibold text-emerald-700 hover:underline"
        >
          Back to orders →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-md border border-indigo-200 bg-indigo-50 p-3">
      <div className="flex items-start gap-2">
        <ShieldCheck size={16} className="mt-0.5 text-indigo-700" />
        <div className="flex-1">
          <div className="text-sm font-bold text-indigo-900">Did your box arrive sealed?</div>
          <p className="mt-0.5 text-xs text-indigo-800">
            Confirming releases the payment to the seller. If something&apos;s wrong, open a dispute
            instead — your payment stays held until it&apos;s resolved.
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setConfirmed(true)}
          className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Yes, release funds
        </button>
        <Link
          href={`/account/disputes/new?order=${orderId}`}
          className="flex-1 rounded-md border border-rose-300 bg-white px-3 py-2 text-center text-sm font-semibold text-rose-700 hover:bg-rose-50"
        >
          Open a dispute
        </Link>
      </div>
      <div className="mt-2 text-[11px] text-indigo-700">
        Order {orderId} · auto-releases in 3 days if you take no action.
      </div>
    </div>
  );
}
