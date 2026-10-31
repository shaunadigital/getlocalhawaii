import { describe, expect, it } from "vitest";

import { buildDirectory, checkedFrom } from "./join";
import { sideFromParam, sideParam } from "./labels";
import {
  holidayFairRuns,
  marketStatus,
  occurrenceStatus,
  occurrencesBetween,
  vendorStatus,
  weekendDays,
} from "./status";
import { TABLE_NAMES, type MarketRow, type Tables, type VendorRow } from "./types";

/** An instant given as Hawaii wall-clock time. Hawaii is UTC-10 year round. */
const hst = (iso: string) => new Date(`${iso}:00-10:00`);

function tables(partial: Partial<Tables>): Tables {
  const base = Object.fromEntries(TABLE_NAMES.map((n) => [n, []])) as unknown as Tables;
  return { ...base, ...partial };
}

function vendor(overrides: Partial<VendorRow>): VendorRow {
  return {
    id: "v1", slug: "local-ia", name: "Local Iʻa", category_id: "c-fish", island_id: "i-oahu", area: "Kalihi",
    description: null, story: null, lat: "21.3", lng: null, phone: null, contact_method: null, payment_notes: null,
    good_to_know: null, is_active: true, address: null, website: null, ships_mainland: null, source_url: null,
    fixed_or_roaming: null, instagram: null, facebook: null, accepts_snap: null, claimed_at: null, status: "active",
    confidence: "high", publish_status: "published", side: "town", neighborhood: null, made_where: null,
    icon_override: null, hours_note: null, schedule_source_url: null, order_url: null, source_label: null,
    payment_methods: null, tags: null, photo_url: null, photo_credit: null, photo_taken_at: null, aliases: null,
    brand: null, ...overrides,
  };
}

function market(overrides: Partial<MarketRow>): MarketRow {
  return {
    id: "m1", slug: "kcc", name: "KCC Farmers Market", island_id: "i-oahu", area: "Diamond Head", description: null,
    location_notes: null, instagram: null, getting_there: null, is_active: true, lat: null, lng: null, operator: null,
    ebt_tokens: true, source_url: null, kind: "farmers_market", organizer_id: null, venue_name: null, address: null,
    frequency: null, schedule_text: null, website: null, facebook: null, admission: null, parking_notes: null,
    vendor_count_est: null, vendor_application_url: null, booth_fee: null, accepts_snap: null, da_bux: null,
    dog_friendly: null, status: "active", confidence: null, source_date: null, publish_status: "published",
    side: null, neighborhood: null, ...overrides,
  };
}

const fixture = tables({
  islands: [{ id: "i-oahu", name: "Oʻahu", slug: "oahu" }],
  categories: [
    { id: "c-fish", name: "Fish", slug: "fish" },
    { id: "c-other", name: "Other", slug: "other" },
    { id: "c-lei", name: "Lei", slug: "lei" },
  ],
  vendors: [
    vendor({}),
    vendor({ id: "v2", slug: "draft", name: "Draft Stand", publish_status: "draft" }),
    vendor({ id: "v3", slug: "gone", name: "Gone Stand", status: "closed" }),
    vendor({ id: "v4", slug: "misc", name: "Misc", category_id: "c-other" }),
    vendor({ id: "v5", slug: "sides", name: "Bad Side", side: "upcountry", category_id: "c-lei" }),
  ],
  markets: [
    market({}),
    market({ id: "m2", slug: "fair", name: "Holiday Fair", kind: "holiday_fair", ebt_tokens: null, organizer_id: "o1" }),
    market({ id: "m3", slug: "hidden", name: "Hidden", publish_status: "draft" }),
  ],
  organizers: [
    { id: "o1", slug: "org", name: "Org", website: null, vendor_application_url: "https://apply", public_contact: null, booth_fee_info: null, source_url: null },
  ],
  vendor_hours: [{ vendor_id: "v1", day_of_week: 6, opens: "07:00:00", closes: "14:00:00" }],
  vendor_products: [
    { vendor_id: "v1", label: "Poke", note: null, in_season_until: null, sort_order: 2, price_note: null },
    { vendor_id: "v1", label: "Ahi", note: null, in_season_until: null, sort_order: 1, price_note: null },
  ],
  market_sessions: [{ market_id: "m1", day_of_week: 6, starts: "07:30:00", ends: "11:00:00" }],
  market_vendors: [
    { market_id: "m1", vendor_id: "v1", stall: "12", usual_days: null, sort_order: 0 },
    { market_id: "m3", vendor_id: "v1", stall: null, usual_days: null, sort_order: 0 },
    { market_id: "m1", vendor_id: "v2", stall: null, usual_days: null, sort_order: 0 },
  ],
  market_dates: [
    { market_id: "m2", starts_at: "2026-11-07T19:30:00+00:00", ends_at: "2026-11-08T00:30:00+00:00", note: null, time_posted: true },
    { market_id: "m2", starts_at: "2026-11-28T10:00:00+00:00", ends_at: null, note: null, time_posted: false },
  ],
  verification_events: [
    { subject_type: "vendor", subject_id: "v1", verified_at: "2026-10-23T19:00:00+00:00", method: "source_check", note: null },
    { subject_type: "vendor", subject_id: "v1", verified_at: "2026-08-19T19:00:00+00:00", method: "source_check", note: null },
    { subject_type: "vendor", subject_id: "v1", verified_at: "2026-10-29T19:00:00+00:00", method: "no_answer", note: null },
    { subject_type: "market", subject_id: "m1", verified_at: "2025-01-25T19:00:00+00:00", method: "source_check", note: null },
  ],
});

