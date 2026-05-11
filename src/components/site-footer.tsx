import Link from "next/link";
import { LogoMark } from "./logo-mark";

/**
 * Inline X (formerly Twitter) logo. lucide-react v1 dropped brand
 * icons over trademark licensing, so we ship the marks ourselves.
 * 24×24 viewBox; `currentColor` so it inherits the link color.
 */
function XLogo({ size = 14 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="X"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/**
 * Inline Instagram glyph (camera + circle aperture). Stroke-based
 * to match lucide's visual weight.
 */
function InstagramLogo({ size = 14 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Instagram"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-[#08080a]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-display text-base font-black tracking-tight text-white">
              Wax<span className="text-amber-400">Depot</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/60">
            The marketplace for serious collectors. Real bid/ask, real escrow, no eBay tax.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <a
              href="https://x.com/WaxDepotCards"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WaxDepotCards on X"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/70 transition hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300"
            >
              <XLogo size={13} />
            </a>
            <a
              href="https://instagram.com/WaxDepotCards"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WaxDepotCards on Instagram"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/70 transition hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300"
            >
              <InstagramLogo size={13} />
            </a>
          </div>
        </div>

        <FooterCol
          title="Marketplace"
          links={[
            { label: "Browse", href: "/" },
            { label: "Sell", href: "/sell" },
            { label: "Seller tiers", href: "/sell/tiers" },
            { label: "Search", href: "/search" },
            { label: "My account", href: "/account" },
          ]}
        />
        <FooterCol
          title="Sports"
          links={[
            { label: "Basketball", href: "/?sport=NBA" },
            { label: "Baseball", href: "/?sport=MLB" },
            { label: "Football", href: "/?sport=NFL" },
            { label: "Soccer", href: "/?sport=Soccer" },
            { label: "Pokemon TCG", href: "/?sport=Pokemon" },
          ]}
        />
        <FooterCol
          title="Help"
          links={[
            { label: "How it works", href: "/how-it-works" },
            { label: "FAQ", href: "/faq" },
            { label: "Buyer protection", href: "/help/buying/buyer-protection" },
            { label: "Feedback / requests", href: "/feedback" },
            { label: "Help center", href: "/help" },
            { label: "Contact support", href: "/help/contact" },
          ]}
        />
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-[11px] text-white/50">
          <span>© {new Date().getFullYear()} WaxDepot · waxdepot.io</span>
          <span className="flex flex-wrap items-center gap-3">
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/how-it-works" className="transition hover:text-white">
              How it works
            </Link>
            <Link href="/faq" className="transition hover:text-white">
              FAQ
            </Link>
            <Link
              href="/help/contact"
              className="transition hover:text-white"
            >
              Contact
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-white/50 uppercase">
        {title}
      </h4>
      <ul className="space-y-1.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-xs text-white/50 transition hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
