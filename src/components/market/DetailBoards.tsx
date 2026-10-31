import Link from "next/link";

import { SignArrow } from "@/components/sign/ArrowSign";
import { BoardList } from "@/components/sign/ListingRows";
import { CreamBoard } from "@/components/sign/CreamBoard";
import { StatusChip } from "@/components/sign/StatusChip";
import type { MarketListing } from "@/lib/directory";
import { chipDate } from "@/lib/directory/status";
import type { RowStatus } from "@/components/sign/rows";
import { mailto } from "@/lib/site";
import { minutesFromTime, shortTime } from "@/lib/time";

import { hostLabel, instagramLabel, instagramUrl } from "./format";

function SectionHeading({ id, children, aside }: { id: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="m-0 flex items-baseline justify-between gap-2.5 font-display text-[24px] leading-none font-normal text-gl-cream md:text-[26px]"
    >
      <span>{children}</span>
      {aside ? <span className="text-[14px] text-gl-soft">{aside}</span> : null}
    </h2>
  );
}

const LINK = "font-bold text-gl-ink underline underline-offset-2 hover:text-gl-purple";

/** SNAP / EBT, DA BUX and admission, when stored. Says what is missing otherwise. */
export function PaymentBoard({ market }: { market: MarketListing }) {
  const lines: React.ReactNode[] = [];
  if (market.takesSnap) lines.push(<span key="snap" className="font-bold">Takes SNAP / EBT</span>);
  if (market.daBux) lines.push(<span key="dabux" className="font-bold">Takes DA BUX</span>);
  if (market.admission) {
    lines.push(
      <span key="admission">
        <b>Admission:</b> {market.admission}
      </span>,
    );
  }

  return (
    <section aria-labelledby="payment-heading" className="flex flex-col gap-3.5">
      <SectionHeading id="payment-heading">{market.admission ? "PAYMENT AND ADMISSION" : "PAYMENT"}</SectionHeading>
      <CreamBoard>
        <div className="flex flex-col gap-2.5 p-4 text-[16px] md:px-5">
          {lines.length > 0 ? (
            lines
          ) : (
            <span className="text-gl-muted">
              Payment and SNAP: not posted yet.{" "}
              <a href={mailto(`Payment at ${market.name}`)} className={LINK}>
                Tell me
              </a>
            </span>
          )}
        </div>
      </CreamBoard>
    </section>
  );
}

