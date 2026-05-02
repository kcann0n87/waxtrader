/**
 * Next.js instrumentation hook — runs once when the server boots.
 * Used to initialize Sentry (and any other server-side observability)
 * gracefully gated on env vars so a missing DSN doesn't break the build.
 */
export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      // Send errors but no PII / request bodies by default. Manual
      // setUser / setContext calls in server actions can override.
      sendDefaultPii: false,
      environment: process.env.VERCEL_ENV ?? "development",
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
      environment: process.env.VERCEL_ENV ?? "development",
    });
  }
}

/**
 * Send unhandled server errors to Sentry. Hooked by Next via this export
 * name. No-op if Sentry isn't configured.
 */
export async function onRequestError(
  error: unknown,
  request: { path?: string; method?: string },
) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(
    error,
    {
      path: request.path ?? "",
      method: request.method ?? "GET",
      headers: {},
    },
    { routerKind: "App Router", routePath: request.path ?? "", routeType: "render" },
  );
}
