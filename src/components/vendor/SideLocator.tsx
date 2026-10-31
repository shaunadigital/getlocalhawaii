import Image from "next/image";

import sidesData from "@/data/oahu-sides.json";
import { SIDE_NAMES, type Side } from "@/lib/directory/labels";

/** oahu-sides.json uses short ids; the database uses these. */
const SIDE_TO_JSON: Record<Side, string> = {
  north_shore: "north",
  windward: "windward",
  central: "central",
  leeward_ewa: "leeward",
  town: "town",
  east: "east",
};

/**
 * The small island map with the vendor's side lit, on a cream board. Not a
 * filter: nothing on it is a link. Render only when the listing has a side.
 */
export function SideLocator({ side, place }: { side: Side; place: string | null }) {
  const shape = sidesData.sides.find((s) => s.id === SIDE_TO_JSON[side]);
  if (!shape) return null;
  const name = SIDE_NAMES[side];
  const clipId = `locator-${side}`;
  const label = [name, place].filter(Boolean).join(" · ").toUpperCase();

  return (
    <div className="relative border-2 border-gl-ink bg-gl-cream p-2 shadow-gl-board">
      <div className="relative aspect-[1448/1086] w-full overflow-hidden">
        <Image
          src="/art/oahu-map-plum.webp"
          alt={`Map of Oʻahu with the ${name} side marked`}
          fill
          sizes="(min-width: 768px) 400px, 100vw"
          className="block"
        />
        <svg viewBox={sidesData.viewBox} className="absolute inset-0 size-full" aria-hidden="true">
          <defs>
            <clipPath id={clipId}>
              <path d={sidesData.island} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <polygon
              points={shape.points.map(([x, y]) => `${x},${y}`).join(" ")}
              fill="rgba(251,247,240,0.5)"
              stroke="#221A26"
              strokeWidth={7}
              strokeDasharray="16 12"
              strokeLinejoin="round"
            />
          </g>
        </svg>
        <span
          className="absolute -rotate-2 bg-gl-ink px-2 py-[5px] font-display text-[11px] whitespace-nowrap text-gl-cream shadow-gl-tab"
          style={{ left: shape.labelX, top: shape.labelY, transform: "translate(-50%, -50%) rotate(-2deg)" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
