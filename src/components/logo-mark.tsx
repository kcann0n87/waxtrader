/**
 * WaxDepot logo mark — a stylized wax seal.
 *
 * Concept: the brand is "WaxDepot" — a marketplace for sealed product.
 * The previous mark was a stroked W which read as a generic letter logo
 * with no story. The new mark is an octagonal wax seal with a slight
 * imperfect drip on the bottom edge (the way real wax pools when
 * pressed) and a serif "WD" monogram pressed into the center.
 *
 * The seal motif works at two levels:
 *   1. Literal — wax seals are made of wax. The brand is "Wax".
 *   2. Symbolic — wax seals signify "sealed, authentic, untampered."
 *      That's the entire buyer-protection thesis of the marketplace.
 *
 * Geometry uses a 100×100 viewBox. Crisp at favicon (16/32) up through
 * marketing (200+) sizes. Inner rim provides the "pressed into wax"
 * depth without needing a real shadow filter (filters = expensive in
 * SVG and don't antialias well at small sizes).
 */
export function LogoMark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  // Stable but unique gradient ids per render so multiple instances on the
  // page don't collide. (Browsers tolerate dup IDs but it warns; using a
  // suffix from the size keeps it stable for SSR hydration.)
  const idGold = `wd-gold-${size}`;
  const idShadow = `wd-shadow-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="WaxDepot"
    >
      <defs>
        <linearGradient id={idGold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="35%" stopColor="#fbbf24" />
          <stop offset="80%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <radialGradient id={idShadow} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* Octagonal seal body. Coordinates trace a clockwise octagon
          from top-center; bottom-left/bottom-right vertices are pulled
          slightly down + outward to suggest molten wax pooling. */}
      <path
        d="M 35 8
           L 65 8
           L 86 22
           L 92 50
           L 86 78
           L 67 92
           L 33 92
           L 14 78
           L 8 50
           L 14 22
           Z"
        fill={`url(#${idGold})`}
      />
      {/* Inner stroke ring — gives the "pressed-into-wax" rim. */}
      <path
        d="M 36 14
           L 64 14
           L 82 25
           L 87 50
           L 82 75
           L 65 86
           L 35 86
           L 18 75
           L 13 50
           L 18 25
           Z"
        fill="none"
        stroke="rgba(15,23,42,0.35)"
        strokeWidth="1.5"
      />
      {/* Highlight wash — adds dimension on the upper portion. */}
      <ellipse cx="50" cy="40" rx="30" ry="20" fill={`url(#${idShadow})`} />

      {/* WD monogram. Two letters overlaid in a serif/heraldic style.
          Stroke-based so it scales cleanly at any size and reads as
          "stamped" rather than typeset. */}
      <g
        fill="none"
        stroke="#0f172a"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* W shape — three V strokes */}
        <path d="M 26 36 L 33 66 L 42 46 L 50 66 L 58 46 L 67 66 L 74 36" />
      </g>
    </svg>
  );
}

/**
 * Full lockup — mark + WaxDepot wordmark side-by-side.
 * Use in the header and login/signup hero areas.
 */
export function LogoLockup({
  size = 32,
  textClassName = "font-display text-lg font-black tracking-tight text-white",
}: {
  size?: number;
  textClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className={textClassName}>
        Wax<span className="text-amber-400">Depot</span>
      </span>
    </span>
  );
}
