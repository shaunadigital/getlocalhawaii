import { describe, expect, it } from "vitest";

import { buildDirectory } from "./join";
import { matchRange, normalize, searchDirectory, searchSuggestions } from "./search";
import { TABLE_NAMES, type MarketRow, type Tables, type VendorRow } from "./types";

/** An instant given as Hawaii wall-clock time. Hawaii is UTC-10 year round. */
const hst = (iso: string) => new Date(`${iso}:00-10:00`);
// A Friday evening.
const NOW = hst("2026-10-30T18:00");

function vendor(o: Partial<VendorRow>): VendorRow {
  return {
    id: "v", slug: "v", name: "V", category_id: "c-fish", island_id: "i", area: null, description: null, story: null,
    lat: null, lng: null, phone: null, contact_method: null, payment_notes: null, good_to_know: null, is_active: true,
    address: null, website: null, ships_mainland: null, source_url: null, fixed_or_roaming: null, instagram: null,
    facebook: null, accepts_snap: null, claimed_at: null, status: "active", confidence: "high",
    publish_status: "published", side: null, neighborhood: null, made_where: null, icon_override: null,
    hours_note: null, schedule_source_url: null, order_url: null, source_label: null, payment_methods: null,
    tags: null, photo_url: null, photo_credit: null, photo_taken_at: null, aliases: null, brand: null, ...o,
  };
}

function market(o: Partial<MarketRow>): MarketRow {
  return {
    id: "m", slug: "m", name: "M", island_id: "i", area: null, description: null, location_notes: null,
    instagram: null, getting_there: null, is_active: true, lat: null, lng: null, operator: null, ebt_tokens: null,
    source_url: null, kind: "farmers_market", organizer_id: null, venue_name: null, address: null, frequency: null,
    schedule_text: null, website: null, facebook: null, admission: null, parking_notes: null, vendor_count_est: null,
    vendor_application_url: null, booth_fee: null, accepts_snap: null, da_bux: null, dog_friendly: null,
    status: "active", confidence: null, source_date: null, publish_status: "published", side: null,
    neighborhood: null, ...o,
  };
}

const base = Object.fromEntries(TABLE_NAMES.map((n) => [n, []])) as unknown as Tables;
const tables: Tables = {
  ...base,
  categories: [
    { id: "c-fish", name: "Fish", slug: "fish" },
    { id: "c-lei", name: "Lei", slug: "lei" },
    { id: "c-snacks", name: "Snacks and pantry", slug: "food-producers" },
    { id: "c-farms", name: "Farms", slug: "farms" },
  ],
  vendors: [
    vendor({ id: "v1", slug: "ono", name: "Ono Seafood", area: "Kapahulu", description: "Made-to-order poke" }),
    vendor({ id: "v2", slug: "poke-pound", name: "Poke by the Pound", area: "Kalihi" }),
    vendor({ id: "v3", slug: "cindys", name: "Cindy's Lei Shoppe", category_id: "c-lei", area: "Chinatown" }),
    vendor({ id: "v4", slug: "maguro", name: "Maguro Brothers Hawaii", aliases: ["Maguro Bros"], area: "Chinatown" }),
    vendor({ id: "v5", slug: "honey", name: "Hauʻula Honey", category_id: "c-snacks", area: "Kailua" }),
    vendor({ id: "v6", slug: "draft", name: "Draft Poke", publish_status: "draft" }),
  ],
  vendor_products: [
    { vendor_id: "v1", label: "Poke", note: null, in_season_until: null, sort_order: 1, price_note: null },
    { vendor_id: "v3", label: "Pīkake", note: null, in_season_until: null, sort_order: 1, price_note: null },
    { vendor_id: "v5", label: "Raw honey", note: null, in_season_until: null, sort_order: 1, price_note: null },
  ],
  vendor_hours: [
    // v1 open now (Fri 9a to 7p); v2 opens Saturday.
    { vendor_id: "v1", day_of_week: 5, opens: "09:00", closes: "19:00" },
    { vendor_id: "v2", day_of_week: 6, opens: "10:00", closes: "16:00" },
  ],
  markets: [
    market({ id: "m1", slug: "kcc", name: "KCC Farmers Market", area: "Diamond Head" }),
    market({ id: "m2", slug: "kailua-town", name: "Kailua Town Farmers Market", area: "Kailua" }),
    market({ id: "m3", slug: "fair", name: "Mele Kalikimaka Marketplace", kind: "holiday_fair", area: "Kakaʻako" }),
    market({ id: "m4", slug: "mta", name: "MTA Craft Fair", kind: "craft_fair_annual", area: "Mililani" }),
  ],
  market_sessions: [
    { market_id: "m1", day_of_week: 6, starts: "07:30", ends: "11:00" },
    { market_id: "m2", day_of_week: 4, starts: "16:00", ends: "19:00" },
  ],
  market_dates: [
    { market_id: "m3", starts_at: "2026-12-12T09:00:00-10:00", ends_at: "2026-12-12T19:00:00-10:00", note: null, time_posted: true },
  ],
  market_vendors: [{ market_id: "m2", vendor_id: "v5", stall: null, usual_days: null, sort_order: 0 }],
};

