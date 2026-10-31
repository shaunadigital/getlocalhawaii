/**
 * Status and freshness. This is the product: nothing about "open now" or
 * "verified today" is ever stored, it is all derived here from hours,
 * verification events and same-day reports, in Pacific/Honolulu.
 *
 * See docs/BUILD_SPEC.md section 5.
 */

import {
  type HawaiiClock,
  dayName,
  duration,
  hawaiiClock,
  hawaiiDaysBetween,
  isSameHawaiiDay,
  longDayName,
  minutesFromTime,
  monthAbbr,
  relativeAgo,
  shortDate,
  shortTime,
  toDate,
} from "./time";

/** A listing drops out of "open now" once nobody has checked it in this long. */
export const FRESHNESS_WINDOW_DAYS = 30;

export type VerificationMethod =
  | "called"
  | "visited"
  | "organizer_confirmed"
  | "no_answer"
  /** Posted information read from the vendor's own site or an official page. */
  | "source_check";
export type ReportKind = "sold_out" | "closed" | "changed";

export interface OpeningHours {
  /** 0 = Sunday .. 6 = Saturday. */
  dayOfWeek: number;
  /** "HH:MM" or "HH:MM:SS" wall-clock time in Hawaii. */
  opens: string;
  closes: string;
}

export interface VerificationEvent {
  verifiedAt: string | Date;
  method: VerificationMethod;
  note?: string | null;
}

export interface Report {
  kind: ReportKind;
  reportedAt: string | Date;
  note?: string | null;
}

// Freshness -------------------------------------------------------------------

export type FreshnessKind = "today" | "dated" | "stale" | "never";

export interface Freshness {
  kind: FreshnessKind;
  /** Full chip text: "CHECKED AUG 19", "VERIFIED TODAY 8:10A", "UNCONFIRMED". */
  label: string;
  /** Same chip without the time, for narrow cards: "CHECKED AUG 19". */
  shortLabel: string;
  verifiedAt: Date | null;
  daysAgo: number | null;
  /** How that newest check was made, which decides the verb on the chip. */
  method: VerificationMethod | null;
  /** False once the newest check is outside the freshness window. */
  isFresh: boolean;
}

/**
 * Reading a vendor's posted hours is not the same as ringing them up, and the
 * chip has to say which one happened. Only a person making contact earns the
 * word verified.
 */
function freshnessVerb(method: VerificationMethod): string {
  return method === "source_check" ? "CHECKED" : "VERIFIED";
}

/**
 * Freshness of a listing from its verification log. Only the newest event
 * matters; the rest of the log is history shown on the detail page.
 */
export function getFreshness(events: VerificationEvent[], now: Date): Freshness {
  const newest = events.reduce<VerificationEvent | null>((latest, event) => {
    if (toDate(event.verifiedAt) > now) return latest;
    if (latest === null) return event;
    return toDate(event.verifiedAt) > toDate(latest.verifiedAt) ? event : latest;
  }, null);

  if (newest === null) {
    return {
      kind: "never",
      label: "UNCONFIRMED",
      shortLabel: "UNCONFIRMED",
      verifiedAt: null,
      daysAgo: null,
      method: null,
      isFresh: false,
    };
  }

  const at = toDate(newest.verifiedAt);
  const verb = freshnessVerb(newest.method);
  const daysAgo = hawaiiDaysBetween(at, now);

  if (daysAgo > FRESHNESS_WINDOW_DAYS) {
    return {
      kind: "stale",
      label: "UNCONFIRMED",
      shortLabel: "UNCONFIRMED",
      verifiedAt: at,
      daysAgo,
      method: newest.method,
      isFresh: false,
    };
  }

  if (isSameHawaiiDay(at, now)) {
    // A source check has no meaningful time of day, only the date it was read.
    const label =
      newest.method === "source_check"
        ? `${verb} TODAY`
        : `${verb} TODAY ${shortTime(hawaiiClock(at).minutes)}`;
    return {
      kind: "today",
      label,
      shortLabel: `${verb} TODAY`,
      verifiedAt: at,
      daysAgo: 0,
      method: newest.method,
      isFresh: true,
    };
  }

  const label = `${verb} ${shortDate(at)}`;
  return {
    kind: "dated",
    label,
    shortLabel: label,
    verifiedAt: at,
    daysAgo,
    method: newest.method,
    isFresh: true,
  };
}

// Opening hours ---------------------------------------------------------------

interface Session {
  /** Minutes since midnight of the reference day. May exceed 1440. */
  start: number;
  end: number;
}

/**
 * Sessions for one weekday, expressed relative to the reference day.
 * A session whose closing time is not after its opening time is read as
 * running past midnight, so a 6p-1a stall stays open at 12:30a.
 */
