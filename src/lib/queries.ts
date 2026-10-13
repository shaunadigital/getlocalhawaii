/**
 * Data access. Every function takes the `now` the page is rendering against
 * and returns objects with status already computed, so pages never do clock
 * math themselves and every chip on a page agrees on the time.
 */

import { cache } from "react";

import {
  type Freshness,
  type MarketSession,
  type MarketStatus,
  type OpeningHours,
  type Report,
  type VendorStatus,
  type VerificationEvent,
  type VerificationMethod,
  type WeekDay,
  byStatusThenDistance,
  getFreshness,
  getMarketStatus,
  getStatus,
  hawaiiWeek,
} from "./status";
import { type QueryMatch, MARKETS_CATEGORY, resolveQuery } from "./search";
import { asciiSlug } from "./slug";
import { type VendorRow, data, marketRows, vendorRows } from "./db";
import { hawaiiClock, hawaiiDaysBetween, isSameHawaiiDay, minutesFromTime, toDate } from "./time";
import type { ContactMethod, VendorSummary } from "./types";

export interface Product {
  label: string;
  note: string | null;
  inSeasonUntil: string | null;
}

/**
 * Product labels are stored capitalised because they head their own chips on
 * the vendor page. Run together into a sentence they need to read as one:
 * "Poi, kalo, lūʻau leaf", not "Poi, Kalo, Lūʻau leaf".
 */
export function productSentence(products: Product[]): string {
  return products
    .map((product, index) => (index === 0 ? product.label : product.label.toLowerCase()))
    .join(", ");
}

export interface LogEntry {
  verifiedAt: Date;
  method: VerificationMethod;
  note: string | null;
}

