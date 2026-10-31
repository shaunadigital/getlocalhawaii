import { CreamBoard } from "@/components/sign/CreamBoard";
import { StatusChip } from "@/components/sign/StatusChip";
import { type MarketListing, type Occurrence, bodyRange, chipDate } from "@/lib/directory";
import { cn } from "@/lib/cn";
import { dayName, monthAbbr } from "@/lib/time";

import {
  bodyDate,
  calendarUrl,
  dateTimes,
  directionsUrl,
  headlineDate,
  occurrenceTimes,
  pluralDay,
  splitRuns,
} from "./format";

function OutArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="-rotate-45">
      <path d="M3.5 9.5h8.5V5l8.5 7-8.5 7v-4.5H3.5z" fill="currentColor" />
    </svg>
  );
}

const BUTTON =
  "flex min-h-12 items-center justify-center gap-2 border-2 border-gl-ink px-3.5 text-center font-display text-[14px] leading-[1.1] text-gl-ink no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gl-purple";

/**
 * The where-and-when board: status chip, the next date and its hours (or
 * "hours not posted"), the place, getting there and parking, and the
 * Directions and calendar links.
 */
export function NextBoard({ market, today, pageUrl }: { market: MarketListing; today: string; pageUrl: string }) {
  const next = market.next;
  const dated = market.sessions.length === 0;
  const run =
    next && next.source === "date" ? (splitRuns(market.dates.filter((d) => d.date >= today))[0] ?? []) : [];
  const first = run[0];
  const last = run[run.length - 1];

  let headline = "NOT POSTED YET";
  if (next) {
    headline =
      run.length > 1 ? `${headlineDate(first.date, today)} TO ${chipDate(last.date)}` : headlineDate(next.date, today);
  }

  const place = market.venueName ?? market.locationNotes;
  const areaLine = [market.neighborhood ?? market.area, market.sideName].filter(Boolean).join(" · ");
  const location = market.address ?? ([place, market.area].filter(Boolean).join(", ") || null);

  return (
    <CreamBoard as="section" aria-labelledby="next-heading">
      <div className="flex flex-col gap-2.5 px-4 pt-[18px] pb-4 md:px-5 md:pt-5 md:pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="next-heading" className="m-0 font-display text-[12px] font-normal text-gl-purple">
            {dated ? "NEXT DATE" : "NEXT MARKET"}
          </h2>
          <StatusChip status={market.status} />
        </div>

        <p className="m-0 font-display text-[26px] leading-[1.05]">
          {next ? <time dateTime={next.date}>{headline}</time> : headline}
        </p>

        {next && next.source === "session" ? (
          <SessionLines market={market} next={next} />
        ) : next && run.length > 0 ? (
          <DateLines run={run} />
        ) : (
          <p className="m-0 text-[16px] text-gl-muted">
            {market.scheduleText ? (
              <>
                As posted: <span className="text-gl-ink">{market.scheduleText}</span>
              </>
            ) : (
              "The next date is not posted yet."
            )}
          </p>
        )}

        <div className="flex flex-col text-[16px]">
          {place ? <span className="font-bold">{place}</span> : null}
          {market.address ? <span className="text-gl-muted">{market.address}</span> : null}
          {areaLine ? <span className="text-gl-muted">{areaLine}</span> : null}
          {market.locationNotes && market.venueName && market.locationNotes !== market.venueName ? (
            <span className="text-gl-muted">{market.locationNotes}</span>
          ) : null}
        </div>

        {market.gettingThere || market.parkingNotes ? (
          <dl className="m-0 flex flex-col gap-1.5 text-[15px]">
            {market.gettingThere ? (
              <div>
                <dt className="font-display text-[11px] text-gl-purple">GETTING THERE</dt>
                <dd className="m-0">{market.gettingThere}</dd>
              </div>
            ) : null}
            {market.parkingNotes ? (
              <div>
                <dt className="font-display text-[11px] text-gl-purple">PARKING</dt>
                <dd className="m-0">{market.parkingNotes}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <div className={cn("mt-1 grid gap-2", next ? "grid-cols-2" : "grid-cols-1")}>
          <a
            href={directionsUrl(market)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(BUTTON, "bg-gl-marigold hover:bg-[#f5cd6c]")}
          >
            DIRECTIONS
            <OutArrow />
            <span className="sr-only">(opens Google Maps)</span>
          </a>
          {next ? (
            <a
              href={calendarUrl(next, { name: market.name, location, pageUrl })}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(BUTTON, "bg-gl-cream hover:bg-gl-cream2")}
            >
              ADD TO CALENDAR
              <span className="sr-only">(opens Google Calendar)</span>
            </a>
          ) : null}
        </div>
      </div>
    </CreamBoard>
  );
}

function SessionLines({ market, next }: { market: MarketListing; next: Occurrence }) {
  const times = occurrenceTimes(next);
  return (
    <>
      <p className="m-0 text-[18px] font-extrabold">
        {[times, pluralDay(next.dayOfWeek)].filter(Boolean).join(" · ")}
      </p>
      {market.sessions.length > 1 ? (
        <ul className="m-0 list-none p-0 text-[15px] text-gl-muted">
          {market.sessions.map((s) => (
            <li key={`${s.dayOfWeek}-${s.starts}`}>
              {pluralDay(s.dayOfWeek)} {bodyRange(s.starts, s.ends)}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function DateLines({ run }: { run: MarketListing["dates"] }) {
  if (run.length === 1) {
    const d = run[0];
    return (
      <>
        <p className="m-0 text-[18px] font-extrabold">{dateTimes(d) ?? "Hours not posted"}</p>
        {d.note ? <p className="m-0 text-[15px] text-gl-muted">{d.note}</p> : null}
      </>
    );
  }
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {run.map((d) => (
        <li key={d.date} className="flex flex-col">
          <span className="text-[17px] font-extrabold">
            {bodyDate(d.date)} · {dateTimes(d) ?? <span className="font-semibold text-gl-muted">hours not posted</span>}
          </span>
          {d.note ? <span className="text-[14px] text-gl-muted">{d.note}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/** The strip of coming dates under the board. The first one is the next date. */
export function ComingDates({
  occurrences,
  label,
  className,
}: {
  occurrences: Occurrence[];
  label: string;
  className?: string;
}) {
  if (occurrences.length < 2) return null;
  return (
    <section aria-labelledby="coming-heading" className={cn("flex flex-col gap-3", className)}>
      <h2 id="coming-heading" className="m-0 font-display text-[14px] font-normal text-gl-soft">
        {label}
      </h2>
      <ul className="m-0 flex list-none gap-2.5 overflow-x-auto p-0 pb-1.5 md:flex-wrap md:overflow-visible">
        {occurrences.map((o, i) => {
          const [, month, day] = o.date.split("-").map(Number);
          return (
            <li
              key={`${o.date}-${o.starts ?? "x"}`}
              className={cn(
                "flex w-[74px] flex-none flex-col items-center border-2 border-gl-ink py-2 shadow-gl-tab",
                i === 0 ? "bg-gl-ink text-gl-cream" : "bg-gl-cream text-gl-ink",
              )}
            >
              <time dateTime={o.date} className="flex flex-col items-center">
                <span className="font-display text-[11px]">{dayName(o.dayOfWeek).toUpperCase()}</span>
                <span className="font-display text-[16px] leading-[1.1]">
                  {monthAbbr(month)} {day}
                </span>
              </time>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