/** Organizer or operator, and the vendor application link when one is posted. */
export function OrganizerBoard({ market }: { market: MarketListing }) {
  const organizer = market.organizer;
  const runBy = organizer?.name ?? market.operator;
  const boothFee = market.boothFee ?? organizer?.boothFeeInfo ?? null;
  if (!runBy && !market.vendorApplicationUrl) return null;

  return (
    <section aria-labelledby="organizer-heading" className="flex flex-col gap-3.5">
      <SectionHeading id="organizer-heading">WHO RUNS IT</SectionHeading>
      <CreamBoard>
        <div className="flex flex-col gap-2.5 p-4 text-[16px] md:px-5">
          {runBy ? (
            <span>
              {organizer?.website ? (
                <a href={organizer.website} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {runBy}
                </a>
              ) : (
                <b>{runBy}</b>
              )}
            </span>
          ) : null}
          {market.vendorApplicationUrl ? (
            <div className="flex flex-col gap-1 border-t-2 border-dashed border-gl-rule pt-2.5">
              <span className="font-display text-[11px] text-gl-purple">WANT A BOOTH?</span>
              <a
                href={market.vendorApplicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-2 self-start font-extrabold text-gl-ink no-underline hover:text-gl-purple"
              >
                Vendor application <SignArrow size={18} className="text-gl-purple" />
              </a>
              {boothFee ? <span className="text-[15px] text-gl-muted">Booth fee: {boothFee}</span> : null}
            </div>
          ) : null}
        </div>
      </CreamBoard>
    </section>
  );
}

/** Website, Instagram and Facebook, when stored. */
export function LinksBoard({ market }: { market: MarketListing }) {
  const links: { href: string; label: string; kind: string }[] = [];
  if (market.website) links.push({ href: market.website, label: hostLabel(market.website), kind: "Website" });
  if (market.instagram)
    links.push({ href: instagramUrl(market.instagram), label: instagramLabel(market.instagram), kind: "Instagram" });
  if (market.facebook) links.push({ href: market.facebook, label: "Facebook page", kind: "Facebook" });
  if (links.length === 0) return null;

  return (
    <section aria-labelledby="links-heading" className="flex flex-col gap-3.5">
      <SectionHeading id="links-heading">ONLINE</SectionHeading>
      <CreamBoard>
        <ul className="m-0 flex list-none flex-col divide-y-2 divide-dashed divide-gl-rule p-0 pt-2">
          {links.map((link) => (
            <li key={link.kind}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-3 px-4 py-2 text-gl-ink no-underline hover:bg-gl-cream2/60 md:px-5"
              >
                <span className="w-[86px] shrink-0 font-display text-[11px] text-gl-purple">{link.kind.toUpperCase()}</span>
                <span className="min-w-0 grow truncate font-bold">{link.label}</span>
                <SignArrow size={18} className="text-gl-purple" />
              </a>
            </li>
          ))}
        </ul>
      </CreamBoard>
    </section>
  );
}

/** "Source: hfbf.org, checked Aug 27, 2026." */
export function SourceLine({ market }: { market: MarketListing }) {
  if (!market.sourceUrl && !market.checked) return null;
  return (
    <p className="m-0 text-[14px] leading-normal text-gl-soft">
      Source:{" "}
      {market.sourceUrl ? (
        <a href={market.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-gl-cream">
          {hostLabel(market.sourceUrl)}
        </a>
      ) : (
        "not posted"
      )}
      {market.checked ? `, checked ${market.checked.date}.` : "."}
    </p>
  );
}

/** Vendors linked to this market. The page hides this when there are none. */
export function WhoSellsHere({ market }: { market: MarketListing }) {
  if (market.vendors.length === 0) return null;
  return (
    <section aria-labelledby="sellers-heading" className="flex flex-col gap-3.5">
      <SectionHeading id="sellers-heading" aside={`${market.vendors.length} LISTED`}>
        WHO SELLS HERE
      </SectionHeading>
      <CreamBoard className="pt-2">
        <BoardList className="md:grid md:grid-cols-2 md:divide-y-0">
          {market.vendors.map((v) => {
            const detail = [v.usualDays, v.stall].filter(Boolean).join(" · ");
            const body = (
              <>
                <span className="flex min-w-0 grow flex-col gap-[3px]">
                  <span className="text-[17px] leading-[1.25] font-extrabold">{v.name}</span>
                  {detail ? <span className="text-[14px] text-gl-muted">{detail}</span> : null}
                </span>
                {v.href ? <SignArrow size={20} className="text-gl-purple" /> : null}
              </>
            );
            return (
              <li key={v.id}>
                {v.href ? (
                  <Link
                    href={v.href}
                    className="flex items-center gap-3 py-3.5 pr-3.5 pl-4 text-gl-ink no-underline hover:bg-gl-cream2/60"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 py-3.5 pr-3.5 pl-4">{body}</div>
                )}
              </li>
            );
          })}
        </BoardList>
      </CreamBoard>
    </section>
  );
}

export interface NearbyRow {
  key: string;
  href: string;
  name: string;
  meta: string;
  /** "SAT NOV 7" or "TODAY". */
  day: string;
  start: string | null;
  end: string | null;
  status: RowStatus | null;
}

export function nearbyRow(
  m: Pick<MarketListing, "id" | "href" | "name" | "neighborhood" | "area" | "kindLabel" | "next">,
  today: string,
  status: RowStatus | null,
): NearbyRow | null {
  const o = m.next;
  if (!o) return null;
  return {
    key: m.id,
    href: m.href,
    name: m.name,
    meta: [m.neighborhood ?? m.area, m.kindLabel].filter(Boolean).join(" · "),
    day: o.date === today ? "TODAY" : chipDate(o.date),
    start: o.timePosted && o.starts ? shortTime(minutesFromTime(o.starts)) : null,
    end: o.timePosted && o.ends ? shortTime(minutesFromTime(o.ends)).toLowerCase() : null,
    status,
  };
}

/** Other markets on the same side, soonest first. Hidden when empty. */
export function MoreOnSide({ heading, rows }: { heading: string; rows: NearbyRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="nearby-heading" className="flex flex-col gap-3.5">
      <SectionHeading id="nearby-heading">{heading}</SectionHeading>
      <CreamBoard className="pt-2">
        <BoardList>
          {rows.map((row) => (
            <li key={row.key}>
              <Link
                href={row.href}
                className="flex items-center gap-3 py-3.5 pr-3.5 pl-4 text-gl-ink no-underline hover:bg-gl-cream2/60 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-gl-purple md:gap-5 md:pl-5"
              >
                <span className="flex w-[84px] shrink-0 flex-col md:w-[100px]">
                  <span className="font-display text-[11px] text-gl-purple">{row.day}</span>
                  {row.start ? (
                    <>
                      <span className="font-display text-[19px] leading-[1.05]">{row.start}</span>
                      {row.end ? <span className="text-[13px] font-semibold text-gl-muted">to {row.end}</span> : null}
                    </>
                  ) : (
                    <span className="text-[13px] font-semibold text-gl-muted">Hours not posted</span>
                  )}
                </span>
                <span className="flex min-w-0 grow flex-col gap-[3px]">
                  <span className="text-[17px] leading-[1.25] font-extrabold">{row.name}</span>
                  {row.meta ? <span className="text-[14px] text-gl-muted">{row.meta}</span> : null}
                  {row.status ? (
                    <span className="mt-[3px] flex">
                      <StatusChip status={row.status} />
                    </span>
                  ) : null}
                </span>
                <SignArrow size={20} className="text-gl-purple" />
              </Link>
            </li>
          ))}
        </BoardList>
      </CreamBoard>
    </section>
  );
}
