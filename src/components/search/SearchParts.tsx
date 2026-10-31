import Link from "next/link";

import { SignArrow } from "@/components/sign/ArrowSign";
import { CreamBoard } from "@/components/sign/CreamBoard";
import { BoardList, MarketRow, VendorRow } from "@/components/sign/ListingRows";
import type { MarketRowData, VendorRowData } from "@/components/sign/rows";
import { type IconName, SignIcon } from "@/components/sign/SignIcon";

/** The heading over the leading list, with the round icon sign when one fits. */
export function SearchHeading({
  title,
  sub,
  icon,
  level = 1,
}: {
  title: string;
  sub: string | null;
  icon: IconName | null;
  level?: 1 | 2;
}) {
  const Tag = level === 1 ? "h1" : "h2";
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between gap-3 md:justify-start md:gap-[22px]">
        <div className="order-1 flex min-w-0 flex-col gap-2 md:order-2">
          <Tag className="m-0 font-display text-[34px] leading-none font-normal break-words text-gl-cream md:text-[44px]">
            {title}
          </Tag>
          {sub ? <p className="m-0 hidden text-[17px] text-gl-soft md:block">{sub}</p> : null}
        </div>
        {icon ? (
          <span
            aria-hidden="true"
            className="order-2 flex size-[78px] shrink-0 -rotate-6 items-center justify-center rounded-full border-2 border-gl-ink bg-gl-cream text-gl-ink shadow-gl-board md:order-1 md:size-[92px]"
          >
            <SignIcon name={icon} className="size-12 md:size-[58px]" />
          </span>
        ) : null}
      </div>
      {sub ? <p className="m-0 text-[16px] text-gl-soft md:hidden">{sub}</p> : null}
    </div>
  );
}

export function VendorBoard({ rows }: { rows: VendorRowData[] }) {
  return (
    <CreamBoard>
      <BoardList>
        {rows.map((row) => (
          <li key={row.key}>
            <VendorRow row={row} />
          </li>
        ))}
      </BoardList>
    </CreamBoard>
  );
}

export function MarketBoard({ rows }: { rows: MarketRowData[] }) {
  return (
    <CreamBoard>
      <BoardList>
        {rows.map((row) => (
          <li key={row.key}>
            <MarketRow row={row} />
          </li>
        ))}
      </BoardList>
    </CreamBoard>
  );
}

export interface AlsoLink {
  href: string;
  label: string;
  detail?: string | null;
}

/** Other things the query matched: places, guides. Plain links in a dashed box. */
export function AlsoMatches({ links }: { links: AlsoLink[] }) {
  if (links.length === 0) return null;
  return (
    <nav
      aria-label="Also matches"
      className="flex flex-col gap-2 border-2 border-dashed border-white/55 p-[18px] text-[15px] text-gl-soft"
    >
      <span className="font-display text-[13px] text-gl-cream">ALSO MATCHES</span>
      {links.map((link) => (
        <span key={link.href}>
          <Link href={link.href} className="font-extrabold text-gl-cream underline-offset-2 hover:text-gl-soft">
            {link.label}
          </Link>
          {link.detail ? <span className="text-gl-soft"> · {link.detail}</span> : null}
        </span>
      ))}
    </nav>
  );
}

export interface BrowseTile {
  label: string;
  href: string;
  icon: IconName;
}

const TILE_TILTS = [-0.8, 0.6, -0.4];

/** BROWSE INSTEAD: three kind tiles and the week's markets. */
export function BrowseInstead({ tiles }: { tiles: BrowseTile[] }) {
  return (
    <section aria-labelledby="browse-heading" className="flex flex-col gap-3.5 md:max-w-[720px]">
      <h2 id="browse-heading" className="m-0 font-display text-[24px] leading-none font-normal text-gl-cream">
        BROWSE INSTEAD
      </h2>
      {tiles.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-3 gap-2.5 p-0 md:gap-3.5">
          {tiles.map((tile, i) => (
            <li key={tile.label} className="flex">
              <Link
                href={tile.href}
                className="box-border flex min-h-[104px] grow flex-col items-center justify-center gap-2 border-2 border-gl-ink bg-gl-cream px-1.5 py-2.5 text-gl-ink no-underline shadow-gl-tab hover:bg-gl-cream2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gl-cream md:min-h-[130px]"
                style={{ transform: `rotate(${TILE_TILTS[i % TILE_TILTS.length]}deg)` }}
              >
                <SignIcon name={tile.icon} className="size-10 md:size-12" />
                <span className="text-center font-display text-[11px] leading-[1.1] md:text-[13px]">{tile.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <Link
        href="/#this-weekend"
        className="flex min-h-11 items-center gap-2.5 self-start font-display text-[15px] text-gl-cream no-underline"
      >
        MARKETS THIS WEEK <SignArrow size={20} className="text-gl-soft" />
      </Link>
    </section>
  );
}

/** The empty state board: what is missing, said plainly. */
export function NothingListed({ title, body }: { title: string; body: string }) {
  return (
    <CreamBoard tilt={-0.6} className="flex flex-col gap-2.5 px-[18px] pt-[22px] pb-[18px] md:max-w-[720px] md:px-7 md:pt-7 md:pb-6">
      <h1 className="m-0 font-display text-[26px] leading-[1.02] font-normal break-words md:text-[34px]">{title}</h1>
      <p className="m-0 text-[16px] text-gl-muted md:text-[17px]">{body}</p>
    </CreamBoard>
  );
}
