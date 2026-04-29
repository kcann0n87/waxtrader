"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Building2,
  Check,
  CreditCard,
  Lock,
  MapPin,
  Plus,
  Star,
  Trash2,
  User,
} from "lucide-react";

type CardOnFile = { id: string; brand: string; last4: string; exp: string; isDefault: boolean };
type Address = { id: string; name: string; addr1: string; city: string; state: string; zip: string; isDefault: boolean };

const initialCards: CardOnFile[] = [
  { id: "c1", brand: "Visa", last4: "4242", exp: "08/27", isDefault: true },
  { id: "c2", brand: "Mastercard", last4: "5454", exp: "02/26", isDefault: false },
];

const initialAddresses: Address[] = [
  { id: "a1", name: "Kyle Cannon", addr1: "123 Main St", city: "Austin", state: "TX", zip: "78701", isDefault: true },
  { id: "a2", name: "Kyle Cannon — Office", addr1: "500 W 2nd St", city: "Austin", state: "TX", zip: "78701", isDefault: false },
];

export default function SettingsPage() {
  const [cards, setCards] = useState<CardOnFile[]>(initialCards);
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [emailOrders, setEmailOrders] = useState(true);
  const [emailMessages, setEmailMessages] = useState(true);
  const [pushAll, setPushAll] = useState(true);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/account" className="inline-flex items-center gap-1 hover:text-slate-900">
          <ArrowLeft size={14} /> Account
        </Link>
        <span>/</span>
        <span className="text-slate-900">Settings</span>
      </div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900">Settings</h1>

      <Section icon={<User size={16} />} title="Profile" subtitle="Your basic info">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Display name">
            <input defaultValue="Kyle Cannon" className={input} />
          </Field>
          <Field label="Email">
            <input defaultValue="kyle@example.com" className={input} type="email" />
          </Field>
        </div>
      </Section>

      <Section icon={<MapPin size={16} />} title="Addresses" subtitle="Where you ship to">
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {addresses.map((a) => (
            <li key={a.id} className="flex items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  {a.name}
                  {a.isDefault && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      DEFAULT
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {a.addr1}, {a.city}, {a.state} {a.zip}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!a.isDefault && (
                  <button
                    onClick={() =>
                      setAddresses((arr) => arr.map((x) => ({ ...x, isDefault: x.id === a.id })))
                    }
                    className="rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => setAddresses((arr) => arr.filter((x) => x.id !== a.id))}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50">
          <Plus size={14} />
          Add address
        </button>
      </Section>

      <Section icon={<CreditCard size={16} />} title="Payment methods" subtitle="Cards on file" right={<Lock size={11} className="text-slate-400" />}>
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {cards.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-slate-900 text-[10px] font-bold text-white">
                {c.brand.slice(0, 4).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  {c.brand} •••{c.last4}
                  {c.isDefault && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      DEFAULT
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">Expires {c.exp}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!c.isDefault && (
                  <button
                    onClick={() => setCards((arr) => arr.map((x) => ({ ...x, isDefault: x.id === c.id })))}
                    className="rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => setCards((arr) => arr.filter((x) => x.id !== c.id))}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50">
          <Plus size={14} />
          Add card
        </button>
      </Section>

      <Section icon={<Bell size={16} />} title="Notifications" subtitle="When and how we reach out">
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          <NotifRow
            label="Order updates"
            description="Shipped, delivered, refunded"
            on={emailOrders}
            onChange={setEmailOrders}
          />
          <NotifRow
            label="Messages"
            description="New messages from sellers and support"
            on={emailMessages}
            onChange={setEmailMessages}
          />
          <NotifRow
            label="Push notifications"
            description="Real-time alerts via the app"
            on={pushAll}
            onChange={setPushAll}
          />
          <NotifRow
            label="Marketing emails"
            description="Newsletters, drops, promotions"
            on={emailMarketing}
            onChange={setEmailMarketing}
          />
        </ul>
      </Section>

      <Section icon={<Star size={16} />} title="Linked accounts" subtitle="Optional integrations">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-sm font-bold text-slate-900">Apple Pay</div>
          <div className="text-xs text-slate-500">For one-tap checkout</div>
          <button className="mt-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            Connect
          </button>
        </div>
      </Section>

      <Section icon={<Building2 size={16} />} title="Danger zone" subtitle="Irreversible actions">
        <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-4">
          <div className="text-sm font-bold text-slate-900">Delete account</div>
          <div className="text-xs text-slate-600">
            Permanently remove your account and all data. Active orders and pending payouts must be settled first.
          </div>
          <button className="mt-2 rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">
            Request account deletion
          </button>
        </div>
      </Section>
    </div>
  );
}

const input =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

function Section({
  icon,
  title,
  subtitle,
  right,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {right && <div className="text-xs text-slate-400">{right}</div>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function NotifRow({
  label,
  description,
  on,
  onChange,
}: {
  label: string;
  description: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
      <button
        onClick={() => onChange(!on)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition ${on ? "bg-emerald-500" : "bg-slate-300"}`}
        aria-label={on ? "Turn off" : "Turn on"}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            on ? "left-[19px]" : "left-0.5"
          }`}
        >
          {on && <Check size={11} className="absolute left-1.5 top-1.5 text-emerald-600" />}
        </span>
      </button>
    </li>
  );
}