const now = hst("2026-10-30T16:30"); // Friday
const dir = buildDirectory(fixture, now);

describe("buildDirectory", () => {
  it("keeps only published, open rows outside hidden categories", () => {
    expect(dir.vendors.map((v) => v.slug).sort()).toEqual(["local-ia", "sides"]);
    expect(dir.markets.map((m) => m.slug).sort()).toEqual(["fair", "kcc"]);
  });

  it("drops other from the category list", () => {
    expect(dir.categories.map((c) => c.slug)).toEqual(["fish", "lei"]);
  });

  it("joins hours, products in sort order, markets and the vendor href", () => {
    const v = dir.vendors.find((x) => x.slug === "local-ia")!;
    expect(v.href).toBe("/fish/local-ia");
    expect(v.products.map((p) => p.label)).toEqual(["Ahi", "Poke"]);
    expect(v.hours).toEqual([{ dayOfWeek: 6, opens: "07:00:00", closes: "14:00:00" }]);
    expect(v.markets.map((m) => [m.slug, m.stall])).toEqual([["kcc", "12"]]);
    expect(v.lat).toBe(21.3);
    expect(v.side).toBe("town");
    expect(v.sideName).toBe("Town");
    expect("publish_status" in v).toBe(false);
  });

  it("never guesses a side", () => {
    expect(dir.vendors.find((x) => x.slug === "sides")!.side).toBeNull();
  });

  it("joins market vendors only when both are public", () => {
    const kcc = dir.markets.find((m) => m.slug === "kcc")!;
    expect(kcc.vendors.map((v) => v.slug)).toEqual(["local-ia"]);
    expect(kcc.takesSnap).toBe(true);
    expect(kcc.kindLabel).toBe("Farmers market");
  });

  it("falls back to the organizer's vendor application", () => {
    const fair = dir.markets.find((m) => m.slug === "fair")!;
    expect(fair.organizer?.name).toBe("Org");
    expect(fair.vendorApplicationUrl).toBe("https://apply");
    expect(fair.dates.map((d) => [d.date, d.timePosted])).toEqual([
      ["2026-11-07", true],
      ["2026-11-28", false],
    ]);
  });

  it("uses the newest real check, with the year", () => {
    expect(dir.vendors.find((x) => x.slug === "local-ia")!.checked?.label).toBe("CHECKED OCT 23, 2026");
    expect(dir.markets.find((m) => m.slug === "kcc")!.checked?.label).toBe("CHECKED JAN 25, 2025");
    expect(dir.markets.find((m) => m.slug === "fair")!.checked).toBeNull();
    expect(checkedFrom([], now)).toBeNull();
  });
});

