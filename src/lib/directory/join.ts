/**
 * Joins the raw public tables into the shapes pages use. Pure: no fetch, no
 * clock beyond the `now` passed in (a check dated after `now` is ignored).
 */

import { hawaiiClock, hawaiiDate, monthAbbr, toDate } from "../time";
import {
  HIDDEN_CATEGORY_SLUGS,
  CATEGORY_ORDER,
  SIDE_NAMES,
  isSide,
  kindLabel,
  marketHref,
  vendorHref,
  type MarketKind,
  MARKET_KINDS,
} from "./labels";
import type {
  Category,
  Checked,
  Directory,
  DirectoryMarket,
  DirectoryVendor,
  MarketDate,
  MarketRow,
  Tables,
  VendorRow,
  VerificationEventRow,
} from "./types";

/** Methods that count as reading or confirming a listing's source. */
const CHECK_METHODS = new Set(["source_check", "called", "visited", "organizer_confirmed"]);

/** Published and not closed. RLS already does this; this is the second lock. */
export function isPublicRow(row: { publish_status: string | null; status: string | null; is_active?: boolean | null }): boolean {
  return row.publish_status === "published" && row.status !== "closed" && row.is_active !== false;
}

function groupBy<T>(rows: T[], key: (row: T) => string | null | undefined): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const k = key(row);
    if (!k) continue;
    const list = map.get(k);
    if (list) list.push(row);
    else map.set(k, [row]);
  }
  return map;
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function blank(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function list(value: string[] | null | undefined): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim() !== "") : [];
}

/**
 * The newest check among a subject's verification events, as the CHECKED
 * line, with the year as the boards show it ("CHECKED OCT 23, 2026"). Every
 * method renders the word CHECKED; the site never says verified.
 * A "no_answer" event is not a check and is ignored.
 */
export function checkedFrom(events: VerificationEventRow[], now: Date): Checked | null {
  let newest: Date | null = null;
  for (const event of events) {
    if (!CHECK_METHODS.has(event.method)) continue;
    const at = toDate(event.verified_at);
    if (Number.isNaN(at.getTime()) || at > now) continue;
    if (newest === null || at > newest) newest = at;
  }
  if (newest === null) return null;

  const clock = hawaiiClock(newest);
  const upper = `${monthAbbr(clock.month)} ${clock.day}, ${clock.year}`;
  const sentence = `${monthAbbr(clock.month, false)} ${clock.day}, ${clock.year}`;
  return { at: newest, label: `CHECKED ${upper}`, date: sentence };
}

function asKind(kind: string | null): MarketKind | null {
  return kind && (MARKET_KINDS as readonly string[]).includes(kind) ? (kind as MarketKind) : null;
}

/** Categories that get a public page, in the decided order. */
export function publicCategories(rows: Tables["categories"]): Category[] {
  const rank = (slug: string) => {
    const index = (CATEGORY_ORDER as readonly string[]).indexOf(slug);
    return index === -1 ? CATEGORY_ORDER.length : index;
  };
  return rows
    .filter((row) => !HIDDEN_CATEGORY_SLUGS.has(row.slug))
    .map((row) => ({ id: row.id, slug: row.slug, name: row.name }))
    .sort((a, b) => rank(a.slug) - rank(b.slug) || a.name.localeCompare(b.name));
}

