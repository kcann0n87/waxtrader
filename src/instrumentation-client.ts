/**
 * Next.js client-side instrumentation. Runs once when the browser first
 * loads any page in the app. Like the server-side instrumentation file,
 * this is gated on NEXT_PUBLIC_SENTRY_DSN so a missing DSN doesn't
 * break the bundle.
 */
import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    sendDefaultPii: false,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
  });
}

// Required export so Next picks up route-change errors.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
