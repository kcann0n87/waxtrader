"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, Check, Heart, ShieldCheck, Trophy, UserPlus } from "lucide-react";
import { sellers } from "@/lib/sellers";
import { useFollowing } from "@/lib/follow";

const sports = [
  { id: "NBA", label: "Basketball", emoji: "🏀" },
  { id: "MLB", label: "Baseball", emoji: "⚾" },
  { id: "NFL", label: "Football", emoji: "🏈" },
  { id: "NHL", label: "Hockey", emoji: "🏒" },
  { id: "Pokemon", label: "Pokemon", emoji: "🎴" },
];

type Step = "intro" | "sports" | "notifications" | "follow" | "done";

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [notifPrefs, setNotifPrefs] = useState({ priceDrops: true, newListings: true, orders: true });
  const { toggle, has } = useFollowing();

  const finish = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("waxmarket:onboarded", "1");
      window.localStorage.setItem("waxmarket:sports", JSON.stringify([...picked]));
    }
    router.push("/");
  };

  const toggleSport = (id: string) => {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-2xl items-center justify-center px-4 py-8">
      <div className="w-full">
        <Stepper step={step} />

        {step === "intro" && (
          <Card>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-2xl font-black text-white shadow-lg">
                W
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900">Welcome to WaxMarket</h1>
              <p className="mt-2 text-slate-600">
                The marketplace for sealed sports cards. Real bid/ask, real escrow, no eBay tax.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
                <Highlight icon={<Trophy size={16} />} title="Real prices" body="Bid/ask orderbook with 90-day price history on every product" />
                <Highlight icon={<ShieldCheck size={16} />} title="Buyer protection" body="Payments held in escrow until you confirm the box arrived sealed" />
                <Highlight icon={<Bell size={16} />} title="Stay in the loop" body="Watchlists, price alerts, and notifications for what you care about" />
              </div>
              <button
                onClick={() => setStep("sports")}
                className="mt-7 inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Get started <ArrowRight size={14} />
              </button>
              <div className="mt-3 text-xs text-slate-400">
                Takes 60 seconds. Or{" "}
                <Link href="/" className="text-indigo-600 hover:underline">
                  skip and explore
                </Link>
                .
              </div>
            </div>
          </Card>
        )}

        {step === "sports" && (
          <Card>
            <h2 className="text-xl font-black tracking-tight text-slate-900">What do you collect?</h2>
            <p className="mt-1 text-sm text-slate-500">Pick one or more — we&apos;ll prioritize these in your feed.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {sports.map((s) => {
                const active = picked.has(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSport(s.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                      active
                        ? "border-indigo-500 bg-indigo-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="text-3xl">{s.emoji}</span>
                    <span className="text-sm font-bold text-slate-900">{s.label}</span>
                    <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{s.id}</span>
                    {active && (
                      <span className="absolute top-2 right-2 rounded-full bg-indigo-500 p-0.5 text-white">
                        <Check size={10} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <Footer
              onBack={() => setStep("intro")}
              onNext={() => setStep("notifications")}
              nextDisabled={picked.size === 0}
            />
          </Card>
        )}

        {step === "notifications" && (
          <Card>
            <h2 className="text-xl font-black tracking-tight text-slate-900">Stay in the loop</h2>
            <p className="mt-1 text-sm text-slate-500">Pick what to notify you about. You can change this anytime.</p>
            <ul className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
              <NotifRow
                icon={<Heart size={16} className="text-rose-500" />}
                label="Price drops"
                description="When something on your watchlist gets cheaper"
                on={notifPrefs.priceDrops}
                onChange={(v) => setNotifPrefs((p) => ({ ...p, priceDrops: v }))}
              />
              <NotifRow
                icon={<Bell size={16} className="text-indigo-500" />}
                label="New listings"
                description="When a seller lists a product matching a saved search"
                on={notifPrefs.newListings}
                onChange={(v) => setNotifPrefs((p) => ({ ...p, newListings: v }))}
              />
              <NotifRow
                icon={<ShieldCheck size={16} className="text-emerald-500" />}
                label="Order updates"
                description="Shipped, delivered, refunded — required for transactions"
                on={notifPrefs.orders}
                onChange={(v) => setNotifPrefs((p) => ({ ...p, orders: v }))}
              />
            </ul>
            <Footer onBack={() => setStep("sports")} onNext={() => setStep("follow")} />
          </Card>
        )}

        {step === "follow" && (
          <Card>
            <h2 className="text-xl font-black tracking-tight text-slate-900">Follow some sellers</h2>
            <p className="mt-1 text-sm text-slate-500">
              These are high-rated sellers in the categories you picked. You can always follow more later.
            </p>
            <ul className="mt-5 space-y-2">
              {sellers.slice(0, 5).map((s) => (
                <li
                  key={s.username}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <Avatar name={s.displayName} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900">{s.displayName}</div>
                    <div className="text-xs text-slate-500">
                      {s.location} · {s.rating}% positive · {s.totalSales.toLocaleString()} sales
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(s.username)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                      has(s.username)
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {has(s.username) ? (
                      <span className="inline-flex items-center gap-1">
                        <Check size={11} /> Following
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <UserPlus size={11} /> Follow
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <Footer onBack={() => setStep("notifications")} onNext={() => setStep("done")} />
          </Card>
        )}

        {step === "done" && (
          <Card>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Check className="text-emerald-600" size={32} />
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">You&apos;re set</h2>
              <p className="mt-2 text-sm text-slate-600">
                Welcome aboard. Here&apos;s what to do next:
              </p>
              <div className="mx-auto mt-5 max-w-sm space-y-2 text-left">
                <NextStep label="Browse the catalog" href="/" />
                <NextStep label="Check the release calendar" href="/releases" />
                <NextStep label="Set up payouts (if you plan to sell)" href="/sell/payouts" />
              </div>
              <button
                onClick={finish}
                className="mt-6 rounded-md bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Take me to the marketplace
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">{children}</div>;
}

function Stepper({ step }: { step: Step }) {
  const steps: Step[] = ["intro", "sports", "notifications", "follow", "done"];
  const idx = steps.indexOf(step);
  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`h-1.5 rounded-full transition-all ${
            i < idx ? "w-6 bg-emerald-500" : i === idx ? "w-8 bg-slate-900" : "w-6 bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

function Highlight({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
        <span className="text-indigo-600">{icon}</span>
        {title}
      </div>
      <div className="mt-1 text-xs text-slate-600">{body}</div>
    </div>
  );
}

function Footer({
  onBack,
  onNext,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-6 flex justify-between">
      <button
        onClick={onBack}
        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        ← Back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue <ArrowRight size={14} />
      </button>
    </div>
  );
}

function NotifRow({
  icon,
  label,
  description,
  on,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-slate-900">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
      <button
        onClick={() => onChange(!on)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition ${on ? "bg-emerald-500" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            on ? "left-[19px]" : "left-0.5"
          }`}
        />
      </button>
    </li>
  );
}

function NextStep({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30"
    >
      {label}
      <ArrowRight size={14} className="text-slate-400" />
    </Link>
  );
}

function Avatar({ name }: { name: string }) {
  const initial = name[0]?.toUpperCase() ?? "?";
  const colors = ["bg-emerald-600", "bg-sky-600", "bg-rose-600", "bg-amber-600", "bg-violet-600", "bg-cyan-600"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${color}`}>
      {initial}
    </div>
  );
}