const directory = buildDirectory(tables, NOW);
const search = (q: string) => searchDirectory(directory, q, NOW);
const vendorNames = (q: string) => search(q).vendors.map((h) => h.vendor.name);
const marketNames = (q: string) => search(q).markets.map((h) => h.market.name);

describe("normalize", () => {
  it("drops the ʻokina, kahakō and apostrophes", () => {
    expect(normalize("Kakaʻako")).toBe("kakaako");
    expect(normalize("Pīkake")).toBe("pikake");
    expect(normalize("Tamura’s Fish & Ice")).toBe("tamuras fish ice");
  });
});

describe("searchDirectory", () => {
  it("returns nothing for an empty query", () => {
    expect(search("  ").intent.type).toBe("empty");
    expect(search("").vendors).toEqual([]);
  });

  it("treats a category name as a category query, vendors first", () => {
    const r = search("Fish");
    expect(r.intent.type).toBe("category");
    expect(r.lead).toBe("vendors");
    expect(vendorNames("Fish")).toEqual(["Ono Seafood", "Poke by the Pound", "Maguro Brothers Hawaii"]);
    expect(search("Snacks and pantry").intent).toMatchObject({ type: "category" });
    expect(search("lei").vendors.map((h) => h.vendor.slug)).toEqual(["cindys"]);
  });

  it("lists open vendors first, then the soonest to open", () => {
    // Ono is open now, Poke by the Pound opens tomorrow, Maguro posts no hours.
    expect(vendorNames("Fish")[0]).toBe("Ono Seafood");
    expect(vendorNames("Fish")[2]).toBe("Maguro Brothers Hawaii");
  });

  it("treats plural kind names as kind queries, markets first, soonest first", () => {
    const r = search("Farmers markets");
    expect(r.intent).toMatchObject({ type: "kind", kinds: ["farmers_market"] });
    expect(r.lead).toBe("markets");
    // Saturday KCC comes before Thursday Kailua.
    expect(marketNames("Farmers markets")).toEqual(["KCC Farmers Market", "Kailua Town Farmers Market"]);
    expect(search("farmers market").intent.type).toBe("kind");
  });

  it("groups holiday and annual craft fairs together", () => {
    expect(marketNames("holiday fairs").sort()).toEqual(["MTA Craft Fair", "Mele Kalikimaka Marketplace"]);
  });

  it("narrows a kind query by a place", () => {
    expect(marketNames("kailua farmers market")).toEqual(["Kailua Town Farmers Market"]);
    expect(search("farmers markets in kailua").intent).toMatchObject({ type: "kind", within: "kailua" });
  });

  it("treats a place as a place query, markets first, with its vendors", () => {
    const r = search("Kailua");
    expect(r.intent).toMatchObject({ type: "place", label: "Kailua" });
    expect(r.lead).toBe("markets");
    expect(marketNames("Kailua")).toEqual(["Kailua Town Farmers Market"]);
    expect(vendorNames("Kailua")).toEqual(["Hauʻula Honey"]);
  });

  it("ignores diacritics and the ʻokina", () => {
    expect(search("Kakaako").intent).toMatchObject({ type: "place", label: "Kakaʻako" });
    expect(marketNames("kakaako")).toEqual(["Mele Kalikimaka Marketplace"]);
    expect(vendorNames("pikake")).toEqual(["Cindy's Lei Shoppe"]);
    expect(vendorNames("hauula")).toEqual(["Hauʻula Honey"]);
  });

  it("lists vendors first for a product, with markets where they sell", () => {
    const r = search("honey");
    expect(r.lead).toBe("vendors");
    expect(r.productMatch).toBe(true);
    expect(r.vendors[0].vendor.name).toBe("Hauʻula Honey");
    expect(r.vendors[0].next?.market.name).toBe("Kailua Town Farmers Market");
    expect(r.markets.map((m) => [m.market.name, m.vendorMatches])).toEqual([["Kailua Town Farmers Market", 1]]);
  });

  it("matches products and descriptions", () => {
    expect(vendorNames("poke").sort()).toEqual(["Ono Seafood", "Poke by the Pound"]);
    expect(search("poke").lead).toBe("vendors");
  });

  it("ranks an exact name match first", () => {
    expect(vendorNames("poke by the pound")[0]).toBe("Poke by the Pound");
    // "Poke by the Pound" opens tomorrow and Ono is open now, but the exact name wins.
    expect(vendorNames("Poke by the Pound")).toEqual(["Poke by the Pound"]);
  });

  it("matches aliases", () => {
    expect(vendorNames("maguro bros")).toEqual(["Maguro Brothers Hawaii"]);
    expect(search("maguro bros").vendors[0].exact).toBe(true);
  });

  it("puts a market first when the query is its name", () => {
    const r = search("kcc farmers market");
    expect(r.lead).toBe("markets");
    expect(r.markets[0].market.name).toBe("KCC Farmers Market");
  });

  it("needs every word to match somewhere", () => {
    expect(vendorNames("chinatown lei")).toEqual(["Cindy's Lei Shoppe"]);
    expect(vendorNames("chinatown mochi")).toEqual([]);
  });

  it("matches word starts, not the middle of words", () => {
    expect(vendorNames("seafood")).toEqual(["Ono Seafood"]);
    expect(vendorNames("food")).toEqual([]);
  });

  it("finds nothing for what nobody lists", () => {
    const r = search("mochi");
    expect(r.vendors).toEqual([]);
    expect(r.markets).toEqual([]);
  });

  it("falls back to text when a category has nothing in it", () => {
    // "farm" reads as Farms (empty here), but farmers markets match the words.
    expect(search("farm").intent.type).toBe("text");
    expect(marketNames("farm").length).toBe(2);
  });

  it("never returns unpublished rows", () => {
    expect(vendorNames("draft")).toEqual([]);
  });
});

