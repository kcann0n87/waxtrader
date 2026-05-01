import { Sku } from "@/lib/data";

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

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${sku.gradient[0]}, ${sku.gradient[1]})`,
      }}
    >
      {sku.imageUrl ? (
        // object-contain (not cover) so the whole product is visible — box
        // images come from a few sources at different aspect ratios, and
        // cover ends up cropping heads/box-tops on portrait or wide shots.
        // The gradient background fills any letterbox space so empty pixels
        // look intentional rather than broken.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sku.imageUrl}
          alt={`${sku.brand} ${sku.set} ${sku.product}`}
          className="absolute inset-0 h-full w-full object-contain p-2"
          loading="lazy"
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
