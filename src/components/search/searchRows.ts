/**
 * Search hits shaped as the shared MarketRow and VendorRow data. Server side:
 * takes `now` for the day labels.
 */

import type { MarketRowData, RowChecked, VendorRowData } from "@/components/sign/rows";
import { vendorRowData } from "@/components/sign/rows";
import type { IconName } from "@/components/sign/SignIcon";
import type { Checked } from "@/lib/directory/types";
import type { MarketHit, SearchResults, VendorHit } from "@/lib/directory/search";
import { dayName, hawaiiClock, minutesFromTime, monthAbbr, shortTime } from "@/lib/time";

function rowChecked(checked: Checked | null): RowChecked | null {
  return checked ? { label: checked.label, iso: checked.at.toISOString() } : null;
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

/** "TODAY", "SAT" within the week, "NOV 7" further out. */
export function dayLabel(date: string, dayOfWeek: number, now: Date): string {
  const today = hawaiiClock(now).date;
  if (date === today) return "TODAY";
  const days = daysBetween(today, date);
  if (days > 0 && days < 7) return dayName(dayOfWeek).toUpperCase();
  const [, month, day] = date.split("-").map(Number);
  return `${monthAbbr(month)} ${day}`;
}

function plural(n: number, one: string): string {
  return `${n} ${one}${n === 1 ? "" : "s"}`;
}

export function vendorHitRow(hit: VendorHit, now: Date): VendorRowData {
  const base = vendorRowData({ ...hit.vendor, status: hit.status });
  const checked = rowChecked(hit.vendor.checked);
  if (!hit.next) return { ...base, checked };
  const { market, occurrence } = hit.next;
  const day = dayLabel(occurrence.date, occurrence.dayOfWeek, now);
  const time = occurrence.starts ? ` ${shortTime(minutesFromTime(occurrence.starts))}` : "";
  return {
    ...base,
    status: hit.status.isOpenNow ? base.status : { tone: "upcoming", label: `${day}${time}` },
    where: market.name,
    checked,
  };
}

/** `term` names what matched, for the "2 honey vendors" note. */
export function marketHitRow(hit: MarketHit, now: Date, term: string | null): MarketRowData {
  const { market, next, status } = hit;
  const showStatus = ["open", "later", "today_unposted"].includes(status.kind) || (!next && status.kind === "not_posted");
  return {
    key: market.id,
    href: market.href,
    name: market.name,
    place: market.neighborhood ?? market.area,
    kindLabel: market.kindLabel,
    dayLabel: next ? dayLabel(next.date, next.dayOfWeek, now) : null,
    startLabel: next?.starts ? shortTime(minutesFromTime(next.starts)) : null,
    endLabel: next?.ends ? shortTime(minutesFromTime(next.ends)).toLowerCase() : null,
    timeNote: next ? "Hours not posted" : "Next date not posted",
    status: showStatus && next ? { tone: status.tone, label: status.label } : null,
    takesSnap: market.takesSnap,
    side: market.side,
    note: hit.vendorMatches > 0 && term ? plural(hit.vendorMatches, `${term} vendor`) : null,
    checked: rowChecked(market.checked),
  };
}

const CATEGORY_ICONS: Record<string, IconName> = {
  lei: "lei",
  fish: "ahi",
  produce: "papaya",
  flowers: "flowers",
  plants: "plant",
  "food-producers": "honey",
  "prepared-food": "bread",
  "bath-body": "soap",
  "food-trucks": "truck",
  makers: "earrings",
  farms: "bananas",
  poi: "papaya",
};

const KIND_ICONS: Partial<Record<string, IconName>> = {
  farmers_market: "basket",
  night_market: "lights",
  makers_market: "earrings",
  holiday_fair: "gift",
  craft_fair_annual: "gift",
  farm_stand: "bananas",
  swap_meet: "table",
  flea_market: "table",
  food_truck_park: "truck",
  food_truck_rally: "truck",
  popup_series: "tent",
};

const WORD_ICONS: Record<string, IconName> = {
  honey: "honey",
  poke: "ahi",
  ahi: "ahi",
  sashimi: "ahi",
  fish: "ahi",
  coffee: "coffee",
  "shave ice": "shaveice",
  bread: "bread",
  soap: "soap",
  lei: "lei",
  flowers: "flowers",
  plants: "plant",
  papaya: "papaya",
  bananas: "bananas",
};

/** The round icon beside the heading, when one fits what was asked. */
export function headingIcon(results: SearchResults): IconName | null {
  const { intent } = results;
  if (intent.type === "category") return CATEGORY_ICONS[intent.category.slug] ?? null;
  if (intent.type === "kind") return KIND_ICONS[intent.kinds[0]] ?? null;
  if (intent.type === "place") return null;
  return WORD_ICONS[results.normalized] ?? null;
}
