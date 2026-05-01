import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://waxdepot.io";

/**
 * robots.txt — allow public crawlers, block private/auth routes, point at
 * the auto-generated sitemap.
 */
export default function robots(): MetadataRoute.Robots {
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