function sessionsOn(hours: OpeningHours[], dayOfWeek: number, dayOffset: number): Session[] {
  return hours
    .filter((entry) => entry.dayOfWeek === dayOfWeek)
    .map((entry) => {
      const start = minutesFromTime(entry.opens);
      const end = minutesFromTime(entry.closes);
      return {
        start: start + dayOffset * 1440,
        end: (end > start ? end : end + 1440) + dayOffset * 1440,
      };
    })
    .sort((a, b) => a.start - b.start);
}

function previousDay(dayOfWeek: number): number {
  return (dayOfWeek + 6) % 7;
}

/** The session covering `clock`, including one that started yesterday. */
function currentSession(hours: OpeningHours[], clock: HawaiiClock): Session | null {
  const candidates = [
    ...sessionsOn(hours, previousDay(clock.dayOfWeek), -1),
    ...sessionsOn(hours, clock.dayOfWeek, 0),
  ];
  return candidates.find((s) => clock.minutes >= s.start && clock.minutes < s.end) ?? null;
}

/** The next session starting later today, if any. */
function nextSessionToday(hours: OpeningHours[], clock: HawaiiClock): Session | null {
  return sessionsOn(hours, clock.dayOfWeek, 0).find((s) => s.start > clock.minutes) ?? null;
}

/** The next day this listing opens at all, searched a week ahead. */
function nextOpening(
  hours: OpeningHours[],
  clock: HawaiiClock,
): { dayOfWeek: number; start: number } | null {
  for (let offset = 1; offset <= 7; offset += 1) {
    const dayOfWeek = (clock.dayOfWeek + offset) % 7;
    const [session] = sessionsOn(hours, dayOfWeek, 0);
    if (session) return { dayOfWeek, start: session.start };
  }
  return null;
}

// Vendor status ---------------------------------------------------------------

export type VendorStatusKind = "open" | "opens_later" | "closed" | "sold_out" | "unconfirmed";

export interface VendorStatus {
  kind: VendorStatusKind;
  /** Default chip text, for example "OPEN · CLOSES 2P". */
  label: string;
  /** Chip text without the leading state, for pages that say it themselves. */
  detail: string | null;
  /** Closing time of the session in progress: "2P". */
  closesAt: string | null;
  /** Opening time of the next session: "3P". */
  opensAt: string | null;
  /** Weekday of that next session when it is not today: "Sat". */
  opensDay: string | null;
  /** Secondary chip text such as "REPORTED 1H AGO". */
  note: string | null;
  /** Whether this listing counts toward the "open now" numbers. */
  isOpenNow: boolean;
}

export interface VendorStatusInput {
  hours: OpeningHours[];
  verifications: VerificationEvent[];
  reports?: Report[];
}

/**
 * The status chip for a vendor.
 *
 * Most listings come from public sources that publish no hours at all. Those
 * read as LISTED: we have the stand, we do not have its hours, and inventing
 * an opening time would be the one thing this site exists not to do.
 *
 * Order matters. A same-day report wins outright, even on a listing nobody has
 * verified in 30 days: somebody stood there today and told us the stand sold
 * out, and that beats our own stale hours table. Staleness does not disappear,
 * it moves to the verification chip, which still reads UNCONFIRMED beside the
 * report. Only when there is no report does freshness gate the hours, because
 * without it we have nothing newer than a table we no longer trust.
 */
export function getStatus(input: VendorStatusInput, now: Date): VendorStatus {
  const report = todaysReport(input.reports ?? [], now);
  if (report) {
    const isSoldOut = report.kind === "sold_out";
    return {
      kind: isSoldOut ? "sold_out" : "closed",
      label: isSoldOut ? "SOLD OUT TODAY" : "CLOSED TODAY",
      detail: null,
      closesAt: null,
      opensAt: null,
      opensDay: null,
      note: `REPORTED ${relativeAgo(toDate(report.reportedAt), now)}`,
      isOpenNow: false,
    };
  }

  // No posted hours means nothing to compute, whatever the log says.
  if (input.hours.length === 0) {
    return {
      kind: "unconfirmed",
      label: "LISTED",
      detail: null,
      closesAt: null,
      opensAt: null,
      opensDay: null,
      note: null,
      isOpenNow: false,
    };
  }

  const freshness = getFreshness(input.verifications, now);

  if (!freshness.isFresh) {
    return {
      kind: "unconfirmed",
      label: "UNCONFIRMED",
      detail: null,
      closesAt: null,
      opensAt: null,
      opensDay: null,
      note: null,
      isOpenNow: false,
    };
  }

  return getHoursStatus(input.hours, now);
}