describe("status", () => {
  const kcc = dir.markets.find((m) => m.slug === "kcc")!;
  const fair = dir.markets.find((m) => m.slug === "fair")!;
  const ia = dir.vendors.find((x) => x.slug === "local-ia")!;

  it("vendor chips: open, later, next, not posted", () => {
    expect(vendorStatus(ia, hst("2026-10-31T09:00")).label).toBe("OPEN TIL 2P");
    expect(vendorStatus(ia, hst("2026-10-31T06:00")).label).toBe("OPENS 7A");
    expect(vendorStatus(ia, now).label).toBe("NEXT: SAT 7A");
    expect(vendorStatus({ hours: [] }, now)).toMatchObject({ tone: "not_posted", label: "HOURS NOT POSTED" });
  });

  it("market status from weekly sessions", () => {
    expect(marketStatus(kcc, hst("2026-10-31T08:00"))).toMatchObject({ kind: "open", label: "OPEN TIL 11A", tone: "open" });
    expect(marketStatus(kcc, hst("2026-10-31T06:00"))).toMatchObject({ kind: "later", label: "STARTS 7:30A" });
    expect(marketStatus(kcc, now)).toMatchObject({ kind: "next", label: "NEXT: SAT OCT 31", tone: "upcoming" });
    expect(marketStatus(kcc, hst("2026-10-31T12:00")).label).toBe("NEXT: SAT NOV 7");
  });

  it("market status from dates, including hours not posted", () => {
    expect(marketStatus(fair, now).label).toBe("NEXT: SAT NOV 7");
    expect(marketStatus(fair, hst("2026-11-07T10:00")).label).toBe("OPEN TIL 2:30P");
    expect(marketStatus(fair, hst("2026-11-28T09:00"))).toMatchObject({ kind: "today_unposted" });
    expect(marketStatus(fair, hst("2026-11-29T09:00"))).toMatchObject({ kind: "not_posted", label: "NEXT DATE NOT POSTED" });
    expect(marketStatus({ id: "x", sessions: [], dates: [] }, now).label).toBe("HOURS NOT POSTED");
  });

  it("lists occurrences in a range by day then time", () => {
    const rows = occurrencesBetween(dir.markets, "2026-10-30", "2026-11-08");
    expect(rows.map((r) => [r.market.slug, r.occurrence.date, r.occurrence.starts])).toEqual([
      ["kcc", "2026-10-31", "07:30"],
      ["kcc", "2026-11-07", "07:30"],
      ["fair", "2026-11-07", "09:30"],
    ]);
  });

  it("occurrence status for today and other days", () => {
    const [sat] = occurrencesBetween(dir.markets, "2026-10-31", "2026-10-31");
    expect(occurrenceStatus(sat.occurrence, now)).toBeNull();
    expect(occurrenceStatus(sat.occurrence, hst("2026-10-31T07:00"))?.label).toBe("STARTS 7:30A");
    expect(occurrenceStatus(sat.occurrence, hst("2026-10-31T12:00"))).toMatchObject({ tone: "ended", label: "ENDED 11A" });
    const unposted = occurrencesBetween(dir.markets, "2026-11-28", "2026-11-28").find((r) => r.market.slug === "fair")!;
    expect(occurrenceStatus(unposted.occurrence, now)?.label).toBe("HOURS NOT POSTED");
  });

  it("weekend days from each weekday", () => {
    expect(weekendDays(now).map((d) => d.title)).toEqual(["TODAY, FRI OCT 30", "SATURDAY, OCT 31", "SUNDAY, NOV 1"]);
    expect(weekendDays(hst("2026-10-31T10:00")).map((d) => d.label)).toEqual(["TODAY", "SUN"]);
    expect(weekendDays(hst("2026-11-01T10:00")).map((d) => d.date)).toEqual(["2026-11-01"]);
    expect(weekendDays(hst("2026-10-27T10:00")).map((d) => d.date)).toEqual(["2026-10-27", "2026-10-31", "2026-11-01"]);
  });

  it("holiday fair runs skip weekly markets and group consecutive days", () => {
    const runs = holidayFairRuns(dir.markets, now);
    expect(runs.map((r) => [r.market.slug, r.date, r.dayLabel, r.timeLabel])).toEqual([
      ["fair", "2026-11-07", "Sat", "9:30a to 2:30p"],
    ]);
    const multi = holidayFairRuns(
      [{ id: "z", name: "Z", kind: "holiday_fair" as const, sessions: [], dates: ["2026-12-18", "2026-12-19", "2026-12-20"].map((date) => ({ date, startsAt: new Date(`${date}T10:00:00Z`), endsAt: null, timePosted: false, note: null })) }],
      now,
    );
    expect(multi[0]).toMatchObject({ dayLabel: "Fri to Sun", month: "DEC", day: "18", timeLabel: null });
  });
});

describe("side params", () => {
  it("round trips", () => {
    expect(sideParam("north_shore")).toBe("north-shore");
    expect(sideFromParam("leeward-ewa")).toBe("leeward_ewa");
    expect(sideFromParam("upcountry")).toBeNull();
    expect(sideFromParam(undefined)).toBeNull();
  });
});
