import { Suspense } from "react";
import { ConfirmClient } from "./confirm-client";

/**
 * Hash-fragment auth confirmation. Email links from Supabase point here
 * with the token in a URL fragment:
 *
 *   https://waxdepot.io/auth/confirm#token_hash=XXX&type=invite&next=/account
 *
 * Browsers don't send the fragment to the server, so Gmail's link
 * scanner fetches /auth/confirm with no token and can't consume
 * anything. This page renders a client component that reads
 * window.location.hash, extracts the token, and posts to the
 * verifyTokenHash server action — only the real user's browser ever
 * runs that JS, not the prefetcher.
 *
 * On success: redirect to ?next= (defaults to /account).
 * On failure: surface the error and offer the OTP code path on /login.
 */
export const dynamic = "force-dynamic";

export default function ConfirmPage() {
  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-180px)] max-w-md items-center justify-center px-4 py-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(212,175,55,0.12),transparent_50%)]" />
      <div className="w-full">
        <Suspense fallback={null}>
          <ConfirmClient />
        </Suspense>
      </div>
    </div>
  );
}