/**
 * Status from posted hours alone, with no freshness gate. The directory pages
 * print the checked date beside every chip, so the reader sees how old the
 * hours are; the older listing pages gate on freshness through getStatus.
 */
export function getHoursStatus(hours: OpeningHours[], now: Date): VendorStatus {
  if (hours.length === 0) {
    return {
      kind: "unconfirmed",
      label: "LISTED",
      detail: null,
      closesAt: null,
      opensAt: null,
      opensDay: null,
      note: null,
      isOpenNow: false,
    };
  }

  const clock = hawaiiClock(now);

  const open = currentSession(hours, clock);
  if (open) {
    const closesAt = shortTime(open.end);
    return {
      kind: "open",
      label: `OPEN · CLOSES ${closesAt}`,
      detail: `CLOSES ${closesAt}`,
      closesAt,
      opensAt: null,
      opensDay: null,
      note: null,
      isOpenNow: true,
    };
  }

  const later = nextSessionToday(hours, clock);
  if (later) {
    const opensAt = shortTime(later.start);
    return {
      kind: "opens_later",
      label: `OPENS ${opensAt}`,
      detail: `OPENS ${opensAt}`,
      closesAt: null,
      opensAt,
      opensDay: null,
      note: null,
      isOpenNow: false,
    };
  }

  const upcoming = nextOpening(hours, clock);
  if (!upcoming) {
    return {
      kind: "closed",
      label: "CLOSED",
      detail: null,
      closesAt: null,
      opensAt: null,
      opensDay: null,
      note: null,
      isOpenNow: false,
    };
  }

  const opensAt = shortTime(upcoming.start);
  const opensDay = dayName(upcoming.dayOfWeek);
  return {
    kind: "closed",
    label: `CLOSED · OPENS ${opensDay.toUpperCase()} ${opensAt}`,
    detail: `OPENS ${opensDay.toUpperCase()} ${opensAt}`,
    closesAt: null,
    opensAt,
    opensDay,
    note: null,
    isOpenNow: false,
  };
}

/** The newest report filed today in Hawaii that changes today's status. */
function todaysReport(reports: Report[], now: Date): Report | null {
  return reports
    .filter((report) => report.kind !== "changed")
    .filter((report) => {
      const at = toDate(report.reportedAt);
      return at <= now && isSameHawaiiDay(at, now);
    })
    .sort((a, b) => toDate(b.reportedAt).getTime() - toDate(a.reportedAt).getTime())[0] ?? null;
}

// Market status ---------------------------------------------------------------

export interface MarketSession {
  dayOfWeek: number;
  starts: string;
  ends: string;
}

export type MarketStatusKind = "on_now" | "starts_later" | "closed" | "unconfirmed";

export interface MarketStatus {
  kind: MarketStatusKind;
  /** "ON NOW · 1H 19M LEFT", "OPENS 6:30A", "CLOSED · SAT 6A". */
  label: string;
  minutesLeft: number | null;
  startsAt: string | null;
  isOnNow: boolean;
}

export interface MarketStatusInput {
  sessions: MarketSession[];
  verifications: VerificationEvent[];
}

/** The status chip for a market, including the countdown to closing. */
export function getMarketStatus(input: MarketStatusInput, now: Date): MarketStatus {
  const freshness = getFreshness(input.verifications, now);
  if (!freshness.isFresh) {
    return { kind: "unconfirmed", label: "UNCONFIRMED", minutesLeft: null, startsAt: null, isOnNow: false };
  }

  const hours: OpeningHours[] = input.sessions.map((session) => ({
    dayOfWeek: session.dayOfWeek,
    opens: session.starts,
    closes: session.ends,
  }));
  const clock = hawaiiClock(now);

  const running = currentSession(hours, clock);
  if (running) {
    const minutesLeft = running.end - clock.minutes;
    return {
      kind: "on_now",
      label: `ON NOW · ${duration(minutesLeft)} LEFT`,
      minutesLeft,
      startsAt: shortTime(running.start),
      isOnNow: true,
    };
  }

  const later = nextSessionToday(hours, clock);
  if (later) {
    const startsAt = shortTime(later.start);
    return { kind: "starts_later", label: `OPENS ${startsAt}`, minutesLeft: null, startsAt, isOnNow: false };
  }

  const upcoming = nextOpening(hours, clock);
  if (!upcoming) {
    return { kind: "closed", label: "CLOSED", minutesLeft: null, startsAt: null, isOnNow: false };
  }

  const startsAt = shortTime(upcoming.start);
  return {
    kind: "closed",
    label: `CLOSED · ${dayName(upcoming.dayOfWeek).toUpperCase()} ${startsAt}`,
    minutesLeft: null,
    startsAt,
    isOnNow: false,
  };
}

