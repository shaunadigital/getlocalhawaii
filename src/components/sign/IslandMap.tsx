"use client";

import Image from "next/image";
import Link from "next/link";
import { useId } from "react";

import sidesData from "@/data/oahu-sides.json";
import { cn } from "@/lib/cn";
import { SIDE_NAMES, SIDE_ORDER, type Side, sideParam } from "@/lib/directory/labels";

/** oahu-sides.json uses short ids; the database uses these. */
const JSON_TO_SIDE: Record<string, Side> = {
  north: "north_shore",
  windward: "windward",
  central: "central",
  leeward: "leeward_ewa",
  town: "town",
  east: "east",
};

const LABELS: Record<Side, { text: string; tilt: number }> = {
  north_shore: { text: "NORTH\nSHORE", tilt: -3 },
  windward: { text: "WINDWARD", tilt: 2 },
  central: { text: "CENTRAL", tilt: -1 },
  leeward_ewa: { text: "LEEWARD\nAND ʻEWA", tilt: 2 },
  town: { text: "TOWN", tilt: -2 },
  east: { text: "EAST", tilt: 3 },
};

const SHAPES = sidesData.sides.map((s) => ({
  side: JSON_TO_SIDE[s.id],
  x: s.labelX,
  y: s.labelY,
  points: s.points.map(([x, y]) => `${x},${y}`).join(" "),
}));

export interface IslandMapProps {
  /** The side picked, or null for all of Oʻahu. */
  selected: Side | null;
  /** Called on a pick when a client parent filters in place. Links still carry hrefs for no-JS. */
  onSelect?: (side: Side | null) => void;
  /** Page the side links point at. Default "/". */
  basePath?: string;
  /** Other query params to keep on side links, e.g. { day: "2026-10-31" }. */
  params?: Record<string, string>;
  /** Fragment for side links. Default "#this-weekend". */
  hash?: string;
  /** Label size: "md" on phones, "lg" on the desktop hero. */
  size?: "md" | "lg";
  /** Framed in ink, as on the desktop hero. */
  framed?: boolean;
  className?: string;
}

/**
 * The painted island map as a side filter. Each side is a clickable shape and
 * a label link; a plain list of the same links sits under the map, and every
 * link works without JavaScript through ?side=.
 */
export function IslandMap({
  selected,
  onSelect,
  basePath = "/",
  params = {},
  hash = "#this-weekend",
  size = "md",
  framed = false,
  className,
}: IslandMapProps) {
  const clipId = useId().replace(/:/g, "");

  const hrefFor = (side: Side | null) => {
    const query = new URLSearchParams(params);
    if (side) query.set("side", sideParam(side));
    else query.delete("side");
    const qs = query.toString();
    return `${basePath}${qs ? `?${qs}` : ""}${hash}`;
  };

  const pick = (side: Side | null) => (event: React.MouseEvent) => {
    if (!onSelect) return;
    event.preventDefault();
    onSelect(side === selected ? null : side);
  };

  const selectedName = selected ? SIDE_NAMES[selected] : null;

  return (
    <div role="group" aria-label="Pick a side of the island" className={cn("flex flex-col gap-1.5 md:gap-2", className)}>
      <div className="relative aspect-[1448/1086] w-full">
        <Image
          src="/art/oahu-map-plum.webp"
          alt="Painted map of Oʻahu"
          fill
          sizes="(min-width: 768px) 560px, 100vw"
          className={cn("block", framed && "box-border border-2 border-gl-ink shadow-gl-board")}
        />
        <svg viewBox={sidesData.viewBox} className="absolute inset-0 size-full" aria-hidden="true">
          <defs>
            <clipPath id={clipId}>
              <path d={sidesData.island} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            {SHAPES.map((shape) => {
              const on = shape.side === selected;
              return (
                <a key={shape.side} href={hrefFor(on ? null : shape.side)} tabIndex={-1} onClick={pick(shape.side)}>
                  <polygon
                    points={shape.points}
                    fill={on ? "rgba(251,247,240,0.35)" : "rgba(251,247,240,0)"}
                    stroke={on ? "#221A26" : "none"}
                    strokeWidth={7}
                    strokeDasharray="16 12"
                    strokeLinejoin="round"
                    className="cursor-pointer hover:fill-[rgba(251,247,240,0.18)]"
                  />
                </a>
              );
            })}
          </g>
        </svg>
        {SHAPES.map((shape) => {
          const on = shape.side === selected;
          const label = LABELS[shape.side];
          return (
            <Link
              key={shape.side}
              href={hrefFor(on ? null : shape.side)}
              scroll={false}
              onClick={pick(shape.side)}
              aria-current={on ? "true" : undefined}
              aria-label={SIDE_NAMES[shape.side]}
              className={cn(
                "absolute border-2 border-gl-ink text-center font-display leading-[1.05] whitespace-pre-line no-underline shadow-gl-tab focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gl-cream",
                size === "lg" ? "min-h-9 px-[9px] py-1.5 text-[13px]" : "min-h-[30px] px-1.5 py-1 text-[10px]",
                on ? "bg-gl-ink text-gl-cream" : "bg-gl-cream text-gl-ink hover:bg-gl-cream2",
              )}
              style={{ left: shape.x, top: shape.y, transform: `translate(-50%, -50%) rotate(${label.tilt}deg)` }}
            >
              {label.text}
            </Link>
          );
        })}
      </div>

      <div className="flex min-h-10 items-center justify-between gap-2.5 px-2.5 md:px-0 md:pt-2">
        <p className="m-0 text-[14px] text-gl-soft md:text-[15px]" aria-live="polite">
          Pick a side of the island.{" "}
          <b className="text-gl-cream">{selectedName ? `Showing ${selectedName}.` : "Showing all of Oʻahu."}</b>
        </p>
        {selected ? (
          <Link
            href={hrefFor(null)}
            scroll={false}
            onClick={pick(null)}
            className="flex min-h-9 shrink-0 items-center border-2 border-gl-ink bg-gl-cream px-2.5 font-display text-[11px] text-gl-ink no-underline md:text-[12px]"
          >
            ALL OF OʻAHU
          </Link>
        ) : null}
      </div>

      <ul aria-label="Sides of the island" className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 px-2.5 text-[14px] md:px-0">
        {SIDE_ORDER.map((side) => (
          <li key={side}>
            <Link
              href={hrefFor(side === selected ? null : side)}
              scroll={false}
              onClick={pick(side)}
              aria-current={side === selected ? "true" : undefined}
              className={cn(
                "font-bold underline-offset-2",
                side === selected ? "text-gl-cream underline" : "text-gl-soft hover:text-gl-cream",
              )}
            >
              {SIDE_NAMES[side]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
