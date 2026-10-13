/**
 * The site's data, bundled with the build.
 *
 * The listings are a few hundred read-only rows that change by hand, so they
 * ship as a JSON file instead of living in a hosted database. This module
 * builds the joined rows that queries.ts works with. Status is still computed
 * per request from these rows; nothing here is a stored status.
 *
 * To change a listing, edit src/data/site-data.json and deploy.
 */

import raw from "../data/site-data.json";

interface Named {
  id: string;
  slug: string;
  name: string;
}

interface VendorRecord {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  island_id: string;
  area: string;
  description: string | null;
  story: string | null;
  distance_mi: number | null;
  phone: string | null;
  contact_method: string;
  payment_notes: string | null;
  good_to_know: string | null;
  is_active: boolean;
  address: string | null;
  website: string | null;
  ships_mainland: boolean | null;
  source_url: string | null;
}

interface MarketRecord {
  id: string;
  slug: string;
  name: string;
  island_id: string;
  area: string;
  description: string | null;
  location_notes: string | null;
  instagram: string | null;
  getting_there: string | null;
  distance_mi: number | null;
  is_active: boolean;
  lat: number | null;
  lng: number | null;
  operator: string | null;
  ebt_tokens: boolean | null;
  source_url: string | null;
}

export interface HoursRecord {
  vendor_id: string;
  day_of_week: number;
  opens: string;
  closes: string;
}

export interface ProductRecord {
  vendor_id: string;
  label: string;
  note: string | null;
  in_season_until: string | null;
  sort_order: number;
}

export interface SessionRecord {
  market_id: string;
  day_of_week: number;
  starts: string;
  ends: string;
}

export interface MarketVendorRecord {
  market_id: string;
  vendor_id: string;
  stall: string | null;
  usual_days: string | null;
  confirmed_at: string | null;
  sort_order: number;
}

export interface PopupRecord {
  id: string;
  name: string;
  market_id: string | null;
  starts_at: string;
  ends_at: string | null;
  location_note: string | null;
  status: string;
}

export interface VerificationRecord {
  subject_type: string;
  subject_id: string;
  verified_at: string;
  method: string;
  note: string | null;
}

export interface ReportRecord {
  subject_type: string;
  subject_id: string;
  kind: string;
  note: string | null;
  reported_at: string;
}

interface SiteData {
  islands: Named[];
  categories: Named[];
  vendors: VendorRecord[];
  vendor_hours: HoursRecord[];
  vendor_products: ProductRecord[];
  markets: MarketRecord[];
  market_sessions: SessionRecord[];
  market_vendors: MarketVendorRecord[];
  popups: PopupRecord[];
  verification_events: VerificationRecord[];
  reports: ReportRecord[];
}

export const data = raw as unknown as SiteData;

function byId<T extends { id: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((row) => [row.id, row]));
}

function groupBy<T>(rows: T[], key: (row: T) => string): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const list = grouped.get(key(row)) ?? [];
    list.push(row);
    grouped.set(key(row), list);
  }
  return grouped;
}

const islandsById = byId(data.islands);
const categoriesById = byId(data.categories);
const vendorsById = byId(data.vendors);
const hoursByVendor = groupBy(data.vendor_hours, (row) => row.vendor_id);
const productsByVendor = groupBy(data.vendor_products, (row) => row.vendor_id);
const sessionsByMarket = groupBy(data.market_sessions, (row) => row.market_id);
const vendorsByMarket = groupBy(data.market_vendors, (row) => row.market_id);

function ref(row: Named | undefined): { slug: string; name: string } | null {
  return row ? { slug: row.slug, name: row.name } : null;
}

export interface VendorRow extends Omit<VendorRecord, "category_id" | "island_id" | "is_active"> {
  categories: { slug: string; name: string } | null;
  islands: { slug: string; name: string } | null;
  vendor_hours: HoursRecord[];
  vendor_products: ProductRecord[];
}

function joinVendor(record: VendorRecord): VendorRow {
  return {
    ...record,
    categories: ref(categoriesById.get(record.category_id)),
    islands: ref(islandsById.get(record.island_id)),
    vendor_hours: hoursByVendor.get(record.id) ?? [],
    vendor_products: productsByVendor.get(record.id) ?? [],
  };
}

export interface MarketRow extends Omit<MarketRecord, "island_id" | "is_active"> {
  islands: { slug: string; name: string } | null;
  market_sessions: SessionRecord[];
  market_vendors: (MarketVendorRecord & { vendors: VendorRow | null })[];
}

function joinMarket(record: MarketRecord): MarketRow {
  return {
    ...record,
    islands: ref(islandsById.get(record.island_id)),
    market_sessions: sessionsByMarket.get(record.id) ?? [],
    market_vendors: (vendorsByMarket.get(record.id) ?? []).map((entry) => {
      const vendor = vendorsById.get(entry.vendor_id);
      return { ...entry, vendors: vendor && vendor.is_active ? joinVendor(vendor) : null };
    }),
  };
}

/** Active vendors with their category, island, hours and products attached. */
export const vendorRows: VendorRow[] = data.vendors.filter((row) => row.is_active).map(joinVendor);

/** Active markets with their island, sessions and stall vendors attached. */
export const marketRows: MarketRow[] = data.markets.filter((row) => row.is_active).map(joinMarket);
