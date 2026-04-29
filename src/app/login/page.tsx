import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; confirm?: string }>;
}) {
  const { next = "/", confirm } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-md items-center justify-center px-4 py-8">
      <div className="w-full">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 font-black text-white">
              W
            </div>
            <span className="text-lg font-bold tracking-tight">WaxMarket</span>
          </Link>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
            Sign in to your account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            New here?{" "}
            <Link
              href={`/signup?next=${encodeURIComponent(next)}`}
              className="font-semibold text-indigo-600 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        {confirm === "1" && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <strong>Check your email.</strong> We sent a confirmation link — click it, then come
            back here to sign in.
          </div>
        )}

        <Suspense fallback={null}>
          <LoginForm next={next} />
        </Suspense>
      </div>
    </div>
  );
}
