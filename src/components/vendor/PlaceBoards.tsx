import Link from "next/link";

import { SignArrow } from "@/components/sign/ArrowSign";
import { CreamBoard } from "@/components/sign/CreamBoard";
import { StatusChip } from "@/components/sign/StatusChip";
import { cn } from "@/lib/cn";
import type { ListingStatus } from "@/lib/directory/status";

import type { HoursRow } from "./hours";

/** The small arrow turned up-right: the link leaves the site. */
export function OutArrow({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className={cn("-rotate-45", className)}>
      <path d="M3.5 9.5h8.5V5l8.5 7-8.5 7v-4.5H3.5z" fill="currentColor" />
    </svg>
  );
}

const BUTTON =
  "flex min-h-12 items-center justify-center gap-2 border-2 border-gl-ink px-3.5 font-display text-[14px] text-gl-ink no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gl-purple";

const TEXT_LINK =
  "flex min-h-11 items-center gap-2 self-start font-extrabold text-gl-purple no-underline hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gl-purple";

export interface ShopBoardData {
  title: string;
  address: string | null;
  status: ListingStatus;
  callAhead: boolean;
  summary: string | null;
  hoursNote: string | null;
  rows: HoursRow[];
  directionsUrl: string | null;
  phoneHref: string | null;
}

/** The fixed shop: status chip, address, hours, directions and call. */
export function ShopBoard({ shop, className }: { shop: ShopBoardData; className?: string }) {
  const label =
    shop.status.tone === "not_posted" && shop.callAhead ? `${shop.status.label} · CALL AHEAD` : shop.status.label;
  const buttons = [shop.directionsUrl, shop.phoneHref].filter(Boolean).length;
  return (
    <CreamBoard className={cn("flex flex-col gap-2.5 px-4 pt-[18px] pb-4", className)}>
      <StatusChip tone={shop.status.tone} label={label} className="self-start" />
      <h3 className="m-0 font-display text-[22px] leading-[1.05] font-normal uppercase">{shop.title}</h3>
      <p className="m-0 text-[16px] text-gl-muted">{shop.address ?? "Address not posted yet"}</p>
      {shop.summary ? <p className="m-0 text-[16px] font-bold">{shop.summary}</p> : null}
      {shop.hoursNote ? <p className="m-0 text-[15px] leading-[1.45] text-gl-muted">{shop.hoursNote}</p> : null}
      {buttons > 0 ? (
        <div className={cn("mt-1 grid gap-2", buttons === 2 ? "grid-cols-2" : "grid-cols-1")}>
          {shop.directionsUrl ? (
            <a href={shop.directionsUrl} target="_blank" rel="noopener noreferrer" className={cn(BUTTON, "bg-gl-marigold")}>
              DIRECTIONS
              <OutArrow />
            </a>
          ) : null}
          {shop.phoneHref ? (
            <a href={shop.phoneHref} className={cn(BUTTON, "bg-gl-cream")}>
              CALL
            </a>
          ) : null}
        </div>
      ) : null}
      {shop.rows.length > 0 ? (
        <details className="group mt-1 border-t-2 border-dashed border-gl-rule">
          <summary className="flex min-h-[46px] cursor-pointer list-none items-center justify-between font-extrabold focus-visible:outline-3 focus-visible:outline-gl-purple [&::-webkit-details-marker]:hidden">
            All shop hours
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="text-gl-purple transition-transform group-open:rotate-180">
              <path d="M9.5 3.5h5v8.5h4.5L12 20.5 5 12h4.5z" fill="currentColor" />
            </svg>
          </summary>
          <dl className="m-0">
            {shop.rows.map((row) => (
              <div
                key={row.day}
                className={cn(
                  "flex justify-between border-t border-[#E5DCCD] py-1.5 text-[15px]",
                  row.isToday ? "font-extrabold" : "font-medium",
                  row.closed ? "text-gl-muted" : "text-gl-ink",
                )}
              >
                <dt>
                  {row.day}
                  {row.isToday ? <span className="sr-only"> (today)</span> : null}
                </dt>
                <dd className="m-0">{row.text}</dd>
              </div>
            ))}
          </dl>
        </details>
      ) : null}
    </CreamBoard>
  );
}

export interface PlaceBoardData {
  key: string;
  status: ListingStatus | null;
  title: string;
  body: string | null;
  link: { href: string; label: string; external: boolean } | null;
}

/** A market stand or another way to buy: chip, name, one line, one link. */
export function PlaceBoard({ place, tilt, className }: { place: PlaceBoardData; tilt: number; className?: string }) {
  return (
    <CreamBoard nails={false} tilt={tilt} className={cn("flex flex-col gap-2 px-4 pt-[18px] pb-4", className)}>
      {place.status ? <StatusChip status={place.status} className="self-start" /> : null}
      <h3 className="m-0 font-display text-[20px] leading-[1.1] font-normal uppercase">{place.title}</h3>
      {place.body ? <p className="m-0 text-[16px] text-gl-muted">{place.body}</p> : null}
      {place.link ? (
        place.link.external ? (
          <a href={place.link.href} target="_blank" rel="noopener noreferrer" className={TEXT_LINK}>
            {place.link.label}
            <OutArrow />
          </a>
        ) : (
          <Link href={place.link.href} className={TEXT_LINK}>
            {place.link.label}
            <SignArrow size={20} />
          </Link>
        )
      ) : null}
    </CreamBoard>
  );
}
