"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { adminInviteUser, adminSendSignInLink } from "@/app/actions/admin";

/**
 * Admin invite form. Two states beyond the happy path:
 *
 *   1. Duplicate-email error from adminInviteUser (the user is already
 *      activated in auth.users). Instead of leaving the admin stuck
 *      reading "already exists", we show a "Send magic link instead"
 *      button that pivots to adminSendSignInLink — same UX outcome,
 *      no need to change tab to /admin/users.
 *
 *   2. Generic error → just render in red.
 *
 * Whichever path completed, the success banner shows what happened
 * (invite vs. magic link) so the admin knows what landed in the
 * recipient's inbox.
 */
export function InviteForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState<{ email: string; via: "invite" | "magiclink" } | null>(null);

  // Distinct flag for the "already exists" case so we can offer the
  // magic-link fallback inline instead of forcing the admin to navigate
  // to /admin/users to find the resend button.
  const [duplicateEmail, setDuplicateEmail] = useState<string | null>(null);

  const reset = () => {
    setErr(null);
    setSent(null);
    setDuplicateEmail(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    const targetEmail = email.trim();
    start(async () => {
      const res = await adminInviteUser({
        email: targetEmail,
        displayName: displayName.trim() || undefined,
      });
      if (res.error) {
        if (/already exists/i.test(res.error)) {
          setDuplicateEmail(targetEmail);
        } else {
          setErr(res.error);
        }
        return;
      }
      setSent({ email: targetEmail, via: "invite" });
      setEmail("");
      setDisplayName("");
      router.refresh();
    });
  };

  const sendMagicLinkInstead = () => {
    if (!duplicateEmail) return;
    const targetEmail = duplicateEmail;
    reset();
    start(async () => {
      const res = await adminSendSignInLink({ email: targetEmail });
      if (res.error) {
        setErr(res.error);
        return;
      }
      setSent({ email: targetEmail, via: "magiclink" });
      setEmail("");
      setDisplayName("");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold tracking-wider text-white/60 uppercase">
          Email
        </span>
        <input
          type="email"
          required
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="invitee@example.com"
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40"
          disabled={pending}
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold tracking-wider text-white/60 uppercase">
          Display name <span className="text-white/40 normal-case">(optional)</span>
        </span>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="What we'll call them in the UI"
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40"
          disabled={pending}
        />
      </label>

      {err && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {err}
        </div>
      )}

      {duplicateEmail && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
          <div className="font-bold text-amber-50">
            {duplicateEmail} already has an account.
          </div>
          <p className="mt-1 text-amber-200/80">
            That email has signed in before, so a fresh invite can't be
            issued. To get them back in, send a magic-link sign-in email
            instead — same one-click experience for them.
          </p>
          <button
            type="button"
            onClick={sendMagicLinkInstead}
            disabled={pending}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-100 transition hover:border-amber-400/60 hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Send size={11} />
            )}
            {pending ? "Sending…" : `Send magic link to ${duplicateEmail}`}
          </button>
        </div>
      )}

      {sent && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          <CheckCircle2 size={14} />
          {sent.via === "magiclink" ? "Magic link" : "Invite"} sent to{" "}
          <span className="font-semibold">{sent.email}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending || !email}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        {pending ? "Sending…" : "Send invite"}
      </button>
    </form>
  );
}