describe("searchSuggestions", () => {
  it("returns nothing under two characters", () => {
    expect(searchSuggestions(directory, "p", NOW)).toEqual([]);
  });

  it("caps at eight and links each listing", () => {
    const list = searchSuggestions(directory, "ka", NOW);
    expect(list.length).toBeLessThanOrEqual(8);
    for (const s of list) expect(s.href).toMatch(/^\//);
  });

  it("offers a category topic and its vendors", () => {
    const list = searchSuggestions(directory, "lei", NOW);
    expect(list[0]).toMatchObject({ label: "Lei", href: "/search?q=Lei", detail: "1 vendor", group: "vendors" });
    expect(list.some((s) => s.href === "/lei/cindys")).toBe(true);
  });

  it("offers a product topic while typing", () => {
    const list = searchSuggestions(directory, "hon", NOW);
    expect(list[0]).toMatchObject({ label: "Honey vendors", detail: "Who sells honey, 1 vendor", match: [0, 3] });
  });

  it("puts markets first for a place", () => {
    const list = searchSuggestions(directory, "kailua", NOW);
    expect(list[0].group).toBe("markets");
  });

  it("highlights through the ʻokina", () => {
    expect(matchRange("Kakaʻako", "kakaa")).toEqual([0, 6]);
    expect(matchRange("Hauʻula Honey", "hon")).toEqual([8, 11]);
    expect(matchRange("Fish", "x")).toBeUndefined();
  });
});