export interface MarketDate {
  /** Hawaii calendar date as YYYY-MM-DD. */
  date: string;
  dayOfWeek: number;
  isToday: boolean;
  /** "Today, Wed Aug 19" or "Sat Aug 22". */
  label: string;
  starts: string;
  ends: string;
}

/**
 * The next few market days, today included when a session has not ended yet.
 * Drives the NEXT DATES list.
 */
export function nextMarketDates(sessions: MarketSession[], now: Date, count = 3): MarketDate[] {
  const clock = hawaiiClock(now);
  const dates: MarketDate[] = [];

  // The horizon has to scale with the count. Every market on the site runs
  // once a week, so a fixed 14 day window could never return more than two
  // dates however many were asked for, and asking for four silently gave two.
  const horizon = Math.max(14, count * 7 + 1);

  for (let offset = 0; offset < horizon && dates.length < count; offset += 1) {
    const day = addDays(clock, offset);
    const todays = sessions
      .filter((session) => session.dayOfWeek === day.dayOfWeek)
      .sort((a, b) => minutesFromTime(a.starts) - minutesFromTime(b.starts));

    for (const session of todays) {
      if (dates.length >= count) break;
      const end = minutesFromTime(session.ends);
      // Skip a session that has already finished today.
      if (offset === 0 && end <= clock.minutes) continue;

      const stamp = `${day.year}-${pad(day.month)}-${pad(day.day)}`;
      const calendar = `${dayName(day.dayOfWeek)} ${monthAbbr(day.month, false)} ${day.day}`;
      dates.push({
        date: stamp,
        dayOfWeek: day.dayOfWeek,
        isToday: offset === 0,
        label: offset === 0 ? `Today, ${calendar}` : calendar,
        starts: session.starts,
        ends: session.ends,
      });
    }
  }

  return dates;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export interface WeekDay {
  /** Hawaii calendar date as YYYY-MM-DD. */
  date: string;
  dayOfWeek: number;
  isToday: boolean;
  /** "Today", "Tomorrow", then the weekday name. */
  label: string;
  /** "Thu Aug 27", for the smaller line beside the label. */
  dateLabel: string;
}

/**
 * The next `days` Hawaii calendar days, starting today.
 *
 * The markets listing is grouped by day rather than by open or closed the way
 * the vendor listings are. A People's Open Market site runs for one hour a
 * week, so "open now" is false for essentially all of them essentially all of
 * the time; grouping on it would render an empty page most hours of the week.
 * The useful question is which day to turn up on, so the day is the grouping
 * and open-now becomes a state inside today.
 */
export function hawaiiWeek(now: Date, days = 7): WeekDay[] {
  const clock = hawaiiClock(now);
  const week: WeekDay[] = [];

  for (let offset = 0; offset < days; offset += 1) {
    const day = addDays(clock, offset);
    week.push({
      date: `${day.year}-${pad(day.month)}-${pad(day.day)}`,
      dayOfWeek: day.dayOfWeek,
      isToday: offset === 0,
      label: offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : longDayName(day.dayOfWeek),
      dateLabel: `${dayName(day.dayOfWeek)} ${monthAbbr(day.month, false)} ${day.day}`,
    });
  }

  return week;
}

/** Calendar arithmetic on a Hawaii date, done in UTC so no zone shifts creep in. */
function addDays(clock: HawaiiClock, days: number) {
  const shifted = new Date(Date.UTC(clock.year, clock.month - 1, clock.day + days));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    dayOfWeek: shifted.getUTCDay(),
  };
}

// Sorting ---------------------------------------------------------------------

/** Open first, then the rest of today, then things we cannot vouch for. */
export const STATUS_RANK: Record<VendorStatusKind, number> = {
  open: 0,
  opens_later: 1,
  sold_out: 2,
  closed: 3,
  unconfirmed: 4,
};

export interface Sortable {
  status: VendorStatus;
  distanceMi?: number | null;
  name?: string;
}

/**
 * Sort order used by every result list: open first, then distance. Most real
 * listings have no distance yet, so name breaks the tie and the order stays
 * stable between renders instead of following whatever the database returned.
 */
export function byStatusThenDistance(a: Sortable, b: Sortable): number {
  const rank = STATUS_RANK[a.status.kind] - STATUS_RANK[b.status.kind];
  if (rank !== 0) return rank;

  const distance = (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity);
  if (distance !== 0 && Number.isFinite(distance)) return distance;

  return (a.name ?? "").localeCompare(b.name ?? "");
}
