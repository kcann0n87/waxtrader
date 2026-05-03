import type { Metadata } from "next";
import { Lightbulb, Package } from "lucide-react";
import { FeedbackForms } from "./feedback-forms";
import { getProfile } from "@/lib/supabase/user";

export const metadata: Metadata = {
  title: "Feedback · WaxDepot",
  description:
    "Suggest a feature or request a sealed sports card set to be added to the WaxDepot catalog. Built by collectors, for collectors.",
};

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const profile = await getProfile();
  const userEmail = profile?.username ? `${profile.username}@waxdepot.io` : null; // placeholder hint
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-700/30 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-amber-300 uppercase">
          <Lightbulb size={11} />
          Feedback
        </p>
        <h1 className="font-display mx-auto mt-4 max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
          Help shape WaxDepot
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/70">
          Suggest a feature, request a missing set, or tell us what would
          make this marketplace better. We read every submission.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card
          icon={<Lightbulb size={18} />}
          title="Suggest a feature"
          subtitle="A workflow, a chart, a tool you wish existed"
          accent="amber"
        />
        <Card
          icon={<Package size={18} />}
          title="Request a set"
          subtitle="A product line we don't carry yet"
          accent="sky"
        />
      </div>

      <FeedbackForms isSignedIn={!!profile} signedInHint={userEmail ?? undefined} />

      <div className="mt-12 rounded-2xl border border-white/10 bg-[#101012] p-6">
        <h2 className="font-display text-lg font-black text-white">What happens next</h2>
        <ol className="mt-3 space-y-2 text-sm text-white/70">
          <li>
            <strong className="text-white">1.</strong> We review every
            submission within ~3 business days.
          </li>
          <li>
            <strong className="text-white">2.</strong> Set requests get
            added to the catalog if the product is real and there&apos;s
            buyer/seller interest. We&apos;ll email you when it goes live.
          </li>
          <li>
            <strong className="text-white">3.</strong> Feature requests
            get triaged. We can&apos;t build everything, but we ship the
            things we hear repeatedly.
          </li>
        </ol>
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  subtitle,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: "amber" | "sky";
}) {
  const colors =
    accent === "amber"
      ? { ring: "border-amber-700/30", bg: "bg-amber-500/10", text: "text-amber-300" }
      : { ring: "border-sky-700/30", bg: "bg-sky-500/10", text: "text-sky-300" };
  return (
    <div className={`rounded-xl border bg-[#101012] p-4 ${colors.ring}`}>
      <div
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}
      >
        {icon}
      </div>
      <div className="mt-3 text-sm font-bold text-white">{title}</div>
      <div className="mt-0.5 text-xs text-white/60">{subtitle}</div>
    </div>
  );
}
