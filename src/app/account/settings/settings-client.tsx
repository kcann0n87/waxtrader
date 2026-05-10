"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Building2,
  Check,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Plus,
  Star,
  Trash2,
  User,
} from "lucide-react";
import { updateProfile } from "../../auth/actions";
import {
  deleteAccount,
  updateNotificationPrefs,
  updatePassword,
} from "../../actions/account";
import {
  addAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../actions/addresses";
import {
  createCardSetupSession,
  deleteSavedCard,
  setDefaultSavedCard,
} from "../../actions/payment-methods";

type NotifPrefs = {
  order_emails: boolean;
  bid_emails: boolean;
  message_emails: boolean;
  digest_emails: boolean;
  marketing_emails: boolean;
};

type CardOnFile = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};
type Address = {
  id: string;
  name: string;
  addr1: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
};

export function SettingsClient({
  initialDisplayName,
  initialUsername,
  email,
  initialAddresses,
  initialCards,
  initialPrefs,
}: {
  initialDisplayName: string;
  initialUsername: string;
  email: string;
  initialAddresses: Address[];
  initialCards: CardOnFile[];
  initialPrefs: NotifPrefs;
}) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [prefs, setPrefs] = useState<NotifPrefs>(initialPrefs);

  // Persist on every toggle, optimistically. Failures revert + surface a
  // small error line. No "Save" button — toggle = save.
  const persistPref = (key: keyof NotifPrefs, value: boolean) => {
    const previous = prefs[key];
    setPrefs((p) => ({ ...p, [key]: value }));
    startTransition(async () => {
      const res = await updateNotificationPrefs({ [key]: value });
      if (res.error) {
        setPrefs((p) => ({ ...p, [key]: previous }));
        setProfileMsg({ kind: "err", text: `Couldn't save: ${res.error}` });
      }
    });
  };

  const [profileMsg, setProfileMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  // Password-set / change flow state. Two fields: current (optional —
  // empty means "I signed in via magic link, never had one") and new.
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pwdPending, startPwd] = useTransition();

  // Delete-account flow state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-white/50">
        <Link href="/account" className="inline-flex items-center gap-1 hover:text-white">
          <ArrowLeft size={14} /> Account
        </Link>
        <span>/</span>
        <span className="text-white">Settings</span>
      </div>
      <h1 className="font-display text-2xl font-black tracking-tight text-white">Settings</h1>

      <Section icon={<User size={16} />} title="Profile" subtitle="Your basic info">
        <form
          action={(formData) => {
            setProfileMsg(null);
            startTransition(async () => {
              const result = await updateProfile(formData);
              if (result?.error) setProfileMsg({ kind: "err", text: result.error });
              else if (result?.ok) setProfileMsg({ kind: "ok", text: "Saved." });
            });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Display name">
              <input
                name="displayName"
                defaultValue={initialDisplayName}
                required
                className={input}
              />
            </Field>
            <Field label="Username">
              <input
                name="username"
                defaultValue={initialUsername}
                required
                pattern="^[a-z0-9_]{3,32}$"
                title="3-32 chars, lowercase letters, numbers, underscore"
                className={input}
              />
            </Field>
          </div>
          <Field label="Email">
            <input
              defaultValue={email}
              disabled
              className={`${input} cursor-not-allowed opacity-60`}
              type="email"
            />
            <p className="mt-1 text-[11px] text-white/60">
              To change your email, contact support.
            </p>
          </Field>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-sm font-bold text-slate-900 shadow-md shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? <Loader2 size={14} className="animate-spin" /> : null}
              Save profile
            </button>
            {profileMsg && (
              <span
                className={`text-xs font-semibold ${
                  profileMsg.kind === "ok" ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {profileMsg.text}
              </span>
            )}
          </div>
        </form>
      </Section>

      <Section
        icon={<Lock size={16} />}
        title="Sign-in & security"
        subtitle="Set or change your password"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPwdMsg(null);
            if (newPwd.length < 8) {
              setPwdMsg({
                kind: "err",
                text: "New password must be at least 8 characters.",
              });
              return;
            }
            if (newPwd !== confirmPwd) {
              setPwdMsg({ kind: "err", text: "New passwords don't match." });
              return;
            }
            startPwd(async () => {
              const res = await updatePassword({
                newPassword: newPwd,
                currentPassword: currentPwd || undefined,
              });
              if (res.error) {
                setPwdMsg({ kind: "err", text: res.error });
                return;
              }
              setPwdMsg({
                kind: "ok",
                text: "Password saved. You can now sign in with email + password.",
              });
              setCurrentPwd("");
              setNewPwd("");
              setConfirmPwd("");
            });
          }}
          className="space-y-3"
        >
          <p className="text-xs text-white/60">
            If you signed in with a magic link and haven&apos;t set a password
            yet, leave the current-password field blank.
          </p>
          <Field label="Current password (leave blank if unset)">
            <input
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className={input}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="New password">
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
                className={input}
              />
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Type it again"
                autoComplete="new-password"
                minLength={8}
                required
                className={input}
              />
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pwdPending || !newPwd || !confirmPwd}
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-sm font-bold text-slate-900 shadow-md shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pwdPending ? <Loader2 size={14} className="animate-spin" /> : null}
              Save password
            </button>
            {pwdMsg && (
              <span
                className={`text-xs font-semibold ${
                  pwdMsg.kind === "ok" ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {pwdMsg.text}
              </span>
            )}
          </div>
        </form>
      </Section>

      <Section icon={<MapPin size={16} />} title="Addresses" subtitle="Where you ship to">
        <AddressManager initialAddresses={addresses} onChange={setAddresses} />
      </Section>

      <Section
        icon={<CreditCard size={16} />}
        title="Payment methods"
        subtitle="Cards on file"
        right={<Lock size={11} className="text-white/60" />}
      >
        <CardManager initialCards={initialCards} />
      </Section>

      <Section icon={<Bell size={16} />} title="Email notifications" subtitle="What we send to your inbox. In-app bell stays on regardless.">
        <ul className="divide-y divide-white/5 rounded-lg border border-white/10">
          <NotifRow
            label="Order updates"
            description="Payment received, shipped, funds released, canceled, dispute opened. Lifecycle-critical — opt out and you may miss the 2-day auto-release window."
            on={prefs.order_emails}
            onChange={(v) => persistPref("order_emails", v)}
          />
          <NotifRow
            label="Bid alerts"
            description="Bid placed confirmation, accepted, declined."
            on={prefs.bid_emails}
            onChange={(v) => persistPref("bid_emails", v)}
          />
          <NotifRow
            label="Saved-search & watchlist digests"
            description="Daily roundup of new matches and price drops on items you're watching."
            on={prefs.digest_emails}
            onChange={(v) => persistPref("digest_emails", v)}
          />
          <NotifRow
            label="Direct messages"
            description="New messages from buyers, sellers, and support. (In-app today; email coming soon.)"
            on={prefs.message_emails}
            onChange={(v) => persistPref("message_emails", v)}
          />
          <NotifRow
            label="Marketing"
            description="Newsletters, drop announcements, promotions. Off by default."
            on={prefs.marketing_emails}
            onChange={(v) => persistPref("marketing_emails", v)}
          />
        </ul>
      </Section>

      <Section icon={<Star size={16} />} title="Linked accounts" subtitle="Optional integrations">
        <div className="rounded-lg border border-white/10 bg-[#101012] p-4">
          <div className="text-sm font-bold text-white">Apple Pay</div>
          <div className="text-xs text-white/50">For one-tap checkout</div>
          <button className="mt-2 rounded-md border border-white/15 bg-[#101012] px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/[0.02]">
            Connect
          </button>
        </div>
      </Section>

      <Section icon={<Building2 size={16} />} title="Danger zone" subtitle="Irreversible actions">
        <div className="rounded-lg border border-rose-700/40 bg-rose-500/10 p-4">
          <div className="text-sm font-bold text-white">Delete account</div>
          <div className="text-xs text-white/60">
            Permanently removes your profile and personal data. Active orders,
            listings, and bids must be settled first. Financial records (released
            sales, payouts) are retained for 7 years per the{" "}
            <Link href="/privacy" className="text-amber-300 hover:underline">
              Privacy Policy
            </Link>
            .
          </div>

          {!deleteOpen && (
            <button
              type="button"
              onClick={() => {
                setDeleteOpen(true);
                setDeleteErr(null);
              }}
              className="mt-2 rounded-md border border-rose-700/50 bg-[#101012] px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/10"
            >
              Delete account…
            </button>
          )}

          {deleteOpen && (
            <div className="mt-4 space-y-3 rounded-md border border-rose-700/40 bg-[#101012] p-4">
              <p className="text-xs text-white/80">
                Type your username{" "}
                <code className="rounded bg-rose-500/15 px-1 py-0.5 font-mono text-rose-200">
                  {initialUsername}
                </code>{" "}
                to confirm. This cannot be undone.
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="username"
                autoComplete="off"
                className="w-full rounded-md border border-rose-700/40 bg-rose-500/5 px-3 py-2 text-sm font-mono text-rose-100 placeholder:text-white/30 focus:border-rose-500 focus:outline-none"
              />
              {deleteErr && (
                <div className="rounded-md border border-rose-700/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                  {deleteErr}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={deletePending || deleteConfirm.trim() === ""}
                  onClick={() => {
                    setDeleteErr(null);
                    startDelete(async () => {
                      const res = await deleteAccount(deleteConfirm);
                      if (res?.error) setDeleteErr(res.error);
                      // success path: server action redirected; no-op here
                    });
                  }}
                  className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletePending ? "Deleting…" : "Permanently delete my account"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteOpen(false);
                    setDeleteConfirm("");
                    setDeleteErr(null);
                  }}
                  disabled={deletePending}
                  className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

const input =
  "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-amber-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/20";

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
    <section className="mt-6 rounded-xl border border-white/10 bg-[#101012] p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300">
            {icon}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{title}</h2>
            <p className="text-xs text-white/50">{subtitle}</p>
          </div>
        </div>
        {right && <div className="text-xs text-white/60">{right}</div>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/80">{label}</span>
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
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs text-white/50">{description}</div>
      </div>
      <button
        onClick={() => onChange(!on)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition ${on ? "bg-amber-500" : "bg-white/10"}`}
        aria-label={on ? "Turn off" : "Turn on"}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            on ? "left-[19px]" : "left-0.5"
          }`}
        >
          {on && <Check size={11} className="absolute top-1.5 left-1.5 text-amber-500" />}
        </span>
      </button>
    </li>
  );
}

/**
 * Address list + add-form. Backed by the user_addresses table via
 * server actions in src/app/actions/addresses.ts. RLS scopes every
 * row to the owning user, so we don't need service-role.
 *
 * UX: list at the top, "Add address" button toggles an inline form
 * below. After successful add, the form clears + collapses, and the
 * router refresh repulls the list.
 */
function AddressManager({
  initialAddresses,
  onChange,
}: {
  initialAddresses: Address[];
  onChange: (xs: Address[]) => void;
}) {
  const router = useRouter();
  const [list, setList] = useState<Address[]>(initialAddresses);
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    addr1: "",
    city: "",
    state: "",
    zip: "",
  });

  // Keep the parent SettingsClient state in sync if it cares.
  useEffect(() => {
    onChange(list);
  }, [list, onChange]);

  // If the server-rendered initialAddresses list updates (after a
  // server action + router.refresh), pull it back in.
  useEffect(() => {
    setList(initialAddresses);
  }, [initialAddresses]);

  const submit = () => {
    setErr(null);
    start(async () => {
      const res = await addAddress(form);
      if (res.error) {
        setErr(res.error);
        return;
      }
      setForm({ name: "", addr1: "", city: "", state: "", zip: "" });
      setAdding(false);
      router.refresh();
    });
  };

  const remove = (id: string) => {
    start(async () => {
      const res = await deleteAddress(id);
      if (res.error) {
        setErr(res.error);
        return;
      }
      setList((arr) => arr.filter((x) => x.id !== id));
      router.refresh();
    });
  };

  const setDefault = (id: string) => {
    start(async () => {
      const res = await setDefaultAddress(id);
      if (res.error) {
        setErr(res.error);
        return;
      }
      setList((arr) => arr.map((x) => ({ ...x, isDefault: x.id === id })));
      router.refresh();
    });
  };

  return (
    <>
      {list.length > 0 ? (
        <ul className="divide-y divide-white/5 rounded-lg border border-white/10">
          {list.map((a) => (
            <li key={a.id} className="flex items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  {a.name}
                  {a.isDefault && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      DEFAULT
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/50">
                  {a.addr1}, {a.city}, {a.state} {a.zip}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!a.isDefault && (
                  <button
                    onClick={() => setDefault(a.id)}
                    disabled={pending}
                    className="rounded-md px-2 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/10 disabled:opacity-50"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => remove(a.id)}
                  disabled={pending}
                  className="rounded-md p-1.5 text-white/60 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
                  aria-label="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-md border border-dashed border-white/10 bg-white/[0.02] px-3 py-4 text-center text-xs text-white/50">
          No saved addresses yet. Add one below for one-click checkout.
        </div>
      )}

      {err && (
        <div className="mt-3 rounded-md border border-rose-700/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {err}
        </div>
      )}

      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-dashed border-white/15 px-3 py-2 text-sm font-semibold text-white/80 hover:border-white/30 hover:bg-white/[0.02]"
        >
          <Plus size={14} />
          Add address
        </button>
      ) : (
        <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="text-xs font-semibold text-white">Add a new address</div>
          <Field label="Label">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Home, Work, Mom's house..."
              className="w-full rounded-md border border-white/10 bg-[#101012] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-amber-400/50 focus:outline-none"
            />
          </Field>
          <Field label="Street address">
            <input
              type="text"
              value={form.addr1}
              onChange={(e) => setForm((f) => ({ ...f, addr1: e.target.value }))}
              placeholder="123 Main St, Apt 4B"
              className="w-full rounded-md border border-white/10 bg-[#101012] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-amber-400/50 focus:outline-none"
            />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="City">
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="Austin"
                className="w-full rounded-md border border-white/10 bg-[#101012] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-amber-400/50 focus:outline-none"
              />
            </Field>
            <Field label="State">
              <input
                type="text"
                value={form.state}
                onChange={(e) =>
                  setForm((f) => ({ ...f, state: e.target.value.toUpperCase() }))
                }
                placeholder="TX"
                maxLength={2}
                className="w-full rounded-md border border-white/10 bg-[#101012] px-3 py-2 text-sm text-white uppercase placeholder:text-white/30 focus:border-amber-400/50 focus:outline-none"
              />
            </Field>
            <Field label="Zip">
              <input
                type="text"
                value={form.zip}
                onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
                placeholder="78701"
                className="w-full rounded-md border border-white/10 bg-[#101012] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-amber-400/50 focus:outline-none"
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setErr(null);
              }}
              disabled={pending}
              className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="rounded-md bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-amber-300 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save address"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Saved cards list + Add Card button. Cards live on the user's
 * Stripe Customer object — we never store card data, just retrieve
 * brand/last4/exp from Stripe at render time.
 *
 * Add flow: click Add Card → server creates a Stripe Checkout
 * session in mode='setup' → redirect to Stripe → user enters card →
 * Stripe attaches it to the Customer + redirects back here.
 */
function CardManager({ initialCards }: { initialCards: CardOnFile[] }) {
  const router = useRouter();
  const [cards, setCards] = useState<CardOnFile[]>(initialCards);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  const addCard = () => {
    setErr(null);
    start(async () => {
      const res = await createCardSetupSession();
      if (res.error) {
        setErr(res.error);
        return;
      }
      if (res.url) window.location.href = res.url;
    });
  };

  const remove = (id: string) => {
    setErr(null);
    start(async () => {
      const res = await deleteSavedCard(id);
      if (res.error) {
        setErr(res.error);
        return;
      }
      setCards((arr) => arr.filter((c) => c.id !== id));
      router.refresh();
    });
  };

  const setDefault = (id: string) => {
    setErr(null);
    start(async () => {
      const res = await setDefaultSavedCard(id);
      if (res.error) {
        setErr(res.error);
        return;
      }
      setCards((arr) => arr.map((c) => ({ ...c, isDefault: c.id === id })));
      router.refresh();
    });
  };

  const fmtExp = (m: number, y: number) =>
    `${String(m).padStart(2, '0')}/${String(y).slice(-2)}`;

  return (
    <>
      {cards.length > 0 ? (
        <ul className="divide-y divide-white/5 rounded-lg border border-white/10">
          {cards.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-slate-900 text-[10px] font-bold uppercase text-white">
                {c.brand.slice(0, 4)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  {c.brand.charAt(0).toUpperCase() + c.brand.slice(1)} •••{c.last4}
                  {c.isDefault && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      DEFAULT
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/50">Expires {fmtExp(c.expMonth, c.expYear)}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!c.isDefault && (
                  <button
                    onClick={() => setDefault(c.id)}
                    disabled={pending}
                    className="rounded-md px-2 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/10 disabled:opacity-50"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => remove(c.id)}
                  disabled={pending}
                  className="rounded-md p-1.5 text-white/60 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
                  aria-label="Remove card"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-md border border-dashed border-white/10 bg-white/[0.02] px-3 py-4 text-center text-xs text-white/50">
          No saved cards. Add one for one-click checkout — Stripe handles all
          card storage; WaxDepot never sees full card numbers.
        </div>
      )}

      {err && (
        <div className="mt-3 rounded-md border border-rose-700/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {err}
        </div>
      )}

      <button
        type="button"
        onClick={addCard}
        disabled={pending}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-dashed border-white/15 px-3 py-2 text-sm font-semibold text-white/80 hover:border-white/30 hover:bg-white/[0.02] disabled:opacity-50"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        {pending ? 'Opening Stripe…' : 'Add a card'}
      </button>
    </>
  );
}

