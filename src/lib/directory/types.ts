/**
 * Row shapes as PostgREST returns them (and as .local/snapshot.json stores
 * them), plus the joined shapes the pages use. Joined types carry only public
 * fields: publish_status, status, confidence and other internal columns stop
 * at the join.
 */

import type { MarketKind, Side } from "./labels";
import type { MarketSession, OpeningHours, VerificationMethod } from "../status";

// Raw rows --------------------------------------------------------------------

export interface IslandRow {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
}

export interface VendorRow {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  island_id: string | null;
  area: string | null;
  description: string | null;
  story: string | null;
  lat: number | string | null;
  lng: number | string | null;
  phone: string | null;
  contact_method: string | null;
  payment_notes: string | null;
  good_to_know: string | null;
  is_active: boolean | null;
  address: string | null;
  website: string | null;
  ships_mainland: boolean | null;
  source_url: string | null;
  fixed_or_roaming: string | null;
  instagram: string | null;
  facebook: string | null;
  accepts_snap: boolean | null;
  claimed_at: string | null;
  status: string | null;
  confidence: string | null;
  publish_status: string | null;
  side: string | null;
  neighborhood: string | null;
  made_where: string | null;
  icon_override: string | null;
  hours_note: string | null;
  schedule_source_url: string | null;
  order_url: string | null;
  source_label: string | null;
  payment_methods: string[] | null;
  tags: string[] | null;
  photo_url: string | null;
  photo_credit: string | null;
  photo_taken_at: string | null;
  aliases: string[] | null;
  brand: string | null;
}

export interface MarketRow {
  id: string;
  slug: string;
  name: string;
  island_id: string | null;
  area: string | null;
  description: string | null;
  location_notes: string | null;
  instagram: string | null;
  getting_there: string | null;
  is_active: boolean | null;
  lat: number | string | null;
  lng: number | string | null;
  operator: string | null;
  ebt_tokens: boolean | null;
  source_url: string | null;
  kind: string | null;
  organizer_id: string | null;
  venue_name: string | null;
  address: string | null;
  frequency: string | null;
  schedule_text: string | null;
  website: string | null;
  facebook: string | null;
  admission: string | null;
  parking_notes: string | null;
  vendor_count_est: number | null;
  vendor_application_url: string | null;
  booth_fee: string | null;
  accepts_snap: boolean | null;
  da_bux: boolean | null;
  dog_friendly: boolean | null;
  status: string | null;
  confidence: string | null;
  source_date: string | null;
  publish_status: string | null;
  side: string | null;
  neighborhood: string | null;
}

export interface OrganizerRow {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  vendor_application_url: string | null;
  public_contact: string | null;
  booth_fee_info: string | null;
  source_url: string | null;
}

export interface VendorHoursRow {
  id?: string;
  vendor_id: string;
  day_of_week: number;
  opens: string;
  closes: string;
}

export interface VendorProductRow {
  id?: string;
  vendor_id: string;
  label: string;
  note: string | null;
  in_season_until: string | null;
  sort_order: number | null;
  price_note: string | null;
}

export interface MarketSessionRow {
  id?: string;
  market_id: string;
  day_of_week: number;
  starts: string;
  ends: string;
}

export interface MarketVendorRow {
  market_id: string;
  vendor_id: string;
  stall: string | null;
  usual_days: string | null;
  confirmed_at?: string | null;
  sort_order: number | null;
  source_url?: string | null;
  seen_at?: string | null;
}

export interface MarketDateRow {
  id?: string;
  market_id: string;
  starts_at: string;
  ends_at: string | null;
  note: string | null;
  time_posted: boolean | null;
}

export interface PopupRow {
  id: string;
  name: string;
  vendor_id: string | null;
  market_id: string | null;
  starts_at: string;
  ends_at: string | null;
  location_note: string | null;
}

export interface VerificationEventRow {
  id?: string;
  subject_type: "vendor" | "market" | "popup" | string;
  subject_id: string;
  verified_at: string;
  method: VerificationMethod | string;
  note: string | null;
}

export interface VendorChannelRow {
  id?: string;
  vendor_id: string;
  kind: string;
  label: string;
  url: string | null;
  note: string | null;
  sort_order: number | null;
}

/** Every public table, keyed by table name. Same shape for REST and the snapshot file. */
export interface Tables {
  islands: IslandRow[];
  categories: CategoryRow[];
  vendors: VendorRow[];
  markets: MarketRow[];
  organizers: OrganizerRow[];
  vendor_hours: VendorHoursRow[];
  vendor_products: VendorProductRow[];
  market_sessions: MarketSessionRow[];
  market_vendors: MarketVendorRow[];
  market_dates: MarketDateRow[];
  popups: PopupRow[];
  verification_events: VerificationEventRow[];
  vendor_channels: VendorChannelRow[];
}

