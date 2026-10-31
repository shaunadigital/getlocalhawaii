/**
 * Plain, serializable row data for MarketRow and VendorRow, so server pages
 * can hand rows to client components (the home board filters them in place).
 */

import type { Side } from "@/lib/directory/labels";
import type { ListingStatus, Occurrence } from "@/lib/directory/status";
import { minutesFromTime, shortTime } from "@/lib/time";

export interface RowStatus {
  tone: ListingStatus["tone"];
  label: string;
}

export interface MarketRowData {
  key: string;
  href: string;
  name: string;
  /** "Kailua", "Diamond Head". Null when not posted. */
  place: string | null;
  kindLabel: string;
  /** "7:30A", or null when the hours are not posted. */
  startLabel: string | null;
  /** "11a", or null. */
  endLabel: string | null;
  status: RowStatus | null;
  takesSnap: boolean;
  side: Side | null;
  /** Optional day over the time column when the row is not under a day heading: "SAT", "NOV 7", "TODAY". */
  dayLabel?: string | null;
  /** Optional time column text when there is no start time (default "Hours not posted"). */
  timeNote?: string | null;
  /** Optional bold line under the place: "2 honey vendors". */
  note?: string | null;
  /** Optional CHECKED line. */
  checked?: RowChecked | null;
}

export interface VendorRowData {
  key: string;
  href: string;
  name: string;
  /** "Fish · Kalihi". */
  detail: string | null;
  /** "Poke, ahi, smoked marlin". */
  products: string | null;
  status: RowStatus | null;
  side: Side | null;
  /** Optional bold text beside the chip: the market of the next appearance. */
  where?: string | null;
  /** Optional CHECKED line. */
  checked?: RowChecked | null;
}

/** "CHECKED OCT 23, 2026" with its ISO instant, serializable. */
export interface RowChecked {
  label: string;
  iso: string;
}

/** Shape a market occurrence (from getWeekend / getMarketsBetween) as a row. */
export function marketRowData(row: {
  market: {
    id: string;
    href: string;
    name: string;
    neighborhood: string | null;
    area: string | null;
    kindLabel: string;
    takesSnap: boolean;
    side: Side | null;
  };
  occurrence: Occurrence;
  status: ListingStatus | null;
}): MarketRowData {
  const { market, occurrence, status } = row;
  return {
    key: `${market.id}-${occurrence.date}-${occurrence.starts ?? "x"}`,
    href: market.href,
    name: market.name,
    place: market.neighborhood ?? market.area,
    kindLabel: market.kindLabel,
    startLabel: occurrence.starts ? shortTime(minutesFromTime(occurrence.starts)) : null,
    endLabel: occurrence.ends ? shortTime(minutesFromTime(occurrence.ends)).toLowerCase() : null,
    status: status ? { tone: status.tone, label: status.label } : null,
    takesSnap: market.takesSnap,
    side: market.side,
  };
}

/** Shape a vendor listing as a row. */
export function vendorRowData(vendor: {
  id: string;
  href: string | null;
  name: string;
  category: { name: string } | null;
  neighborhood: string | null;
  area: string | null;
  products: { label: string }[];
  status: ListingStatus;
  side: Side | null;
}): VendorRowData {
  const place = vendor.neighborhood ?? vendor.area;
  const detail = [vendor.category?.name, place].filter(Boolean).join(" · ") || null;
  const products = vendor.products.length
    ? vendor.products
        .slice(0, 4)
        .map((p, i) => (i === 0 ? p.label : p.label.toLowerCase()))
        .join(", ")
    : null;
  return {
    key: vendor.id,
    href: vendor.href ?? "#",
    name: vendor.name,
    detail,
    products,
    status: { tone: vendor.status.tone, label: vendor.status.label },
    side: vendor.side,
  };
}
