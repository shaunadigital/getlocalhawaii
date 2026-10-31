/**
 * Computed status for directory listings. Pure: every function takes `now`.
 *
 * The chips come in three looks (see StatusChip): open, upcoming and not
 * posted. Unlike src/lib/status.ts getStatus, nothing here is gated on a
 * 30-day freshness window: every directory listing prints its CHECKED date
 * beside the chip, so the reader can see how old the source is.
 */

import { getHoursStatus, nextMarketDates } from "../status";
import {
  dayName,
  hawaiiClock,
  hawaiiInstant,
  longDayName,
  minutesFromTime,
  monthAbbr,
  shortTime,
} from "../time";
import type { DirectoryMarket, DirectoryVendor, MarketDate } from "./types";

export type StatusTone = "open" | "upcoming" | "not_posted" | "ended";

export type ListingStatusKind =
  /** Open or on right now, from posted hours. */
  | "open"
  /** Opens or starts later today. */
  | "later"
  /** Next posted day or date, not today. */
  | "next"
  /** On today per the source, hours not posted. */
  | "today_unposted"
  /** Today's posted hours are over. */
  | "ended"
  /** No hours or no upcoming date posted. */
  | "not_posted";

export interface ListingStatus {
  kind: ListingStatusKind;
  /**
   * Which chip look: open is solid green, upcoming is cream with a ring dot,
   * not_posted is a dashed outline. "ended" renders as plain muted text, not
   * a chip.
   */
  tone: StatusTone;
  /** Chip text, caps: "OPEN TIL 6P", "STARTS 4P", "NEXT: SAT OCT 31", "HOURS NOT POSTED". */
  label: string;
  isOpenNow: boolean;
}

const NOT_POSTED: ListingStatus = {
  kind: "not_posted",
  tone: "not_posted",
  label: "HOURS NOT POSTED",
  isOpenNow: false,
};

/** "7:30a" for body copy, from minutes since midnight. */
export function bodyTime(totalMinutes: number): string {
  return shortTime(totalMinutes).toLowerCase();
}

/** "7:30a to 11a". */
export function bodyRange(starts: string, ends: string | null): string {
  const start = bodyTime(minutesFromTime(starts));
  return ends ? `${start} to ${bodyTime(minutesFromTime(ends))}` : start;
}

