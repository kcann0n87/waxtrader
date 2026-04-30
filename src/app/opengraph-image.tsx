import { ImageResponse } from "next/og";

export const alt = "WaxDepot — The marketplace for serious collectors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0a0a0b 0%, #14110d 50%, #0a0a0b 100%)",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Atmospheric gold glow top */}
        <div
          style={{
            position: "absolute",
            top: -300,
            left: 200,
            width: 800,
            height: 800,
            background:
              "radial-gradient(circle, rgba(212,175,55,0.35) 0%, rgba(212,175,55,0.05) 40%, transparent 70%)",
            display: "flex",
          }}
        />
        {/* Gold glow bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -100,
            width: 600,
            height: 600,
            background:
              "radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            border: "1px solid rgba(180, 130, 30, 0.4)",
            background: "rgba(212, 175, 55, 0.08)",
            borderRadius: 999,
            color: "#fcd34d",
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#fbbf24",
              display: "flex",
            }}
          />
          Coming soon
        </div>

        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
              borderRadius: 24,
              fontSize: 76,
              fontWeight: 900,
              color: "#0f172a",
              boxShadow: "0 30px 60px rgba(212, 175, 55, 0.4)",
            }}
          >
            W
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 900,
              color: "white",
              letterSpacing: -2,
            }}
          >
            <span>Wax</span>
            <span style={{ color: "#fbbf24" }}>Depot</span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            fontSize: 52,
            color: "white",
            textAlign: "center",
            maxWidth: 980,
            lineHeight: 1.15,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          The marketplace for&nbsp;
          <span style={{ color: "#fbbf24", fontStyle: "italic" }}>
            serious collectors
          </span>
        </div>

        {/* Sub-tagline */}
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 26,
            color: "rgba(255, 255, 255, 0.55)",
            fontWeight: 400,
            letterSpacing: 0.5,
          }}
        >
          Sealed sports card boxes · real bid/ask · real escrow
        </div>

        {/* Footer mark */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 36,
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.3)",
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          waxdepot.io
        </div>
      </div>
    ),
    size,
  );
}
