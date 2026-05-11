import Image from "next/image";
import { Sku } from "@/lib/data";

// Sizes attribute per `size` prop — tells next/image which width to
// fetch at each viewport. Important for keeping the AVIF/WebP variants
// from being too large.
const SIZES_FOR = {
  sm: "48px",
  md: "(max-width: 640px) 30vw, 200px",
  lg: "(max-width: 768px) 80vw, 320px",
  card: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
} as const;

export function ProductImage({
  sku,
  size = "md",
  showText = true,
  className = "",
  children,
}: {
  sku: Sku;
  size?: "sm" | "md" | "lg" | "card";
  showText?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const textSizes = {
    sm: { brand: "text-[7px]", set: "text-xs", year: "text-[8px]" },
    md: { brand: "text-[10px]", set: "text-base", year: "text-[10px]" },
    lg: { brand: "text-xs", set: "text-3xl", year: "text-sm" },
    card: { brand: "text-xs", set: "text-2xl", year: "text-xs" },
  }[size];

  // Uniform dark surface when we have a real product photo — keeps the
  // grid from looking like a chaotic rainbow when a row of studio shots
  // (white backgrounds) sits over per-SKU gradients. Gradient stays as
  // the visual identity for SKUs without imagery (text fallback below).
  const surfaceStyle: React.CSSProperties | undefined = sku.imageUrl
    ? undefined
    : {
        background: `linear-gradient(135deg, ${sku.gradient[0]}, ${sku.gradient[1]})`,
      };
  const surfaceClass = sku.imageUrl ? "bg-[#0f0f12]" : "";

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${surfaceClass} ${className}`}
      style={surfaceStyle}
    >
      {sku.imageUrl ? (
        // next/image gives us AVIF/WebP serving + responsive sizing.
        //
        // size="lg" (product detail page) → object-cover, no padding.
        // Many source images bake in a colored/gradient background
        // around the box and contain leaves a lot of dead space. Cover
        // zooms in so the box itself fills the frame; the source's
        // colored bleed crops along the edges.
        //
        // Smaller sizes (cards, thumbs) keep object-contain so the
        // whole box stays visible in grid layouts — losing a corner of
        // a thumbnail reads as a bug.
        <Image
          src={sku.imageUrl}
          alt={`${sku.brand} ${sku.set} ${sku.product}`}
          fill
          sizes={SIZES_FOR[size]}
          className={
            size === "lg" ? "object-cover" : "object-contain p-2"
          }
          priority={size === "lg"}
        />
      ) : showText ? (
        <div className="px-3 text-center text-white drop-shadow-md">
          <div className={`font-medium tracking-widest opacity-90 uppercase ${textSizes.brand}`}>
            {sku.brand}
          </div>
          <div className={`mt-1 leading-tight font-black ${textSizes.set}`}>{sku.set}</div>
          <div className={`mt-1 font-semibold opacity-90 ${textSizes.year}`}>{sku.year}</div>
        </div>
      ) : (
        <div className="text-[7px] font-bold text-white">
          {sku.brand.slice(0, 4).toUpperCase()}
        </div>
      )}
      {children}
    </div>
  );
}