/** Numeric fields are coerced defensively in case a hand edit stores a string. */
function toNumber(value: number | string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function hoursOf(row: VendorRow): OpeningHours[] {
  return row.vendor_hours.map((entry) => ({
    dayOfWeek: entry.day_of_week,
    opens: entry.opens,
    closes: entry.closes,
  }));
}

function productsOf(row: VendorRow): Product[] {
  return [...row.vendor_products]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((product) => ({
      label: product.label,
      note: product.note,
      inSeasonUntil: product.in_season_until,
    }));
}

/**
 * Verification events and reports are keyed by a polymorphic subject, so they
 * cannot be embedded in the vendor query. They are fetched in one batched call
 * per page and grouped here rather than one round trip per card.
 */
async function verificationsFor(
  subjectType: "vendor" | "market" | "popup",
  ids: string[],
): Promise<Map<string, VerificationEvent[]>> {
  const grouped = new Map<string, VerificationEvent[]>();
  if (ids.length === 0) return grouped;

  const wanted = new Set(ids);
  const rows = data.verification_events
    .filter((row) => row.subject_type === subjectType && wanted.has(row.subject_id))
    .sort((a, b) => toDate(b.verified_at).getTime() - toDate(a.verified_at).getTime());

  for (const row of rows) {
    const events = grouped.get(row.subject_id) ?? [];
    events.push({
      verifiedAt: row.verified_at,
      method: row.method as VerificationMethod,
      note: row.note,
    });
    grouped.set(row.subject_id, events);
  }
  return grouped;
}

async function reportsFor(
  subjectType: "vendor" | "market",
  ids: string[],
): Promise<Map<string, Report[]>> {
  const grouped = new Map<string, Report[]>();
  if (ids.length === 0) return grouped;

  const wanted = new Set(ids);
  const rows = data.reports
    .filter((row) => row.subject_type === subjectType && wanted.has(row.subject_id))
    .sort((a, b) => toDate(b.reported_at).getTime() - toDate(a.reported_at).getTime());

  for (const row of rows) {
    const reports = grouped.get(row.subject_id) ?? [];
    reports.push({
      kind: row.kind as Report["kind"],
      note: row.note,
      reportedAt: row.reported_at,
    });
    grouped.set(row.subject_id, reports);
  }
  return grouped;
}

function toSummary(
  row: VendorRow,
  events: VerificationEvent[],
  reports: Report[],
  now: Date,
): VendorSummary {
  const status = getStatus({ hours: hoursOf(row), verifications: events, reports }, now);

  // Surface the note from the report that actually changed today's status.
  const todaysReport = reports.find(
    (report) => report.kind !== "changed" && isSameHawaiiDay(toDate(report.reportedAt), now),
  );

  return {
    slug: row.slug,
    name: row.name,
    categorySlug: row.categories?.slug ?? "lei",
    description: row.description,
    area: row.area,
    distanceMi: toNumber(row.distance_mi),
    paymentNotes: row.payment_notes,
    phone: row.phone,
    contactMethod: row.contact_method as ContactMethod,
    shipsMainland: row.ships_mainland,
    productLabels: row.vendor_products.map((product) => product.label),
    status,
    freshness: getFreshness(events, now),
    reportNote:
      status.kind === "sold_out" || status.kind === "closed" ? (todaysReport?.note ?? null) : null,
  };
}

/** Attach status to a page of vendor rows in one pass, sorted for display. */
async function summarize(rows: VendorRow[], now: Date): Promise<VendorSummary[]> {
  const ids = rows.map((row) => row.id);
  const [events, reports] = await Promise.all([
    verificationsFor("vendor", ids),
    reportsFor("vendor", ids),
  ]);

  return rows
    .map((row) => toSummary(row, events.get(row.id) ?? [], reports.get(row.id) ?? [], now))
    .sort(byStatusThenDistance);
}

// Listings --------------------------------------------------------------------

export interface ListingStats {
  total: number;
  openNow: number;
  verifiedThisWeek: number;
}

export interface CategoryListing {
  categoryName: string;
  islandName: string;
  vendors: VendorSummary[];
  stats: ListingStats;
  /** Neighbourhood counts for the BY AREA block. */
  areas: { area: string; count: number }[];
  /** The most common product labels, offered as filter chips. */
  products: string[];
}

function statsFor(vendors: VendorSummary[]): ListingStats {
  return {
    total: vendors.length,
    openNow: vendors.filter((vendor) => vendor.status.isOpenNow).length,
    verifiedThisWeek: vendors.filter(
      (vendor) => vendor.freshness.daysAgo !== null && vendor.freshness.daysAgo <= 7,
    ).length,
  };
}

async function fetchVendors(filter: {
  categorySlug?: string;
  islandSlug?: string;
  /** Exclude placeholder listings that carry no source. */
  sourcedOnly?: boolean;
}): Promise<VendorRow[]> {
  return vendorRows.filter(
    (row) =>
      (!filter.categorySlug || row.categories?.slug === filter.categorySlug) &&
      (!filter.islandSlug || row.islands?.slug === filter.islandSlug) &&
      (!filter.sourcedOnly || row.source_url !== null),
  );
}

/** Category results page: every vendor in one category on one island. */
export async function getCategoryListing(
  islandSlug: string,
  categorySlug: string,
  now: Date,
): Promise<CategoryListing | null> {
  const rows = await fetchVendors({ categorySlug, islandSlug });
  if (rows.length === 0) return null;

  const vendors = await summarize(rows, now);

  const counts = new Map<string, number>();
  for (const vendor of vendors) {
    counts.set(vendor.area, (counts.get(vendor.area) ?? 0) + 1);
  }

  return {
    categoryName: rows[0].categories?.name ?? categorySlug,
    islandName: rows[0].islands?.name ?? islandSlug,
    vendors,
    stats: statsFor(vendors),
    areas: [...counts.entries()]
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count || a.area.localeCompare(b.area)),
    products: topProducts(vendors),
  };
}

/** Product labels shared by more than one vendor, so a chip narrows something. */
function topProducts(vendors: VendorSummary[], limit = 3): string[] {
  const counts = new Map<string, number>();
  for (const vendor of vendors) {
    for (const label of vendor.productLabels) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label]) => label);
}