/** "SAT OCT 31" for a YYYY-MM-DD Hawaii date. */
export function chipDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${dayName(dow).toUpperCase()} ${monthAbbr(month)} ${day}`;
}

/** "HH:MM" Hawaii wall clock of an instant. */
function wallTime(instant: Date): string {
  const minutes = hawaiiClock(instant).minutes;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

// Vendors ---------------------------------------------------------------------

export function vendorStatus(vendor: Pick<DirectoryVendor, "hours">, now: Date): ListingStatus {
  if (vendor.hours.length === 0) return NOT_POSTED;
  const status = getHoursStatus(vendor.hours, now);
  switch (status.kind) {
    case "open":
      return { kind: "open", tone: "open", label: `OPEN TIL ${status.closesAt}`, isOpenNow: true };
    case "opens_later":
      return { kind: "later", tone: "upcoming", label: `OPENS ${status.opensAt}`, isOpenNow: false };
    case "closed":
      return status.opensDay
        ? {
            kind: "next",
            tone: "upcoming",
            label: `NEXT: ${status.opensDay.toUpperCase()} ${status.opensAt}`,
            isOpenNow: false,
          }
        : NOT_POSTED;
    default:
      return NOT_POSTED;
  }
}

// Occurrences -----------------------------------------------------------------

/** One day a market happens, from a weekly session or a market_dates row. */
export interface Occurrence {
  marketId: string;
  /** Hawaii calendar date, YYYY-MM-DD. */
  date: string;
  dayOfWeek: number;
  /** "HH:MM" wall clock, null when the hours are not posted. */
  starts: string | null;
  ends: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  timePosted: boolean;
  source: "session" | "date";
  note: string | null;
}

function addDaysTo(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function dayOfWeekOf(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function fromMarketDate(marketId: string, d: MarketDate): Occurrence {
  return {
    marketId,
    date: d.date,
    dayOfWeek: dayOfWeekOf(d.date),
    starts: d.timePosted ? wallTime(d.startsAt) : null,
    ends: d.timePosted && d.endsAt ? wallTime(d.endsAt) : null,
    startsAt: d.timePosted ? d.startsAt : null,
    endsAt: d.timePosted ? d.endsAt : null,
    timePosted: d.timePosted,
    source: "date",
    note: d.note,
  };
}

/**
 * Every occurrence of one market between two Hawaii dates, inclusive.
 * Weekly sessions are expanded onto matching weekdays; market_dates rows are
 * matched by their Hawaii calendar date.
 */
export function marketOccurrences(
  market: Pick<DirectoryMarket, "id" | "sessions" | "dates">,
  from: string,
  to: string,
): Occurrence[] {
  const out: Occurrence[] = [];
  for (let date = from; date <= to; date = addDaysTo(date, 1)) {
    const dow = dayOfWeekOf(date);
    for (const session of market.sessions) {
      if (session.dayOfWeek !== dow) continue;
      const startsAt = hawaiiInstant(date, session.starts);
      let endsAt = hawaiiInstant(date, session.ends);
      if (endsAt <= startsAt) endsAt = new Date(endsAt.getTime() + 86_400_000);
      out.push({
        marketId: market.id,
        date,
        dayOfWeek: dow,
        starts: session.starts.slice(0, 5),
        ends: session.ends.slice(0, 5),
        startsAt,
        endsAt,
        timePosted: true,
        source: "session",
        note: null,
      });
    }
  }
  for (const d of market.dates) {
    if (d.date >= from && d.date <= to) out.push(fromMarketDate(market.id, d));
  }
  return out.sort(compareOccurrences);
}

export function compareOccurrences(a: Occurrence, b: Occurrence): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  // Unposted hours sort after posted ones on the same day.
  const sa = a.starts ?? "99:99";
  const sb = b.starts ?? "99:99";
  return sa.localeCompare(sb);
}

/** Occurrences across many markets in a date range, with their market, sorted by day then start. */
export function occurrencesBetween<M extends Pick<DirectoryMarket, "id" | "sessions" | "dates" | "name">>(
  markets: M[],
  from: string,
  to: string,
): { market: M; occurrence: Occurrence }[] {
  return markets
    .flatMap((market) => marketOccurrences(market, from, to).map((occurrence) => ({ market, occurrence })))
    .sort(
      (a, b) => compareOccurrences(a.occurrence, b.occurrence) || a.market.name.localeCompare(b.market.name),
    );
}

/**
 * Status of a single occurrence, for a row under a day heading. Returns null
 * for a posted future day: the row's time column already says when.
 */
export function occurrenceStatus(occurrence: Occurrence, now: Date): ListingStatus | null {
  const today = hawaiiClock(now).date;
  if (!occurrence.timePosted) {
    return occurrence.date === today
      ? { kind: "today_unposted", tone: "not_posted", label: "HOURS NOT POSTED", isOpenNow: false }
      : NOT_POSTED;
  }
  if (occurrence.date !== today || !occurrence.startsAt) return null;

  const starts = occurrence.startsAt;
  const ends = occurrence.endsAt;
  if (now < starts) {
    return {
      kind: "later",
      tone: "upcoming",
      label: `STARTS ${shortTime(hawaiiClock(starts).minutes)}`,
      isOpenNow: false,
    };
  }
  if (ends && now >= ends) {
    return { kind: "ended", tone: "ended", label: `ENDED ${shortTime(hawaiiClock(ends).minutes)}`, isOpenNow: false };
  }
  if (!ends) {
    // Start time posted, closing time not: say it started, never guess an end.
    return {
      kind: "open",
      tone: "open",
      label: `STARTED ${shortTime(hawaiiClock(starts).minutes)}`,
      isOpenNow: true,
    };
  }
  return { kind: "open", tone: "open", label: `OPEN TIL ${shortTime(hawaiiClock(ends).minutes)}`, isOpenNow: true };
}

/** The next occurrence that has not finished yet, today included. */
export function nextOccurrence(
  market: Pick<DirectoryMarket, "id" | "sessions" | "dates">,
  now: Date,
): Occurrence | null {
  const today = hawaiiClock(now).date;
  const candidates: Occurrence[] = [];

  const [nextSession] = nextMarketDates(market.sessions, now, 1);
  if (nextSession) {
    candidates.push(
      ...marketOccurrences({ id: market.id, sessions: market.sessions, dates: [] }, nextSession.date, nextSession.date),
    );
  }
  for (const d of market.dates) {
    if (d.date < today) continue;
    candidates.push(fromMarketDate(market.id, d));
  }

  return (
    candidates
      .filter((o) => o.date > today || !o.endsAt || o.endsAt > now)
      .sort(compareOccurrences)[0] ?? null
  );
}

/**
 * Status of a whole market: on now, starts later today, the next date, or
 * not posted. "NEXT: SAT OCT 31" names the date; the page lists the hours.
 */
export function marketStatus(market: Pick<DirectoryMarket, "id" | "sessions" | "dates">, now: Date): ListingStatus {
  const next = nextOccurrence(market, now);
  if (!next) {
    return market.dates.length > 0 && market.sessions.length === 0
      ? { kind: "not_posted", tone: "not_posted", label: "NEXT DATE NOT POSTED", isOpenNow: false }
      : NOT_POSTED;
  }
  const today = hawaiiClock(now).date;
  if (next.date === today) {
    const status = occurrenceStatus(next, now);
    if (status && status.kind !== "ended") {
      return status.kind === "today_unposted"
        ? { kind: "today_unposted", tone: "upcoming", label: "TODAY · HOURS NOT POSTED", isOpenNow: false }
        : status;
    }
  }
  return { kind: "next", tone: "upcoming", label: `NEXT: ${chipDate(next.date)}`, isOpenNow: false };
}

// Weekend ---------------------------------------------------------------------

export interface WeekendDay {
  /** YYYY-MM-DD in Hawaii. */
  date: string;
  dayOfWeek: number;
  isToday: boolean;
  /** Board label: "TODAY", "SAT", "SUN". */
  label: string;
  /** Desktop board label: "TODAY", "SATURDAY", "SUNDAY". */
  longLabel: string;
  /** Mobile kicker: "FRI 30" for today, "OCT 31" otherwise. */
  kicker: string;
  /** Desktop kicker: "FRI OCT 30" for today, "OCT 31" otherwise. */
  longKicker: string;
  /** List heading: "TODAY, FRI OCT 30" or "SATURDAY, OCT 31". */
  title: string;
  /** For sentences: "today", "Saturday". */
  name: string;
}

/**
 * Today plus the weekend days still ahead: Mon to Fri give today, Sat, Sun;
 * Saturday gives today and Sunday; Sunday gives today only.
 */
export function weekendDays(now: Date): WeekendDay[] {
  const clock = hawaiiClock(now);
  const offsets = [0];
  if (clock.dayOfWeek !== 6 && clock.dayOfWeek !== 0) offsets.push(6 - clock.dayOfWeek, 7 - clock.dayOfWeek);
  if (clock.dayOfWeek === 6) offsets.push(1);

  return offsets.map((offset) => {
    const date = addDaysTo(clock.date, offset);
    const [, month, day] = date.split("-").map(Number);
    const dow = dayOfWeekOf(date);
    const monthDay = `${monthAbbr(month)} ${day}`;
    const isToday = offset === 0;
    const short = dayName(dow).toUpperCase();
    const long = longDayName(dow).toUpperCase();
    return {
      date,
      dayOfWeek: dow,
      isToday,
      label: isToday ? "TODAY" : short,
      longLabel: isToday ? "TODAY" : long,
      kicker: isToday ? `${short} ${day}` : monthDay,
      longKicker: isToday ? `${short} ${monthDay}` : monthDay,
      title: isToday ? `TODAY, ${short} ${monthDay}` : `${long}, ${monthDay}`,
      name: isToday ? "today" : longDayName(dow),
    };
  });
}

// Holiday fairs ---------------------------------------------------------------

export interface FairRun<M> {
  market: M;
  /** Consecutive dates of the first upcoming run, one for a one-day fair. */
  dates: MarketDate[];
  /** First date, YYYY-MM-DD. */
  date: string;
  /** "NOV" */
  month: string;
  /** "7" */
  day: string;
  /** "Sat", or "Fri to Sun" for a run. */
  dayLabel: string;
  /** "9:30a to 2:30p" for a one-day fair with posted hours, else null. */
  timeLabel: string | null;
}

/**
 * Dated markets that read as holiday fairs: kind holiday_fair, or any dated
 * market with a November or December date. Returns the first upcoming run of
 * each, soonest first. Weekly markets never appear here.
 */
export function holidayFairRuns<M extends Pick<DirectoryMarket, "id" | "kind" | "sessions" | "dates" | "name">>(
  markets: M[],
  now: Date,
): FairRun<M>[] {
  const today = hawaiiClock(now).date;
  const runs: FairRun<M>[] = [];

  for (const market of markets) {
    if (market.sessions.length > 0) continue;
    const isFairKind = market.kind === "holiday_fair";
    const upcoming = market.dates.filter((d) => {
      const month = Number(d.date.slice(5, 7));
      return d.date >= today && (isFairKind || month === 11 || month === 12);
    });
    // Collapse same-day duplicates, keep order.
    const unique = upcoming.filter((d, i) => i === 0 || d.date !== upcoming[i - 1].date);
    if (unique.length === 0) continue;

    const run = [unique[0]];
    for (const d of unique.slice(1)) {
      if (d.date === addDaysTo(run[run.length - 1].date, 1)) run.push(d);
      else break;
    }
    const first = run[0];
    const last = run[run.length - 1];
    const [, month, day] = first.date.split("-").map(Number);
    const firstDay = dayName(dayOfWeekOf(first.date));
    const dayLabel = run.length > 1 ? `${firstDay} to ${dayName(dayOfWeekOf(last.date))}` : firstDay;
    const timeLabel =
      run.length === 1 && first.timePosted
        ? bodyRange(wallTime(first.startsAt), first.endsAt ? wallTime(first.endsAt) : null)
        : null;

    runs.push({ market, dates: run, date: first.date, month: monthAbbr(month), day: String(day), dayLabel, timeLabel });
  }

  return runs.sort((a, b) => (a.date === b.date ? a.market.name.localeCompare(b.market.name) : a.date < b.date ? -1 : 1));
}
