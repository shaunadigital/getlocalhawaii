/**
 * Upcoming holiday and annual fair runs for /holiday-fairs, grouped by month.
 * A run is a stretch of consecutive dates; a fair with two weekends gives two
 * runs. A run drops off once its last day is past.
 */

import { dateTimes, dayOfWeekOf, splitRuns } from "@/components/market/format";
import type { MarketListing } from "@/lib/directory";
import { HOLIDAY_FAIR_KINDS, type MarketKind } from "@/lib/directory/labels";
import type { MarketDate } from "@/lib/directory/types";
import { dayName, monthAbbr } from "@/lib/time";

const LONG_MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

export const FAIR_PAGE_KINDS: MarketKind[] = [...HOLIDAY_FAIR_KINDS, "festival"];

export function isFairPageMarket(market: Pick<MarketListing, "kind" | "sessions">): boolean {
  return market.kind !== null && FAIR_PAGE_KINDS.includes(market.kind) && market.sessions.length === 0;
}

export interface FairRunRow {
  key: string;
  market: MarketListing;
  dates: MarketDate[];
  /** First and last date, YYYY-MM-DD. */
  first: string;
  last: string;
  /** "NOV" and "7". */
  month: string;
  day: string;
  /** "SAT", or "FRI TO SUN". */
  dayLabel: string;
  /** "9:30a to 2:30p", "Hours not posted" or "Hours differ by day". */
  timeLabel: string;
  /** True when today falls inside the run. */
  onToday: boolean;
}

export interface FairMonth {
  /** "2026-11" */
  key: string;
  /** "NOVEMBER", or "MARCH 2027" outside the current year. */
  label: string;
  rows: FairRunRow[];
}

function timeLabelFor(run: MarketDate[]): string {
  const times = run.map(dateTimes);
  if (times.every((t) => t === null)) return "Hours not posted";
  if (times.every((t) => t !== null && t === times[0])) return times[0]!;
  return run.length === 1 ? (times[0] ?? "Hours not posted") : "Hours differ by day";
}

export function fairRuns(markets: MarketListing[], today: string): FairRunRow[] {
  const rows: FairRunRow[] = [];
  for (const market of markets) {
    if (!isFairPageMarket(market)) continue;
    for (const run of splitRuns(market.dates)) {
      const last = run[run.length - 1].date;
      if (last < today) continue;
      const first = run[0].date;
      const [, month, day] = first.split("-").map(Number);
      const firstDay = dayName(dayOfWeekOf(first)).toUpperCase();
      rows.push({
        key: `${market.id}-${first}`,
        market,
        dates: run,
        first,
        last,
        month: monthAbbr(month),
        day: String(day),
        dayLabel: run.length > 1 ? `${firstDay} TO ${dayName(dayOfWeekOf(last)).toUpperCase()}` : firstDay,
        timeLabel: timeLabelFor(run),
        onToday: first <= today && today <= last,
      });
    }
  }
  return rows.sort((a, b) => a.first.localeCompare(b.first) || a.market.name.localeCompare(b.market.name));
}

export function groupByMonth(rows: FairRunRow[], today: string): FairMonth[] {
  const year = today.slice(0, 4);
  const months: FairMonth[] = [];
  for (const row of rows) {
    const key = row.first.slice(0, 7);
    let month = months.find((m) => m.key === key);
    if (!month) {
      const [y, mo] = key.split("-");
      month = { key, label: `${LONG_MONTHS[Number(mo) - 1]}${y === year ? "" : ` ${y}`}`, rows: [] };
      months.push(month);
    }
    month.rows.push(row);
  }
  return months;
}

/**
 * Fair-kind markets with no date ahead whose last date was in an earlier year
 * (or never posted): the next one is not posted yet. A fair already held this
 * year is simply over and drops off.
 */
export function fairsWithoutDates(markets: MarketListing[], today: string): { market: MarketListing; lastDate: string | null }[] {
  return markets
    .filter((m) => isFairPageMarket(m) && !m.dates.some((d) => d.date >= today))
    .map((m) => ({ market: m, lastDate: m.dates.length ? m.dates[m.dates.length - 1].date : null }))
    .filter((f) => !f.lastDate || f.lastDate.slice(0, 4) < today.slice(0, 4));
}
