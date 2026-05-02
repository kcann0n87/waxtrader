import { ImageResponse } from "next/og";
import { getLowestAsk, getSkuBySlug } from "@/lib/db";
import { formatSkuTitle, formatUSDFull } from "@/lib/utils";

// Edge runtime so the OG image generation doesn't cold-start a Node lambda
// for every social-share crawler hit.
export const runtime = "edge";
export const alt = "WaxDepot product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://waxdepot.io";

/**
 * Per-product Open Graph image. When someone shares a /product/<slug> link
 * on Twitter, iMessage, Slack, etc., the unfurled card pulls THIS image
 * instead of the generic site OG. Shows the box photo on the left, the
 * title + price + sport pill on the right, on the WaxDepot dark gradient.
 *
 * Renders at the standard 1200×630 OG card size. The Edge runtime keeps
 * crawler latency low — the social-network bot fetches this URL once per
 * share, so cold starts would punish the unfurl experience.
 */
export default async function OG({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const sku = await getSkuBySlug(slug);

  // Sku not found — render a fallback card so the share doesn't break.
  if (!sku) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "#0a0a0b",
            color: "white",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 900,
          }}
        >
          WaxDepot
        </div>
      ),
      size,
    );
  }

  const ask = await getLowestAsk(sku.id);
  const askLine = ask !== null ? `Lowest ask · ${formatUSDFull(ask)}` : "List the first";

  // The box image. Local `/products/<slug>.jpg` paths need to be made
  // absolute for the OG renderer (which runs at the edge and doesn't have
  // a relative-URL base). Skip if missing — we'll show the gradient.
  const boxUrl = sku.imageUrl
    ? sku.imageUrl.startsWith("http")
      ? sku.imageUrl
      : `${BASE}${sku.imageUrl}`
    : null;

  const [from, to] = sku.gradient;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, ${from}, ${to})`,
          fontFamily: "system-ui",
        }}
      >
        {/* Dark gradient overlay for legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(10,10,11,0.55), rgba(10,10,11,0.92))",
          }}
        />

        {/* Box photo on the left */}
        <div
          style={{
            display: "flex",
            width: 480,
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            padding: 48,
            position: "relative",
          }}
        >
          {boxUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={boxUrl}
              alt={formatSkuTitle(sku)}
              width={384}
              height={480}
              style={{
                objectFit: "contain",
                maxHeight: "100%",
                maxWidth: "100%",
                filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.5))",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: 320,
                height: 400,
                background: `linear-gradient(135deg, ${from}, ${to})`,
                borderRadius: 12,
                color: "white",
                fontSize: 28,
                fontWeight: 900,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {sku.brand}
            </div>
          )}
        </div>

        {/* Text column */}
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px 64px 64px 24px",
            color: "white",
            position: "relative",
          }}
        >
          {/* Brand mark */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              marginBottom: 24,
            }}
          >
            <span style={{ color: "#ffffff" }}>Wax</span>
            <span style={{ color: "#fbbf24" }}>Depot</span>
          </div>

          {/* Sport + year pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#fcd34d",
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.4)",
              padding: "6px 14px",
              borderRadius: 999,
              alignSelf: "flex-start",
              marginBottom: 24,
            }}
          >
            {sku.sport} · {sku.year}
            {sku.product ? ` · ${sku.product}` : ""}
          </div>

          {/* Product title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              marginBottom: 32,
              maxWidth: 600,
            }}
          >
            {formatSkuTitle(sku)}
          </div>

          {/* Price + tagline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {ask !== null ? "Lowest ask" : "Open the order book"}
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#fbbf24",
              }}
            >
              {ask !== null ? formatUSDFull(ask) : "List a box"}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