export interface AnswerList {
  vendors: VendorSummary[];
  stats: ListingStats;
  /** What the query was understood to mean, for the results copy. */
  match: QueryMatch;
  /** Every area with listings, for the location control. */
  areas: { slug: string; name: string; count: number }[];
  /** Categories and product labels, for the subject control's suggestions. */
  subjects: string[];
}

export interface AnswerQuery {
  /** What they are looking for. */
  q?: string;
  /** Area slug, from the location control. */
  near?: string;
  /** "open" narrows to what is open right now. */
  when?: string;
}

/**
 * Home page answers.
 *
 * Real natural language parsing is still out of scope. The subject is matched
 * against lei types first, then categories, then product labels, so "pikake"
 * finds the shops that list it and can also point at the page written about
 * it. An unmatched subject returns nothing rather than everything.
 */
export async function getAnswers(input: AnswerQuery, now: Date): Promise<AnswerList> {
  const [labels, categories] = await Promise.all([productLabels(), categoryList()]);

  const match = resolveQuery(input.q, categories, labels);

  // Search answers only from listings that carry a source. The placeholder
  // market vendors are noindexed for the same reason and should not be the
  // answer to anything a person typed.
  const rows = await fetchVendors({
    sourcedOnly: true,
    ...(match.kind === "category" ? { categorySlug: match.slug } : {}),
  });
  let vendors = await summarize(rows, now);

  // Everything with listings, counted before the filters narrow it, so the
  // location control still offers areas the current query has ruled out.
  const areas = areaOptions(vendors);

  // A markets query has no vendor answer; the page links out to the listing.
  if (match.kind === "none" || match.kind === "markets") vendors = [];
  if (match.kind === "leiType" || match.kind === "product") {
    const wanted = match.kind === "leiType" ? match.slug : asciiSlug(match.label);
    vendors = vendors.filter((vendor) =>
      vendor.productLabels.some((label) => asciiSlug(label) === wanted),
    );
  }

  if (input.near) {
    vendors = vendors.filter((vendor) => asciiSlug(vendor.area) === input.near);
  }
  if (input.when === "open") {
    vendors = vendors.filter((vendor) => vendor.status.isOpenNow);
  }

  return {
    vendors,
    stats: statsFor(vendors),
    match,
    areas,
    subjects: [...categories.map((category) => category.name), ...labels].sort((a, b) =>
      a.localeCompare(b),
    ),
  };
}

