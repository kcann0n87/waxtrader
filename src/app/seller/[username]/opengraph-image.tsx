import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const alt = "WaxDepot seller";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const AVATAR_GRADIENTS: Record<string, [string, string]> = {
  emerald: ["#10b981", "#065f46"],
  sky: ["#0ea5e9", "#0c4a6e"],
  rose: ["#f43f5e", "#881337"],
  amber: ["#f59e0b", "#78350f"],
  violet: ["#8b5cf6", "#4c1d95"],
  cyan: ["#06b6d4", "#155e75"],
};

/**
 * Per-seller Open Graph image. When someone shares /seller/<username> on
 * Twitter, iMessage, etc., the unfurled card shows the seller's display
 * name, location, listing count, and review rating instead of the generic
 * site OG.
 */
export default async function OG({ params }: { params: { username: string } }) {
  const { username } = params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, username, bio, location, avatar_color, is_verified")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (!profile) {
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

  // Counts in parallel — listings + completed sales + reviews. All scoped
  // by seller_id (the profile's UUID, not the username).
  const [{ count: activeListings }, { count: salesCount }, { data: reviewRows }] =
    await Promise.all([
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", profile.id)
        .eq("status", "Active"),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", profile.id)
        .in("status", ["Delivered", "Released", "Completed"]),
      supabase
        .from("reviews")
        .select("stars, verdict")
        .eq("seller_id", profile.id)
        .limit(50),
    ]);

  // Compute aggregates safely.
  const totalSales = salesCount ?? 0;
  const listings = activeListings ?? 0;
  const reviews = reviewRows ?? [];
  const reviewCount = reviews.length;
  const positivePct =
    reviewCount > 0
      ? (reviews.filter((r) => r.verdict === "positive").length / reviewCount) * 100
      : null;

  const [from, to] = AVATAR_GRADIENTS[profile.avatar_color ?? "amber"] ??
    AVATAR_GRADIENTS.amber;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0a0a0b",
          fontFamily: "system-ui",
          color: "white",
          padding: 64,
          position: "relative",
        }}
      >
        {/* Cover gradient strip up top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 200,
            background: `linear-gradient(135deg, ${from}, ${to})`,
            opacity: 0.5,
          }}
        />

        {/* Brand mark top-right */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 36,
            right: 64,
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            zIndex: 2,
          }}
        >
          <span style={{ color: "#ffffff" }}>Wax</span>
          <span style={{ color: "#fbbf24" }}>Depot</span>
        </div>

        {/* Avatar */}
        <div
          style={{
            display: "flex",
            width: 140,
            height: 140,
            borderRadius: 999,
            background: `linear-gradient(135deg, ${from}, ${to})`,
            color: "white",
            fontSize: 56,
            fontWeight: 900,
            alignItems: "center",
            justifyContent: "center",
            border: "4px solid #0a0a0b",
            marginTop: 90,
            zIndex: 1,
          }}
        >
          {profile.display_name.slice(0, 1).toUpperCase()}
        </div>

        {/* Name + verified pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 28,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            {profile.display_name}
          </div>
          {profile.is_verified && (
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#34d399",
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.4)",
                padding: "6px 14px",
                borderRadius: 999,
              }}
            >
              ✓ Verified
            </div>
          )}
        </div>

        {/* @username + location */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 8,
            color: "rgba(255,255,255,0.55)",
            fontSize: 22,
          }}
        >
          <span style={{ fontFamily: "monospace" }}>@{profile.username}</span>
          {profile.location && <span>· {profile.location}</span>}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 56,
            marginTop: 48,
          }}
        >
          <Stat label="Active listings" value={listings.toLocaleString()} />
          <Stat label="Total sales" value={totalSales.toLocaleString()} />
          {positivePct !== null && (
            <Stat label="Positive feedback" value={`${positivePct.toFixed(0)}%`} />
          )}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 64,
            bottom: 48,
            color: "rgba(255,255,255,0.5)",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          Sealed sports wax · waxdepot.io
        </div>
      </div>
    ),
    size,
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 900,
          color: "#fbbf24",
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}
