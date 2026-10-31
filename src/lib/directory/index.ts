/**
 * Directory data for the new pages. Server only: import from
 * "@/lib/directory". Client components import types and labels from
 * "@/lib/directory/labels", "@/lib/directory/types" or
 * "@/lib/directory/status" instead, which carry no loader.
 *
 * getDirectory() is deduped per request with React cache() and the REST
 * fetches sit in the Next data cache for 300 seconds. Everything that depends
 * on the clock takes `now` and is computed per request.
 */

import { cache } from "react";

import { hawaiiClock } from "../time";
import { buildDirectory } from "./join";
import { loadTables } from "./source";
import {
  type FairRun,
  type ListingStatus,
  type Occurrence,
  type WeekendDay,
  holidayFairRuns,
  marketStatus,
  nextOccurrence,
  occurrenceStatus,
  occurrencesBetween,
  vendorStatus,
  weekendDays,
} from "./status";
import type { Category, Directory, DirectoryMarket, DirectoryVendor } from "./types";

export * from "./labels";
export * from "./status";
export type * from "./types";

export interface VendorListing extends DirectoryVendor {
  status: ListingStatus;
}

export interface MarketListing extends DirectoryMarket {
  status: ListingStatus;
  /** The next occurrence not yet over, today included. */
  next: Occurrence | null;
}

export interface CategoryListing extends Category {
  vendorCount: number;
}

/** One market on one day, for day lists like "this weekend". */
export interface OccurrenceListing {
  market: MarketListing;
  occurrence: Occurrence;
  /** Null for a posted future day, where the time column says it all. */
  status: ListingStatus | null;
}

export interface WeekendDayListing extends WeekendDay {
  rows: OccurrenceListing[];
}

/** All public rows, joined. No status: call the helpers below for that. */
export const getDirectory = cache(async (): Promise<Directory> => buildDirectory(await loadTables(), new Date()));

export async function getVendors(now: Date): Promise<VendorListing[]> {
  const { vendors } = await getDirectory();
  return vendors.map((vendor) => ({ ...vendor, status: vendorStatus(vendor, now) }));
}

/** The vendor at /[category]/[vendor], or null. */
export async function getVendor(categorySlug: string, vendorSlug: string, now: Date): Promise<VendorListing | null> {
  const { vendors } = await getDirectory();
  const vendor = vendors.find((v) => v.slug === vendorSlug && v.category?.slug === categorySlug);
  return vendor ? { ...vendor, status: vendorStatus(vendor, now) } : null;
}

/** First vendor with this slug in any category, for redirects. */
export async function getVendorBySlug(vendorSlug: string, now: Date): Promise<VendorListing | null> {
  const { vendors } = await getDirectory();
  const vendor = vendors.find((v) => v.slug === vendorSlug);
  return vendor ? { ...vendor, status: vendorStatus(vendor, now) } : null;
}

function withMarketStatus(market: DirectoryMarket, now: Date): MarketListing {
  return { ...market, status: marketStatus(market, now), next: nextOccurrence(market, now) };
}

export async function getMarkets(now: Date): Promise<MarketListing[]> {
  const { markets } = await getDirectory();
  return markets.map((market) => withMarketStatus(market, now));
}

/** The market at /markets/[slug], or null. */
export async function getMarket(slug: string, now: Date): Promise<MarketListing | null> {
  const { markets } = await getDirectory();
  const market = markets.find((m) => m.slug === slug);
  return market ? withMarketStatus(market, now) : null;
}

/** Public categories ("other" and the legacy markets category left out), with vendor counts. */
export async function getCategories(): Promise<CategoryListing[]> {
  const { categories, vendors } = await getDirectory();
  return categories.map((category) => ({
    ...category,
    vendorCount: vendors.filter((v) => v.category?.id === category.id).length,
  }));
}

/** Markets happening between two Hawaii dates (YYYY-MM-DD, inclusive), one row per occurrence. */
export async function getMarketsBetween(from: string, to: string, now: Date): Promise<OccurrenceListing[]> {
  const markets = await getMarkets(now);
  return occurrencesBetween(markets, from, to).map(({ market, occurrence }) => ({
    market,
    occurrence,
    status: occurrenceStatus(occurrence, now),
  }));
}

/** Today plus the weekend days still ahead, each with its markets. */
export async function getWeekend(now: Date): Promise<WeekendDayListing[]> {
  const days = weekendDays(now);
  const rows = await getMarketsBetween(days[0].date, days[days.length - 1].date, now);
  return days.map((day) => ({ ...day, rows: rows.filter((row) => row.occurrence.date === day.date) }));
}

/** Upcoming holiday fairs, first run of each, soonest first. */
export async function getHolidayFairs(now: Date): Promise<FairRun<MarketListing>[]> {
  return holidayFairRuns(await getMarkets(now), now);
}

/** Today's Hawaii date, YYYY-MM-DD. */
export function hawaiiToday(now: Date): string {
  return hawaiiClock(now).date;
}
