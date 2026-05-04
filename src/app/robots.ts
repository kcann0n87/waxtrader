import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://waxdepot.io";
const BETA_MODE = process.env.NEXT_PUBLIC_BETA_MODE !== "false";

/**
 * robots.txt — adapts to beta mode.
 *
 * Beta mode (default): /coming-soon is the only page crawlers reach without
 * an invited session — every other URL middleware-redirects there. Allow
 * just /coming-soon so search results show the gate page (where someone
 * googling "WaxDepot" can join the waitlist) and disallow everything else
 * to avoid redirect loops in the crawl graph.
 *
 * Public mode: standard allow-/, deny-private-routes config.
 */
export default function robots(): MetadataRoute.Robots {
  if (BETA_MODE) {
    return {
      rules: [
        {
          userAgent: "*",
          allow: ["/coming-soon"],
          disallow: ["/"],
        },
      ],
      sitemap: `${BASE}/sitemap.xml`,
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/account",
          "/account/",
          "/admin",
          "/admin/",
          "/api/",
          "/auth/",
          "/cart",
          "/login",
          "/signup",
          "/forgot",
          "/reset",
          "/welcome",
          "/coming-soon",
          "/design/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