function areaOptions(vendors: VendorSummary[]) {
  const counts = new Map<string, { name: string; count: number }>();
  for (const vendor of vendors) {
    const slug = asciiSlug(vendor.area);
    const entry = counts.get(slug) ?? { name: vendor.area, count: 0 };
    entry.count += 1;
    counts.set(slug, entry);
  }
  return [...counts.entries()]
    .map(([slug, entry]) => ({ slug, ...entry }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

async function categoryList(): Promise<{ slug: string; name: string }[]> {
  return data.categories.map(({ slug, name }) => ({ slug, name }));
}

async function productLabels(): Promise<string[]> {
  return [...new Set(data.vendor_products.map((row) => row.label))].sort((a, b) => a.localeCompare(b));
}

// Vendor detail ---------------------------------------------------------------

export interface VendorDetail extends VendorSummary {
  story: string | null;
  goodToKnow: string | null;
  address: string | null;
  website: string | null;
  sourceUrl: string | null;
  islandSlug: string;
  islandName: string;
  categoryName: string;
  hours: OpeningHours[];
  products: Product[];
  log: LogEntry[];
  nearby: VendorSummary[];
}

export async function getVendorDetail(
  categorySlug: string,
  slug: string,
  now: Date,
): Promise<VendorDetail | null> {
  const row = vendorRows.find((vendor) => vendor.slug === slug);
  if (!row) return null;
  if (row.categories?.slug !== categorySlug) return null;

  const [events, reports] = await Promise.all([
    verificationsFor("vendor", [row.id]),
    reportsFor("vendor", [row.id]),
  ]);
  const vendorEvents = events.get(row.id) ?? [];

  const summary = toSummary(row, vendorEvents, reports.get(row.id) ?? [], now);

  // Related listings: same island and category, excluding this one. Imported
  // vendors carry no distance, so proximity cannot be claimed; same area is
  // the closest honest proxy, and name keeps the order stable after that.
  const siblings = await fetchVendors({
    categorySlug,
    islandSlug: row.islands?.slug,
  });
  const nearby = (await summarize(siblings.filter((sibling) => sibling.id !== row.id), now))
    .sort((a, b) => {
      const sameArea = Number(b.area === row.area) - Number(a.area === row.area);
      if (sameArea !== 0) return sameArea;
      const distance = (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity);
      if (distance !== 0 && Number.isFinite(distance)) return distance;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 2);

  return {
    ...summary,
    story: row.story,
    goodToKnow: row.good_to_know,
    address: row.address,
    website: row.website,
    sourceUrl: row.source_url,
    islandSlug: row.islands?.slug ?? "",
    islandName: row.islands?.name ?? "",
    categoryName: row.categories?.name ?? "",
    hours: hoursOf(row),
    products: productsOf(row),
    log: vendorEvents.map((event) => ({
      verifiedAt: toDate(event.verifiedAt),
      method: event.method,
      note: event.note ?? null,
    })),
    nearby,
  };
}

export async function getVendorSlugs(
  options: { sourcedOnly?: boolean } = {},
): Promise<{ category: string; slug: string }[]> {
  // A listing without a source is a placeholder, and placeholders stay out of
  // the sitemap for the same reason they are noindexed.
  return vendorRows
    .filter((row) => !options.sourcedOnly || row.source_url !== null)
    .map((row) => ({
      category: row.categories?.slug ?? "",
      slug: row.slug,
    }))
    .filter((entry) => entry.category !== "");
}

// Market listing --------------------------------------------------------------

type MarketListRow = (typeof marketRows)[number];

export interface MarketSummary {
  slug: string;
  name: string;
  area: string;
  description: string | null;
  locationNotes: string | null;
  gettingThere: string | null;
  operator: string | null;
  /** Only some People's Open Market sites hand out EBT tokens. */
  ebtTokens: boolean | null;
  lat: number | null;
  lng: number | null;
  sourceUrl: string | null;
  distanceMi: number | null;
  status: MarketStatus;
  freshness: Freshness;
  sessions: MarketSession[];
}

/** One market on one day of the week, which is what the listing renders. */
export interface MarketOccurrence {
  market: MarketSummary;
  starts: string;
  ends: string;
  /** Today only: this session has already finished. */
  hasEnded: boolean;
}

export interface MarketDayGroup extends WeekDay {
  occurrences: MarketOccurrence[];
}

export interface MarketListing {
  islandName: string;
  markets: MarketSummary[];
  week: MarketDayGroup[];
  stats: { total: number; onNow: number; today: number };
  /** The next day that has a market, for when today has none left. */
  nextDay: MarketDayGroup | null;
}

function toMarketSummary(row: MarketListRow, events: VerificationEvent[], now: Date): MarketSummary {
  const sessions: MarketSession[] = row.market_sessions.map((session) => ({
    dayOfWeek: session.day_of_week,
    starts: session.starts,
    ends: session.ends,
  }));

  return {
    slug: row.slug,
    name: row.name,
    area: row.area,
    description: row.description,
    locationNotes: row.location_notes,
    gettingThere: row.getting_there,
    operator: row.operator,
    ebtTokens: row.ebt_tokens,
    lat: toNumber(row.lat),
    lng: toNumber(row.lng),
    sourceUrl: row.source_url,
    distanceMi: toNumber(row.distance_mi),
    status: getMarketStatus({ sessions, verifications: events }, now),
    freshness: getFreshness(events, now),
    sessions,
  };
}

/**
 * The markets listing, grouped by day rather than by open or closed.
 *
 * A People's Open Market site is open for one hour a week, so an "open now"
 * grouping would leave the page empty for all but a few hours of the week.
 * The question a person actually has is which day to turn up on.
 */
export async function getMarketListing(
  islandSlug: string,
  now: Date,
): Promise<MarketListing | null> {
  // A market with no source is a placeholder, held to the same bar as the
  // vendor listings: out of the listing, out of search, out of the sitemap.
  const rows = marketRows.filter(
    (row) => row.source_url !== null && row.islands?.slug === islandSlug,
  );
  if (rows.length === 0) return null;

  const events = await verificationsFor(
    "market",
    rows.map((row) => row.id),
  );

  const markets = rows
    .map((row) => toMarketSummary(row, events.get(row.id) ?? [], now))
    .sort((a, b) => a.name.localeCompare(b.name));

  const clock = hawaiiClock(now);

  const week: MarketDayGroup[] = hawaiiWeek(now).map((day) => {
    const occurrences: MarketOccurrence[] = [];

    for (const market of markets) {
      for (const session of market.sessions) {
        if (session.dayOfWeek !== day.dayOfWeek) continue;
        occurrences.push({
          market,
          starts: session.starts,
          ends: session.ends,
          hasEnded: day.isToday && minutesFromTime(session.ends) <= clock.minutes,
        });
      }
    }

    occurrences.sort(
      (a, b) =>
        minutesFromTime(a.starts) - minutesFromTime(b.starts) ||
        a.market.name.localeCompare(b.market.name),
    );

    return { ...day, occurrences };
  });

  const today = week[0];
  const stillToCome = today.occurrences.filter((entry) => !entry.hasEnded);

  return {
    islandName: rows[0].islands?.name ?? islandSlug,
    markets,
    week,
    stats: {
      total: markets.length,
      onNow: markets.filter((market) => market.status.isOnNow).length,
      today: today.occurrences.length,
    },
    nextDay:
      stillToCome.length > 0
        ? today
        : (week.slice(1).find((day) => day.occurrences.length > 0) ?? null),
  };
}

export const loadMarketListing = cache(async (islandSlug: string) => {
  const now = new Date();
  return { now, listing: await getMarketListing(islandSlug, now) };
});

// Market detail ---------------------------------------------------------------

export interface MarketVendor {
  slug: string;
  name: string;
  categorySlug: string;
  stall: string | null;
  usualDays: string | null;
  /** Confirmed on site today, with the time: "CONFIRMED 7:02A". */
  confirmedAt: Date | null;
  isHereToday: boolean;
  products: Product[];
  paymentNotes: string | null;
}

export interface Popup {
  name: string;
  locationNote: string | null;
  startsAt: Date;
  endsAt: Date | null;
  status: "verified" | "unconfirmed";
  freshness: Freshness;
}

export interface MarketDetail {
  slug: string;
  name: string;
  area: string;
  islandName: string;
  description: string | null;
  locationNotes: string | null;
  instagram: string | null;
  gettingThere: string | null;
  distanceMi: number | null;
  operator: string | null;
  ebtTokens: boolean | null;
  lat: number | null;
  lng: number | null;
  sourceUrl: string | null;
  status: MarketStatus;
  freshness: Freshness;
  sessions: MarketSession[];
  vendors: MarketVendor[];
  popups: Popup[];
  log: LogEntry[];
}

export async function getMarketDetail(slug: string, now: Date): Promise<MarketDetail | null> {
  const row = marketRows.find((market) => market.slug === slug);
  if (!row) return null;

  const sessions: MarketSession[] = row.market_sessions.map((session) => ({
    dayOfWeek: session.day_of_week,
    starts: session.starts,
    ends: session.ends,
  }));

  const events = (await verificationsFor("market", [row.id])).get(row.id) ?? [];

  const vendors: MarketVendor[] = row.market_vendors
    .filter((entry) => entry.vendors !== null)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((entry) => {
      const vendor = entry.vendors!;
      const confirmedAt = entry.confirmed_at ? toDate(entry.confirmed_at) : null;
      return {
        slug: vendor.slug,
        name: vendor.name,
        categorySlug: vendor.categories?.slug ?? "",
        stall: entry.stall,
        usualDays: entry.usual_days,
        confirmedAt,
        // Only a confirmation from today means someone saw them at the stall.
        isHereToday: confirmedAt !== null && isSameHawaiiDay(confirmedAt, now),
        paymentNotes: vendor.payment_notes,
        products: [...vendor.vendor_products]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((product) => ({
            label: product.label,
            note: product.note,
            inSeasonUntil: product.in_season_until,
          })),
      };
    });

  return {
    slug: row.slug,
    name: row.name,
    area: row.area,
    islandName: row.islands?.name ?? "",
    description: row.description,
    locationNotes: row.location_notes,
    instagram: row.instagram,
    gettingThere: row.getting_there,
    distanceMi: toNumber(row.distance_mi),
    operator: row.operator,
    ebtTokens: row.ebt_tokens,
    lat: toNumber(row.lat),
    lng: toNumber(row.lng),
    sourceUrl: row.source_url,
    status: getMarketStatus({ sessions, verifications: events }, now),
    freshness: getFreshness(events, now),
    sessions,
    vendors,
    popups: await getPopups(row.id, now),
    log: events.map((event) => ({
      verifiedAt: toDate(event.verifiedAt),
      method: event.method,
      note: event.note ?? null,
    })),
  };
}

/**
 * Pop-ups at one market in the next week, verified or not.
 *
 * Scoped to the market on purpose. This used to return every pop-up on the
 * site, which was invisible while there was one market and became a lie the
 * moment there were eighteen: a market page would list a fish drop happening
 * somewhere else entirely under its own "pop-ups this week".
 */
async function getPopups(marketId: string, now: Date): Promise<Popup[]> {
  const weekOut = new Date(now.getTime() + 7 * 86_400_000);

  const rows = data.popups
    .filter((popup) => {
      if (popup.market_id !== marketId) return false;
      const startsAt = toDate(popup.starts_at).getTime();
      return startsAt >= now.getTime() && startsAt <= weekOut.getTime();
    })
    .sort((a, b) => toDate(a.starts_at).getTime() - toDate(b.starts_at).getTime());
  const events = await verificationsFor(
    "popup",
    rows.map((popup) => popup.id),
  );

  return rows.map((popup) => ({
    name: popup.name,
    locationNote: popup.location_note,
    startsAt: toDate(popup.starts_at),
    endsAt: popup.ends_at ? toDate(popup.ends_at) : null,
    status: popup.status === "verified" ? "verified" : "unconfirmed",
    freshness: getFreshness(events.get(popup.id) ?? [], now),
  }));
}

export async function getMarketSlugs(options: { sourcedOnly?: boolean } = {}): Promise<string[]> {
  return marketRows
    .filter((row) => !options.sourcedOnly || row.source_url !== null)
    .map((row) => row.slug);
}

export const loadMarket = cache(async (slug: string) => {
  const now = new Date();
  return { now, market: await getMarketDetail(slug, now) };
});

/** Days since a verification, for the freshness explainer copy. */
export function daysSince(event: LogEntry, now: Date): number {
  return hawaiiDaysBetween(event.verifiedAt, now);
}

export type { VendorStatus, Freshness, QueryMatch };
export { MARKETS_CATEGORY };

/**
 * Island and category slugs share the first URL segment: /oahu/lei is a
 * category listing, /lei/napua-lei-stand is a vendor. The route needs to know
 * which one it is looking at.
 */
export async function getSlugSets(): Promise<{ islands: Set<string>; categories: Set<string> }> {
  return {
    islands: new Set(data.islands.map((row) => row.slug)),
    categories: new Set(data.categories.map((row) => row.slug)),
  };
}

/**
 * Request-scoped loaders.
 *
 * generateMetadata and the page body both need the same row. These memoise
 * per request, and
 * they own the `now` they render against so both callers agree on the instant
 * rather than each taking its own clock reading.
 */
export const loadVendor = cache(async (categorySlug: string, slug: string) => {
  const now = new Date();
  return { now, vendor: await getVendorDetail(categorySlug, slug, now) };
});

export const loadCategory = cache(async (islandSlug: string, categorySlug: string) => {
  const now = new Date();
  return { now, listing: await getCategoryListing(islandSlug, categorySlug, now) };
});
