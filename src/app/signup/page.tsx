import Link from "next/link";
import { Suspense } from "react";
import { SignupForm } from "./signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/" } = await searchParams;

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
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Already have one?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="font-semibold text-indigo-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <Suspense fallback={null}>
          <SignupForm next={next} />
        </Suspense>
      </div>
    </div>
  );
}
