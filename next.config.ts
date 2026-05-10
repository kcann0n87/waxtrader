import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next/image — optimize the box thumbnails. Most images are local under
  // /public/products/, but admins can paste external URLs in /admin/catalog,
  // so we whitelist the hosts that have shipped an image into the DB so
  // far (StockX direct CDN + a handful of seller-friendly retailers).
  // Anything else falls back to unoptimized rendering via the
  // `unoptimized` prop on a per-image basis.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.stockx.com" },
      { protocol: "https", hostname: "cdn11.bigcommerce.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "slabstat-production.s3.amazonaws.com" },
      { protocol: "https", hostname: "*.amazonaws.com" },
      // Common image-host fallbacks for admins pasting third-party
      // URLs into the SkuForm image_url field instead of uploading.
      { protocol: "https", hostname: "i.ebayimg.com" },
      { protocol: "https", hostname: "img.beckett.com" },
      { protocol: "https", hostname: "xcdn.checklistinsider.com" },
      { protocol: "https", hostname: "dacardworld1.imgix.net" },
      // Admin uploads from /admin/catalog land in the Supabase Storage
      // `product-images` bucket; the public URL is on the project's
      // supabase.co subdomain. Wildcard so we don't have to bake the
      // project ref into next.config.
      { protocol: "https", hostname: "*.supabase.co" },
      // TCGplayer product images — Pokemon catalog uses these heavily
      // since TCGplayer's CDN is the cleanest source for sealed-product
      // photos. Without these hosts whitelisted, every Pokemon card on
      // the homepage falls back to unoptimized rendering (no AVIF/WebP).
      { protocol: "https", hostname: "product-images.tcgplayer.com" },
      { protocol: "https", hostname: "tcgplayer-cdn.tcgplayer.com" },
      // Pokemon TCG API images (set logos / symbols, used as fallback)
      { protocol: "https", hostname: "images.pokemontcg.io" },
      // Walmart product images — admins occasionally paste these for
      // sports-card products that lack a Topps/Panini direct URL.
      { protocol: "https", hostname: "i5.walmartimages.com" },
    ],
  },
};

export default nextConfig;
