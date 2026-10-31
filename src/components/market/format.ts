/**
 * Small pure helpers for the market and holiday fairs pages: date lines,
 * links out (directions, calendar) and plain-spelling titles.
 */

import { bodyRange, chipDate } from "@/lib/directory/status";
import type { MarketKind, Side } from "@/lib/directory/labels";
import type { MarketDate } from "@/lib/directory/types";
import type { Occurrence } from "@/lib/directory/status";
import type { IconName } from "@/components/sign/SignIcon";
import { dayName, hawaiiClock, icsStamp, longDayName, monthAbbr } from "@/lib/time";

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function dayOfWeekOf(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** "Sat Nov 7" for body copy. */
export function bodyDate(date: string): string {
  const [, month, day] = date.split("-").map(Number);
  return `${dayName(dayOfWeekOf(date))} ${monthAbbr(month, false)} ${day}`;
}

/** "Nov 7, 2026". */
export function bodyDateYear(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${monthAbbr(month, false)} ${day}, ${year}`;
}

/** "TODAY, SAT OCT 31", "TOMORROW, SUN NOV 1" or "SAT NOV 7". */
export function headlineDate(date: string, today: string): string {
  if (date === today) return `TODAY, ${chipDate(date)}`;
  if (date === addDays(today, 1)) return `TOMORROW, ${chipDate(date)}`;
  return chipDate(date);
}

/** "7:30a to 11a", or null when the hours are not posted. */
export function occurrenceTimes(o: Pick<Occurrence, "starts" | "ends" | "timePosted">): string | null {
  return o.timePosted && o.starts ? bodyRange(o.starts, o.ends) : null;
}

/** Wall clock "HH:MM" of a market_dates instant. */
export function wallTime(instant: Date): string {
  const minutes = hawaiiClock(instant).minutes;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** "9:30a to 2:30p" for a market_dates row, or null when not posted. */
export function dateTimes(d: MarketDate): string | null {
  return d.timePosted ? bodyRange(wallTime(d.startsAt), d.endsAt ? wallTime(d.endsAt) : null) : null;
}

/** "Saturdays", "Wednesdays". */
export function pluralDay(dayOfWeek: number): string {
  return `${longDayName(dayOfWeek)}s`;
}

/** Consecutive-day runs of dated occurrences, oldest first. */
export function splitRuns<T extends { date: string }>(dates: T[]): T[][] {
  const unique = dates.filter((d, i) => i === 0 || d.date !== dates[i - 1].date);
  const runs: T[][] = [];
  for (const d of unique) {
    const run = runs[runs.length - 1];
    if (run && d.date === addDays(run[run.length - 1].date, 1)) run.push(d);
    else runs.push([d]);
  }
  return runs;
}

/** Google Maps search link: the stored address, else coordinates, else the place name. */
export function directionsUrl(market: {
  name: string;
  address: string | null;
  venueName: string | null;
  locationNotes: string | null;
  area: string | null;
  lat: number | null;
  lng: number | null;
}): string {
  let query: string;
  if (market.address) query = market.address;
  else if (market.lat !== null && market.lng !== null) query = `${market.lat},${market.lng}`;
  else
    query = [market.venueName ?? market.locationNotes ?? market.name, market.area, "Oʻahu, HI"]
      .filter(Boolean)
      .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * A Google Calendar template link for one occurrence. Posted hours become a
 * timed event; a date without hours becomes an all-day entry.
 */
export function calendarUrl(
  occurrence: Pick<Occurrence, "date" | "startsAt" | "endsAt" | "timePosted">,
  details: { name: string; location: string | null; pageUrl: string },
): string {
  let dates: string;
  if (occurrence.timePosted && occurrence.startsAt) {
    const end = occurrence.endsAt ?? new Date(occurrence.startsAt.getTime() + 60 * 60_000);
    dates = `${icsStamp(occurrence.startsAt)}/${icsStamp(end)}`;
  } else {
    dates = `${occurrence.date.replace(/-/g, "")}/${addDays(occurrence.date, 1).replace(/-/g, "")}`;
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: details.name,
    dates,
    ctz: "Pacific/Honolulu",
    details: details.pageUrl,
  });
  if (details.location) params.set("location", details.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Plain spelling for titles: no ʻokina, no kahakō. Apostrophes stay. */
export function plainSpelling(text: string): string {
  return text
    .replace(/ʻ/g, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .normalize("NFC");
}

/** "hfbf.org" from a source URL, for the source line. */
export function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** "@islandwideexpos" or a full URL into an Instagram link. */
export function instagramUrl(handle: string): string {
  if (/^https?:\/\//.test(handle)) return handle;
  return `https://www.instagram.com/${handle.replace(/^@/, "").replace(/\/$/, "")}/`;
}

export function instagramLabel(handle: string): string {
  if (/^https?:\/\//.test(handle)) {
    const match = handle.match(/instagram\.com\/([^/?#]+)/);
    return match ? `@${match[1]}` : "Instagram";
  }
  return handle.startsWith("@") ? handle : `@${handle}`;
}

/** Heading for the "more on this side" block. */
export const MORE_ON_SIDE: Record<Side, string> = {
  town: "MORE IN TOWN",
  east: "MORE ON THE EAST SIDE",
  windward: "MORE ON THE WINDWARD SIDE",
  north_shore: "MORE ON THE NORTH SHORE",
  central: "MORE IN CENTRAL",
  leeward_ewa: "MORE IN LEEWARD AND ʻEWA",
};

/** The brush icon for a market kind. */
export function kindIcon(kind: MarketKind | null): IconName {
  switch (kind) {
    case "farmers_market":
      return "basket";
    case "farm_stand":
      return "bananas";
    case "u_pick":
      return "papaya";
    case "makers_market":
      return "earrings";
    case "night_market":
      return "lights";
    case "holiday_fair":
    case "craft_fair_annual":
      return "gift";
    case "swap_meet":
    case "flea_market":
      return "table";
    case "food_truck_park":
    case "food_truck_rally":
    case "brewery_truck_night":
      return "truck";
    case "plant_sale":
      return "plant";
    default:
      return "tent";
  }
}
