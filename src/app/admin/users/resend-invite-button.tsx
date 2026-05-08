"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { adminSendSignInLink } from "@/app/actions/admin";

/**
 * One-click resend on the admin user list. Calls adminSendSignInLink
 * which transparently picks invite-vs-magic-link based on the user's
 * activation state. No rate limit on our side — admin can hammer this
 * if a user keeps losing the email. Supabase has its own
 * per-email/per-hour cap; if that fires we surface the error.
 */
export function ResendInviteButton({
  userId,
  email,
  everSignedIn,
}: {
  userId: string;
  email: string;
  everSignedIn: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = () => {
    setError(null);
    startTransition(async () => {
      const res = await adminSendSignInLink({ userId, email });
      if (res.error) {
        setError(res.error);
        return;
      }
      setSentAt(Date.now());
      // Auto-clear the success state after a few seconds so admin can
      // resend again with a clean button.
      setTimeout(() => setSentAt(null), 4000);
    });
  };

  const label = everSignedIn ? "Send magic link" : "Resend invite";

  return (
    <div className="inline-flex flex-col items-end">
      <button
        onClick={send}
        disabled={pending}
        className={
          sentAt
            ? "inline-flex items-center gap-1.5 rounded-md border border-emerald-700/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-200"
            : "inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#101012] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        }
        title={
          everSignedIn
            ? `Send a magic-link sign-in email to ${email}`
            : `Resend the invite email to ${email}`
        }
      >
        {pending ? (
          <Loader2 size={11} className="animate-spin" />
        ) : sentAt ? (
          <Check size={11} />
        ) : (
          <Send size={11} />
        )}
        {pending ? "Sending…" : sentAt ? "Sent" : label}
      </button>
      {error && (
        <p className="mt-1 max-w-[200px] text-right text-[10px] text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