export function buildDirectory(tables: Tables, now: Date): Directory {
  const categories = publicCategories(tables.categories);
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const islandById = new Map(tables.islands.map((i) => [i.id, i]));
  const organizerById = new Map(tables.organizers.map((o) => [o.id, o]));

  // A vendor in a hidden category ("other") has no public page, so it is not public.
  const vendorRows = tables.vendors.filter(
    (row) => isPublicRow(row) && (row.category_id === null || categoryById.has(row.category_id)),
  );
  const marketRows = tables.markets.filter((row) => isPublicRow(row));
  const vendorIds = new Set(vendorRows.map((v) => v.id));
  const marketIds = new Set(marketRows.map((m) => m.id));

  const hoursBy = groupBy(tables.vendor_hours, (r) => r.vendor_id);
  const productsBy = groupBy(tables.vendor_products, (r) => r.vendor_id);
  const channelsBy = groupBy(tables.vendor_channels, (r) => r.vendor_id);
  const sessionsBy = groupBy(tables.market_sessions, (r) => r.market_id);
  const datesBy = groupBy(tables.market_dates, (r) => r.market_id);
  const links = tables.market_vendors.filter((l) => vendorIds.has(l.vendor_id) && marketIds.has(l.market_id));
  const linksByVendor = groupBy(links, (r) => r.vendor_id);
  const linksByMarket = groupBy(links, (r) => r.market_id);
  const vendorChecks = groupBy(
    tables.verification_events.filter((e) => e.subject_type === "vendor"),
    (e) => e.subject_id,
  );
  const marketChecks = groupBy(
    tables.verification_events.filter((e) => e.subject_type === "market"),
    (e) => e.subject_id,
  );

  const vendorRef = (row: VendorRow) => {
    const category = row.category_id ? categoryById.get(row.category_id) ?? null : null;
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      categorySlug: category?.slug ?? null,
      href: category ? vendorHref(category.slug, row.slug) : null,
    };
  };
  const marketRef = (row: MarketRow) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    kind: asKind(row.kind),
    href: marketHref(row.slug),
  });
  const vendorById = new Map(vendorRows.map((v) => [v.id, v]));
  const marketById = new Map(marketRows.map((m) => [m.id, m]));
  const bySort = <T extends { sort_order: number | null }>(a: T, b: T) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

  const vendors: DirectoryVendor[] = vendorRows.map((row) => {
    const category = row.category_id ? categoryById.get(row.category_id) ?? null : null;
    const side = isSide(row.side) ? row.side : null;
    return {
      ...vendorRef(row),
      brand: blank(row.brand),
      aliases: list(row.aliases),
      category,
      islandSlug: row.island_id ? islandById.get(row.island_id)?.slug ?? null : null,
      side,
      sideName: side ? SIDE_NAMES[side] : null,
      area: blank(row.area),
      neighborhood: blank(row.neighborhood),
      address: blank(row.address),
      lat: toNumber(row.lat),
      lng: toNumber(row.lng),
      description: blank(row.description),
      story: blank(row.story),
      goodToKnow: blank(row.good_to_know),
      hoursNote: blank(row.hours_note),
      phone: blank(row.phone),
      contactMethod: blank(row.contact_method),
      website: blank(row.website),
      instagram: blank(row.instagram),
      facebook: blank(row.facebook),
      orderUrl: blank(row.order_url),
      sourceUrl: blank(row.source_url),
      sourceLabel: blank(row.source_label),
      scheduleSourceUrl: blank(row.schedule_source_url),
      paymentMethods: list(row.payment_methods),
      paymentNotes: blank(row.payment_notes),
      acceptsSnap: row.accepts_snap,
      shipsMainland: row.ships_mainland,
      fixedOrRoaming: blank(row.fixed_or_roaming),
      madeWhere: blank(row.made_where),
      iconOverride: blank(row.icon_override),
      tags: list(row.tags),
      photo: row.photo_url
        ? { url: row.photo_url, credit: blank(row.photo_credit), takenAt: blank(row.photo_taken_at) }
        : null,
      claimed: Boolean(row.claimed_at),
      hours: (hoursBy.get(row.id) ?? [])
        .map((h) => ({ dayOfWeek: h.day_of_week, opens: h.opens, closes: h.closes }))
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.opens.localeCompare(b.opens)),
      products: [...(productsBy.get(row.id) ?? [])].sort(bySort).map((p) => ({
        label: p.label,
        note: blank(p.note),
        inSeasonUntil: blank(p.in_season_until),
        priceNote: blank(p.price_note),
      })),
      channels: [...(channelsBy.get(row.id) ?? [])].sort(bySort).map((c) => ({
        kind: c.kind,
        label: c.label,
        url: blank(c.url),
        note: blank(c.note),
      })),
      markets: [...(linksByVendor.get(row.id) ?? [])].sort(bySort).map((link) => ({
        ...marketRef(marketById.get(link.market_id)!),
        stall: blank(link.stall),
        usualDays: blank(link.usual_days),
        seenAt: blank(link.seen_at),
        sourceUrl: blank(link.source_url),
      })),
      checked: checkedFrom(vendorChecks.get(row.id) ?? [], now),
    };
  });

  const markets: DirectoryMarket[] = marketRows.map((row) => {
    const side = isSide(row.side) ? row.side : null;
    const kind = asKind(row.kind);
    const organizerRow = row.organizer_id ? organizerById.get(row.organizer_id) : undefined;
    const organizer = organizerRow
      ? {
          slug: organizerRow.slug,
          name: organizerRow.name,
          website: blank(organizerRow.website),
          vendorApplicationUrl: blank(organizerRow.vendor_application_url),
          publicContact: blank(organizerRow.public_contact),
          boothFeeInfo: blank(organizerRow.booth_fee_info),
          sourceUrl: blank(organizerRow.source_url),
        }
      : null;
    const dates: MarketDate[] = (datesBy.get(row.id) ?? [])
      .map((d) => {
        const startsAt = toDate(d.starts_at);
        return {
          date: hawaiiDate(startsAt),
          startsAt,
          endsAt: d.ends_at ? toDate(d.ends_at) : null,
          timePosted: d.time_posted !== false,
          note: blank(d.note),
        };
      })
      .filter((d) => !Number.isNaN(d.startsAt.getTime()))
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

    return {
      ...marketRef(row),
      kind,
      kindLabel: kindLabel(kind),
      islandSlug: row.island_id ? islandById.get(row.island_id)?.slug ?? null : null,
      side,
      sideName: side ? SIDE_NAMES[side] : null,
      area: blank(row.area),
      neighborhood: blank(row.neighborhood),
      venueName: blank(row.venue_name),
      address: blank(row.address),
      lat: toNumber(row.lat),
      lng: toNumber(row.lng),
      description: blank(row.description),
      locationNotes: blank(row.location_notes),
      gettingThere: blank(row.getting_there),
      parkingNotes: blank(row.parking_notes),
      admission: blank(row.admission),
      frequency: blank(row.frequency),
      scheduleText: blank(row.schedule_text),
      website: blank(row.website),
      instagram: blank(row.instagram),
      facebook: blank(row.facebook),
      sourceUrl: blank(row.source_url),
      operator: blank(row.operator),
      organizer,
      vendorApplicationUrl: blank(row.vendor_application_url) ?? organizer?.vendorApplicationUrl ?? null,
      boothFee: blank(row.booth_fee),
      vendorCountEstimate: toNumber(row.vendor_count_est),
      takesSnap: row.accepts_snap === true || row.ebt_tokens === true,
      daBux: row.da_bux,
      dogFriendly: row.dog_friendly,
      sessions: (sessionsBy.get(row.id) ?? [])
        .map((s) => ({ dayOfWeek: s.day_of_week, starts: s.starts, ends: s.ends }))
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.starts.localeCompare(b.starts)),
      dates,
      vendors: [...(linksByMarket.get(row.id) ?? [])].sort(bySort).map((link) => ({
        ...vendorRef(vendorById.get(link.vendor_id)!),
        stall: blank(link.stall),
        usualDays: blank(link.usual_days),
        seenAt: blank(link.seen_at),
        sourceUrl: blank(link.source_url),
      })),
      checked: checkedFrom(marketChecks.get(row.id) ?? [], now),
    };
  });

  const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
  return { categories, vendors: vendors.sort(byName), markets: markets.sort(byName) };
}
