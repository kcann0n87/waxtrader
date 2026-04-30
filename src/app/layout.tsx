import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { MobileNav } from "@/components/mobile-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://waxdepot.io";
const TITLE = "WaxDepot — The marketplace for serious collectors";
const DESCRIPTION =
  "Buy and sell sealed sports card boxes with the transparency of a stock market. Real bid/ask, real escrow, real provenance.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · WaxDepot",
  },
  description: DESCRIPTION,
  applicationName: "WaxDepot",
  keywords: [
    "sealed sports cards",
    "sealed wax",
    "sports card marketplace",
    "trading card boxes",
    "card auction",
    "P2P card marketplace",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "WaxDepot",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@waxdepot",
    site: "@waxdepot",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

// The header reads auth state from cookies, so every page is dynamic.
// Marking this explicitly skips Next's static-prerender attempts and
// silences the resulting DYNAMIC_SERVER_USAGE log noise during build.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#0a0a0b] pb-14 text-white md:pb-0">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <MobileNav />
      </body>
    </html>
  );
}