export const TABLE_NAMES: (keyof Tables)[] = [
  "islands",
  "categories",
  "vendors",
  "markets",
  "organizers",
  "vendor_hours",
  "vendor_products",
  "market_sessions",
  "market_vendors",
  "market_dates",
  "popups",
  "verification_events",
  "vendor_channels",
];

// Joined shapes ---------------------------------------------------------------

/** The newest check of a listing's source. Renders as "CHECKED OCT 23, 2026". */
export interface Checked {
  at: Date;
  /** "CHECKED OCT 23, 2026". */
  label: string;
  /** "Oct 23, 2026", for body copy. */
  date: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
}

export interface Product {
  label: string;
  note: string | null;
  inSeasonUntil: string | null;
  priceNote: string | null;
}

export interface Channel {
  kind: string;
  label: string;
  url: string | null;
  note: string | null;
}

export interface Organizer {
  slug: string;
  name: string;
  website: string | null;
  vendorApplicationUrl: string | null;
  publicContact: string | null;
  boothFeeInfo: string | null;
  sourceUrl: string | null;
}

/** One dated occurrence of a market, from market_dates. */
export interface MarketDate {
  /** Hawaii calendar date, YYYY-MM-DD. */
  date: string;
  startsAt: Date;
  endsAt: Date | null;
  /** False when the source gives the date but not the hours. */
  timePosted: boolean;
  note: string | null;
}

export interface VendorRef {
  id: string;
  slug: string;
  name: string;
  categorySlug: string | null;
  href: string | null;
}

export interface MarketRef {
  id: string;
  slug: string;
  name: string;
  kind: MarketKind | null;
  href: string;
}

/** A vendor's stand at a market, or the market's view of that vendor. */
export interface MarketVendorLink {
  stall: string | null;
  usualDays: string | null;
  seenAt: string | null;
  sourceUrl: string | null;
}

export interface DirectoryVendor {
  id: string;
  slug: string;
  name: string;
  /** Path of the public page, /[category]/[vendor]. Null when uncategorised. */
  href: string | null;
  brand: string | null;
  aliases: string[];
  category: Category | null;
  islandSlug: string | null;
  side: Side | null;
  sideName: string | null;
  area: string | null;
  neighborhood: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  description: string | null;
  story: string | null;
  goodToKnow: string | null;
  hoursNote: string | null;
  phone: string | null;
  contactMethod: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  orderUrl: string | null;
  sourceUrl: string | null;
  sourceLabel: string | null;
  scheduleSourceUrl: string | null;
  paymentMethods: string[];
  paymentNotes: string | null;
  acceptsSnap: boolean | null;
  shipsMainland: boolean | null;
  fixedOrRoaming: string | null;
  madeWhere: string | null;
  iconOverride: string | null;
  tags: string[];
  photo: { url: string; credit: string | null; takenAt: string | null } | null;
  claimed: boolean;
  hours: OpeningHours[];
  products: Product[];
  channels: Channel[];
  markets: (MarketRef & MarketVendorLink)[];
  checked: Checked | null;
}

export interface DirectoryMarket {
  id: string;
  slug: string;
  name: string;
  href: string;
  kind: MarketKind | null;
  kindLabel: string;
  islandSlug: string | null;
  side: Side | null;
  sideName: string | null;
  area: string | null;
  neighborhood: string | null;
  venueName: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  description: string | null;
  locationNotes: string | null;
  gettingThere: string | null;
  parkingNotes: string | null;
  admission: string | null;
  frequency: string | null;
  scheduleText: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  sourceUrl: string | null;
  operator: string | null;
  organizer: Organizer | null;
  /** The market's own application link, else the organizer's. */
  vendorApplicationUrl: string | null;
  boothFee: string | null;
  vendorCountEstimate: number | null;
  /** True when the source says SNAP/EBT is taken (accepts_snap or ebt_tokens). */
  takesSnap: boolean;
  daBux: boolean | null;
  dogFriendly: boolean | null;
  /** Weekly sessions. Empty for dated markets. */
  sessions: MarketSession[];
  /** Dated occurrences, oldest first. Empty for weekly markets. */
  dates: MarketDate[];
  vendors: (VendorRef & MarketVendorLink)[];
  checked: Checked | null;
}

export interface Directory {
  categories: Category[];
  vendors: DirectoryVendor[];
  markets: DirectoryMarket[];
}
