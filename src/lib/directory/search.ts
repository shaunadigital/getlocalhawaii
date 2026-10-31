/**
 * Directory search. Pure: takes the joined directory and `now`, returns hits
 * with status attached. Used by /search and by /api/search for suggestions.
 *
 * Matching is diacritic and ʻokina insensitive ("Kakaako" finds Kakaʻako) and
 * works on word starts, so "hon" finds Honey and Honolulu but not Iphone.
 *
 * Which list leads (docs/DECISIONS.md, Oct 30): product searches ("honey",
 * "poke") list vendors first, place and kind searches ("Kailua", "farmers
 * markets") list markets first. Category names ("Lei", "Snacks and pantry")
 * are category queries, because the home page and the menu link to
 * /search?q=<name>.
 */

import { asciiText } from "../slug";
import { dayName, hawaiiClock, minutesFromTime, monthAbbr } from "../time";
import {
  HOLIDAY_FAIR_KINDS,
  KIND_LABELS,
  KIND_PLURALS,
  MARKET_KINDS,
  type MarketKind,
  SIDE_NAMES,
  type Side,
  searchHref,
} from "./labels";
import { type ListingStatus, type Occurrence, bodyRange, marketStatus, nextOccurrence, vendorStatus } from "./status";
import type { Category, DirectoryMarket, DirectoryVendor } from "./types";

// Normalizing -----------------------------------------------------------------

/** "Kakaʻako & Pīkake’s" -> "kakaako pikakes". */
export function normalize(value: string): string {
  return asciiText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Words that carry no meaning in a search ("poke near me", "markets in Kailua"). */
const STOPWORDS = new Set(["a", "an", "the", "and", "of", "in", "at", "on", "near", "me", "for", "to", "oahu", "hawaii"]);

/** Product words too generic to name a topic ("Fresh vendors"). */
const GENERIC_WORDS = new Set([
  "fresh", "made", "custom", "daily", "grilled", "smoked", "dried", "whole", "order", "pound", "half", "plates",
  "plate", "bowls", "cups", "kits", "style", "local", "island", "hawaiian", "from", "with", "plus", "more",
]);

function words(normalized: string): string[] {
  return normalized ? normalized.split(" ") : [];
}

/** "markets" also matches "market"; "leis" matches "lei". */
function stems(token: string): string[] {
  return token.length > 3 && token.endsWith("s") ? [token, token.slice(0, -1)] : [token];
}

type PhraseMatch = "exact" | "prefix" | "word";

/** Whole-query match against one normalized field, at a word start. */
function phraseMatch(field: string, query: string): PhraseMatch | null {
  if (!field || !query) return null;
  for (const q of stems(query)) {
    if (field === q) return "exact";
    if (field.startsWith(q)) return "prefix";
    if (field.includes(` ${q}`)) return "word";
  }
  return null;
}

function tokenInWords(fieldWords: string[], token: string): boolean {
  const forms = stems(token);
  return fieldWords.some((w) => forms.some((f) => w.startsWith(f)));
}

// Field index -----------------------------------------------------------------

type FieldKind =
  | "name"
  | "alias"
  | "brand"
  | "product"
  | "tag"
  | "category"
  | "description"
  | "place"
  | "kind"
  | "venue"
  | "address";

const WEIGHTS: Record<FieldKind, number> = {
  name: 100,
  alias: 90,
  brand: 70,
  venue: 60,
  product: 55,
  tag: 50,
  category: 50,
  kind: 50,
  place: 45,
  description: 30,
  address: 25,
};

/** Fields that say what a vendor sells, as opposed to what it is called or where it is. */
const PRODUCT_FIELDS = new Set<FieldKind>(["product", "tag", "category", "description"]);

interface Field {
  kind: FieldKind;
  text: string;
  words: string[];
}

function field(kind: FieldKind, value: string | null | undefined): Field | null {
  if (!value) return null;
  const text = normalize(value);
  return text ? { kind, text, words: words(text) } : null;
}

function compact(fields: (Field | null)[]): Field[] {
  return fields.filter((f): f is Field => f !== null);
}

function vendorFields(v: DirectoryVendor): Field[] {
  return compact([
    field("name", v.name),
    ...v.aliases.map((a) => field("alias", a)),
    field("brand", v.brand?.replace(/-/g, " ")),
    ...v.products.map((p) => field("product", p.label)),
    ...v.tags.map((t) => field("tag", t)),
    field("category", v.category?.name),
    field("description", v.description),
    field("place", v.area),
    field("place", v.neighborhood),
    field("place", v.sideName),
  ]);
}

function marketFields(m: DirectoryMarket): Field[] {
  return compact([
    field("name", m.name),
    field("kind", m.kind ? KIND_LABELS[m.kind] : null),
    field("kind", m.kind ? KIND_PLURALS[m.kind] : null),
    field("venue", m.venueName),
    field("place", m.area),
    field("place", m.neighborhood),
    field("place", m.sideName),
    field("address", m.address),
  ]);
}

interface Score {
  score: number;
  /** Name or alias equals the query. */
  exact: boolean;
  kinds: Set<FieldKind>;
}

/**
 * Scores one listing. The whole query matching a field at a word start beats
 * the words matching separately; every word must match somewhere.
 */
function scoreFields(fields: Field[], query: string): Score | null {
  let best = 0;
  let exact = false;
  const kinds = new Set<FieldKind>();

  for (const f of fields) {
    const m = phraseMatch(f.text, query);
    if (!m) continue;
    const bonus = m === "exact" ? 40 : m === "prefix" ? 20 : 10;
    best = Math.max(best, WEIGHTS[f.kind] + bonus);
    kinds.add(f.kind);
    if (m === "exact" && (f.kind === "name" || f.kind === "alias")) exact = true;
  }
  if (best > 0) return { score: best * 10, exact, kinds };

  const tokens = words(query).filter((t) => !STOPWORDS.has(t));
  if (tokens.length < 2) return null;
  let total = 0;
  for (const token of tokens) {
    let tokenBest = 0;
    for (const f of fields) {
      if (tokenInWords(f.words, token) && WEIGHTS[f.kind] > tokenBest) {
        tokenBest = WEIGHTS[f.kind];
        kinds.add(f.kind);
      }
    }
    if (tokenBest === 0) return null;
    total += tokenBest;
  }
  return { score: Math.round((total / tokens.length) * 6), exact: false, kinds };
}

// Intents ---------------------------------------------------------------------

export type SearchIntent =
  | { type: "empty" }
  | { type: "category"; category: Category; kinds: MarketKind[] }
  | { type: "kind"; label: string; kinds: MarketKind[]; within: string | null }
  | { type: "place"; label: string; side: Side | null }
  | { type: "text" };

/** Market kinds that belong with a vendor category ("Food trucks" also lists truck parks). */
const CATEGORY_KINDS: Record<string, MarketKind[]> = {
  "food-trucks": ["food_truck_park", "food_truck_rally", "brewery_truck_night"],
  makers: ["makers_market"],
  farms: ["farm_stand", "u_pick"],
  plants: ["plant_sale"],
};

interface KindGroup {
  label: string;
  kinds: MarketKind[];
  forms: string[];
}

/** Kind phrases, longest first so "night markets" wins over "markets". */
function kindGroups(): KindGroup[] {
  const groups: KindGroup[] = MARKET_KINDS.map((kind) => ({
    label: KIND_PLURALS[kind],
    kinds:
      kind === "holiday_fair" || kind === "craft_fair_annual"
        ? [...HOLIDAY_FAIR_KINDS]
        : kind === "swap_meet" || kind === "flea_market"
          ? ["swap_meet", "flea_market"]
          : [kind],
    forms: [normalize(KIND_PLURALS[kind]), normalize(KIND_LABELS[kind])],
  }));
  groups.find((g) => g.kinds.includes("farmers_market"))?.forms.push("farmers", "farmer market", "farmer markets");
  groups.find((g) => g.kinds.includes("makers_market"))?.forms.push("maker market", "maker markets");
  groups.find((g) => g.kinds.includes("craft_fair_annual"))?.forms.push("craft fair", "craft fairs");
  return groups;
}

const KIND_GROUPS = kindGroups();
const ALL_MARKETS: KindGroup = { label: "Markets", kinds: [...MARKET_KINDS], forms: ["markets", "market"] };

function categoryForms(category: Category): string[] {
  const name = normalize(category.name);
  const forms = new Set([name, normalize(category.slug)]);
  if (name.endsWith("s")) forms.add(name.slice(0, -1));
  else forms.add(`${name}s`);
  return [...forms];
}

/** Place names as stored, split where a row holds two ("Town/Honolulu", "Waimalu and ʻEwa"). */
function placeNames(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(/\/|;| and /)
    .map((part) => part.trim())
    .filter(Boolean);
}

interface Place {
  label: string;
  side: Side | null;
}

function directoryPlaces(vendors: DirectoryVendor[], markets: DirectoryMarket[]): Map<string, Place> {
  const places = new Map<string, Place>();
  for (const side of Object.keys(SIDE_NAMES) as Side[]) {
    places.set(normalize(SIDE_NAMES[side]), { label: SIDE_NAMES[side], side });
  }
  for (const item of [...markets, ...vendors]) {
    for (const value of [item.neighborhood, item.area]) {
      for (const name of placeNames(value)) {
        const key = normalize(name);
        if (key && !places.has(key)) places.set(key, { label: name, side: null });
      }
    }
  }
  return places;
}

function inPlace(item: { area: string | null; neighborhood: string | null; side: Side | null }, place: Place, key: string) {
  if (place.side) return item.side === place.side;
  return [item.area, item.neighborhood].some((value) => placeNames(value).some((name) => normalize(name) === key));
}

/** A kind phrase at the start or end of the query, with what is left as a place or name filter. */
function matchKind(query: string): { group: KindGroup; within: string | null } | null {
  const forms = KIND_GROUPS.flatMap((group) => group.forms.map((form) => ({ group, form }))).sort(
    (a, b) => b.form.length - a.form.length,
  );
  for (const { group, form } of forms) {
    if (query === form) return { group, within: null };
  }
  for (const form of ALL_MARKETS.forms) if (query === form) return { group: ALL_MARKETS, within: null };
  for (const { group, form } of forms) {
    let rest: string | null = null;
    if (query.endsWith(` ${form}`)) rest = query.slice(0, -form.length - 1);
    else if (query.startsWith(`${form} `)) rest = query.slice(form.length + 1);
    if (rest === null) continue;
    const left = words(rest).filter((w) => !STOPWORDS.has(w)).join(" ");
    if (left) return { group, within: left };
  }
  return null;
}

// Results ---------------------------------------------------------------------

export interface VendorHit {
  vendor: DirectoryVendor;
  status: ListingStatus;
  /** The vendor's next market day, when it is linked to a market with posted dates. */
  next: { market: DirectoryMarket; occurrence: Occurrence } | null;
  score: number;
  exact: boolean;
}

export interface MarketHit {
  market: DirectoryMarket;
  status: ListingStatus;
  next: Occurrence | null;
  score: number;
  exact: boolean;
  /** How many of the vendor hits sell here (markets listed because their vendors matched). */
  vendorMatches: number;
}

export interface PlaceHit {
  label: string;
  href: string;
  markets: number;
  vendors: number;
}

export interface SearchResults {
  /** What was typed, trimmed. */
  query: string;
  normalized: string;
  intent: SearchIntent;
  lead: "vendors" | "markets";
  /** True when the vendor hits matched on what they sell, so "WHO SELLS" reads right. */
  productMatch: boolean;
  vendors: VendorHit[];
  markets: MarketHit[];
  places: PlaceHit[];
}

export interface SearchInput {
  categories: Category[];
  vendors: DirectoryVendor[];
  markets: DirectoryMarket[];
}

/** Minutes from now until the occurrence starts; 0 while it is on, Infinity when unknown. */
function occurrenceWait(occurrence: Occurrence | null, now: Date): number {
  if (!occurrence) return Infinity;
  if (occurrence.startsAt) return Math.max(0, (occurrence.startsAt.getTime() - now.getTime()) / 60_000);
  // Date posted, hours not: sort by the date, after posted times that day.
  const clock = hawaiiClock(now);
  const days = Math.round((Date.parse(occurrence.date) - Date.parse(clock.date)) / 86_400_000);
  return days * 1440 + 1439 - clock.minutes;
}

/** Minutes until the vendor's posted hours next open; 0 while open, Infinity with no hours. */
function vendorWait(vendor: DirectoryVendor, now: Date): number {
  if (vendor.hours.length === 0) return Infinity;
  const clock = hawaiiClock(now);
  let best = Infinity;
  for (let offset = 0; offset < 8; offset++) {
    const dow = (clock.dayOfWeek + offset) % 7;
    for (const h of vendor.hours) {
      if (h.dayOfWeek !== dow) continue;
      const opens = minutesFromTime(h.opens);
      let closes = minutesFromTime(h.closes);
      if (closes <= opens) closes += 1440;
      if (offset === 0 && clock.minutes >= opens && clock.minutes < closes) return 0;
      const wait = offset * 1440 + opens - clock.minutes;
      if (wait > 0) best = Math.min(best, wait);
    }
  }
  return best;
}

function vendorNext(vendor: DirectoryVendor, marketsById: Map<string, DirectoryMarket>, now: Date) {
  let best: { market: DirectoryMarket; occurrence: Occurrence } | null = null;
  for (const ref of vendor.markets) {
    const market = marketsById.get(ref.id);
    if (!market) continue;
    const occurrence = nextOccurrence(market, now);
    if (!occurrence) continue;
    if (!best || occurrenceWait(occurrence, now) < occurrenceWait(best.occurrence, now)) best = { market, occurrence };
  }
  return best;
}

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

/**
 * Searches the directory. Exact name matches rank first; the rest are sorted
 * soonest first (open now, then the next opening or market day), then by
 * match strength, then by name.
 */
export function searchDirectory(input: SearchInput, rawQuery: string, now: Date): SearchResults {
  const query = rawQuery.trim().slice(0, 100);
  const q = normalize(query);
  const empty: SearchResults = {
    query,
    normalized: q,
    intent: { type: "empty" },
    lead: "vendors",
    productMatch: false,
    vendors: [],
    markets: [],
    places: [],
  };
  if (!q) return empty;

  const marketsById = new Map(input.markets.map((m) => [m.id, m]));
  const places = directoryPlaces(input.vendors, input.markets);

  // 1. Which kind of question is it.
  let intent: SearchIntent = { type: "text" };
  const category = input.categories.find((c) => categoryForms(c).includes(q));
  const kind = category ? null : matchKind(q);
  const place = places.get(q);
  if (category) intent = { type: "category", category, kinds: CATEGORY_KINDS[category.slug] ?? [] };
  else if (kind) intent = { type: "kind", label: kind.group.label, kinds: kind.group.kinds, within: kind.within };
  else if (place) intent = { type: "place", label: place.label, side: place.side };

  // 2. Collect.
  type Scored<T> = { item: T; score: number; exact: boolean };
  let vendorPicks: Scored<DirectoryVendor>[] = [];
  let marketPicks: Scored<DirectoryMarket>[] = [];
  let productMatch = false;

  const textVendors = () =>
    input.vendors.flatMap((vendor) => {
      const s = scoreFields(vendorFields(vendor), q);
      if (!s) return [];
      if ([...s.kinds].some((k) => PRODUCT_FIELDS.has(k))) productMatch = true;
      return [{ item: vendor, score: s.score, exact: s.exact }];
    });
  const textMarkets = (needle: string) =>
    input.markets.flatMap((market) => {
      const s = scoreFields(marketFields(market), needle);
      return s ? [{ item: market, score: s.score, exact: s.exact }] : [];
    });

  if (intent.type === "category") {
    const { category: cat, kinds } = intent;
    vendorPicks = input.vendors.filter((v) => v.category?.id === cat.id).map((item) => ({ item, score: 1, exact: false }));
    marketPicks = input.markets
      .filter((m) => m.kind !== null && kinds.includes(m.kind))
      .map((item) => ({ item, score: 1, exact: false }));
    productMatch = true;
    // "farm" reads as the Farms category; with nothing in it, search the text instead.
    if (vendorPicks.length === 0 && marketPicks.length === 0) {
      const text = { vendors: textVendors(), markets: textMarkets(q) };
      if (text.vendors.length + text.markets.length > 0) {
        intent = { type: "text" };
        productMatch = false;
      }
    }
  } else if (intent.type === "kind") {
    const { kinds, within } = intent;
    const ofKind = input.markets.filter((m) => m.kind !== null && kinds.includes(m.kind));
    marketPicks = within
      ? ofKind.flatMap((market) => {
          const s = scoreFields(marketFields(market), within);
          return s ? [{ item: market, score: s.score, exact: false }] : [];
        })
      : ofKind.map((item) => ({ item, score: 1, exact: false }));
    if (within && marketPicks.length === 0) {
      // "fish market" is a fish question, not a market one: fall back to text.
      intent = { type: "text" };
    }
  } else if (intent.type === "place") {
    const p = place!;
    vendorPicks = input.vendors.filter((v) => inPlace(v, p, q)).map((item) => ({ item, score: 1, exact: false }));
    marketPicks = input.markets.filter((m) => inPlace(m, p, q)).map((item) => ({ item, score: 1, exact: false }));
    // A place that is also a listing name ("Kailua Town Farmers Market" for "kailua") is already in.
  }
  if (intent.type === "text") {
    vendorPicks = textVendors();
    marketPicks = textMarkets(q);
  }

  // 3. Status and order.
  const vendors: VendorHit[] = vendorPicks
    .map(({ item, score, exact }) => {
      const next = vendorNext(item, marketsById, now);
      return {
        vendor: item,
        status: vendorStatus(item, now),
        next,
        score,
        exact,
        wait: Math.min(vendorWait(item, now), occurrenceWait(next?.occurrence ?? null, now)),
      };
    })
    .sort(
      (a, b) =>
        Number(b.exact) - Number(a.exact) ||
        a.wait - b.wait ||
        b.score - a.score ||
        byName(a.vendor, b.vendor),
    )
    .map((entry): VendorHit => ({ vendor: entry.vendor, status: entry.status, next: entry.next, score: entry.score, exact: entry.exact }));

  // Markets where the vendor hits sell, when the directory links them.
  const vendorIds = new Set(vendors.map((h) => h.vendor.id));
  const linked = new Map<string, number>();
  for (const market of input.markets) {
    const count = market.vendors.filter((v) => vendorIds.has(v.id)).length;
    if (count > 0) linked.set(market.id, count);
  }
  const pickedIds = new Set(marketPicks.map((p) => p.item.id));
  if (intent.type !== "kind") {
    for (const id of linked.keys()) {
      const market = marketsById.get(id);
      if (market && !pickedIds.has(id)) marketPicks.push({ item: market, score: 0, exact: false });
    }
  }

  const markets: MarketHit[] = marketPicks
    .map(({ item, score, exact }) => {
      const next = nextOccurrence(item, now);
      return {
        market: item,
        status: marketStatus(item, now),
        next,
        score,
        exact,
        vendorMatches: linked.get(item.id) ?? 0,
        wait: occurrenceWait(next, now),
      };
    })
    .sort(
      (a, b) =>
        Number(b.exact) - Number(a.exact) ||
        a.wait - b.wait ||
        b.score - a.score ||
        byName(a.market, b.market),
    )
    .map(
      (entry): MarketHit => ({
        market: entry.market,
        status: entry.status,
        next: entry.next,
        score: entry.score,
        exact: entry.exact,
        vendorMatches: entry.vendorMatches,
      }),
    );

  // 4. Places that match by name, for "also matches" and suggestions.
  const placeHits: PlaceHit[] = [];
  if (intent.type !== "place") {
    for (const [key, p] of places) {
      if (!phraseMatch(key, q)) continue;
      const vendorsIn = input.vendors.filter((v) => inPlace(v, p, key)).length;
      const marketsIn = input.markets.filter((m) => inPlace(m, p, key)).length;
      if (vendorsIn + marketsIn === 0) continue;
      placeHits.push({ label: p.label, href: searchHref(p.label), markets: marketsIn, vendors: vendorsIn });
    }
    placeHits.sort((a, b) => b.markets + b.vendors - (a.markets + a.vendors) || a.label.localeCompare(b.label));
  }

  // 5. Which list leads.
  let lead: "vendors" | "markets";
  if (intent.type === "kind" || intent.type === "place") lead = "markets";
  else if (intent.type === "category") lead = vendors.length > 0 || markets.length === 0 ? "vendors" : "markets";
  else {
    const marketExact = markets.some((m) => m.exact) && !vendors.some((v) => v.exact);
    lead =
      vendors.length === 0 && markets.length > 0
        ? "markets"
        : marketExact
          ? "markets"
          : !productMatch && markets.length > 0 && (markets[0]?.score ?? 0) > (vendorPicks.reduce((m, p) => Math.max(m, p.score), 0))
            ? "markets"
            : "vendors";
  }

  return {
    query,
    normalized: q,
    intent,
    lead,
    productMatch: productMatch && vendors.length > 0,
    vendors,
    markets,
    places: placeHits.slice(0, 4),
  };
}

// Suggestions -----------------------------------------------------------------

export interface Suggestion {
  id: string;
  label: string;
  href: string;
  detail?: string;
  /** Which heading the suggestion sits under in the box. */
  group: "vendors" | "markets" | "places";
  /** [start, end) of the typed text inside label, for the highlight. */
  match?: [number, number];
}

export const MAX_SUGGESTIONS = 8;

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * Where the normalized query sits inside a display label, as indices into the
 * label itself, so "kakaa" highlights "Kakaʻa" in "Kakaʻako".
 */
export function matchRange(label: string, query: string): [number, number] | undefined {
  const q = normalize(query);
  if (!q) return undefined;
  let norm = "";
  const map: number[] = [];
  for (let i = 0; i < label.length; i++) {
    const raw = asciiText(label[i]).toLowerCase();
    const ch = raw === "" ? "" : /[a-z0-9]/.test(raw) ? raw : " ";
    for (const c of ch) {
      // Collapse runs of separators so "Fish & Ice" reads as "fish ice".
      if (c === " " && (norm.endsWith(" ") || norm === "")) continue;
      norm += c;
      map.push(i);
    }
  }
  let at = 0;
  if (!norm.startsWith(q)) {
    const i = norm.indexOf(` ${q}`);
    if (i === -1) return undefined;
    at = i + 1;
  }
  const start = map[at];
  const end = map[at + q.length - 1] + 1;
  return [start, end];
}

/** "Sat Oct 31, 7:30a to 11a" / "Today 7:30a to 11a" / "Sat Nov 7, hours not posted". */
export function occurrenceLine(occurrence: Occurrence, now: Date): string {
  const today = hawaiiClock(now).date;
  const [, month, day] = occurrence.date.split("-").map(Number);
  const dayText = occurrence.date === today ? "Today" : `${dayName(occurrence.dayOfWeek)} ${monthAbbr(month, false)} ${day}`;
  if (!occurrence.starts) return `${dayText}, hours not posted`;
  return `${dayText}${occurrence.date === today ? "" : ","} ${bodyRange(occurrence.starts, occurrence.ends)}`;
}

/** Product and tag words that start with the query, for "Poke vendors" style topics. */
function productTopic(input: SearchInput, q: string): string | null {
  if (q.length < 3 || q.includes(" ")) return null;
  const counts = new Map<string, { display: string; count: number }>();
  for (const v of input.vendors) {
    const seen = new Set<string>();
    for (const label of [...v.products.map((p) => p.label), ...v.tags]) {
      for (const display of label.split(/[\s,/&()]+/)) {
        const key = normalize(display);
        if (key.length < 3 || STOPWORDS.has(key) || GENERIC_WORDS.has(key) || !key.startsWith(q) || seen.has(key)) continue;
        seen.add(key);
        const entry = counts.get(key) ?? { display, count: 0 };
        entry.count += 1;
        counts.set(key, entry);
      }
    }
  }
  const best = [...counts.values()].sort((a, b) => b.count - a.count || a.display.length - b.display.length)[0];
  return best ? best.display.replace(/^./, (c) => c.toUpperCase()) : null;
}

/**
 * Up to eight suggestions for what is typed so far: a topic line (a category,
 * a kind or a product), then vendors, markets and places.
 */
export function searchSuggestions(input: SearchInput, rawQuery: string, now: Date): Suggestion[] {
  const query = rawQuery.trim().slice(0, 100);
  const q = normalize(query);
  if (q.length < 2) return [];

  const topics: Suggestion[] = [];
  for (const category of input.categories) {
    const count = input.vendors.filter((v) => v.category?.id === category.id).length;
    if (count === 0 || !categoryForms(category).some((form) => phraseMatch(form, q) === "exact" || form.startsWith(q))) continue;
    topics.push({
      id: `category-${category.slug}`,
      label: category.name,
      href: searchHref(category.name),
      detail: plural(count, "vendor"),
      group: "vendors",
      match: matchRange(category.name, query),
    });
  }
  for (const group of KIND_GROUPS) {
    if (topics.some((t) => t.label === group.label)) continue;
    if (!group.forms.some((form) => form.startsWith(q) || phraseMatch(form, q))) continue;
    const count = input.markets.filter((m) => m.kind !== null && group.kinds.includes(m.kind)).length;
    if (count === 0) continue;
    topics.push({
      id: `kind-${group.kinds[0]}`,
      label: group.label,
      href: group.kinds.includes("holiday_fair") ? "/holiday-fairs" : searchHref(group.label),
      detail: plural(count, "market"),
      group: "markets",
      match: matchRange(group.label, query),
    });
  }
  const product = topics.length === 0 ? productTopic(input, q) : null;
  if (product) {
    const count = searchDirectory(input, product, now).vendors.length;
    if (count > 0) {
      const label = `${product} vendors`;
      topics.push({
        id: `product-${normalize(product)}`,
        label,
        href: searchHref(product.toLowerCase()),
        detail: `Who sells ${product.toLowerCase()}, ${plural(count, "vendor")}`,
        group: "vendors",
        match: matchRange(label, query),
      });
    }
  }

  // Listings: names first, so typing a name finds it.
  const results = searchDirectory(input, query, now);
  const vendorList = [...results.vendors].sort((a, b) => Number(b.exact) - Number(a.exact) || b.score - a.score);
  const marketList = [...results.markets].sort((a, b) => Number(b.exact) - Number(a.exact) || b.score - a.score);

  const vendorSuggestions: Suggestion[] = vendorList.flatMap(({ vendor, status, next }) => {
    if (!vendor.href) return [];
    const place = vendor.neighborhood ?? vendor.area;
    const when = next
      ? `next: ${occurrenceLine(next.occurrence, now)}, ${next.market.name}`
      : status.isOpenNow
        ? "Open now"
        : null;
    return [
      {
        id: `vendor-${vendor.id}`,
        label: vendor.name,
        href: vendor.href,
        detail: [vendor.category?.name, place, when].filter(Boolean).join(" · ") || undefined,
        group: "vendors" as const,
        match: matchRange(vendor.name, query),
      },
    ];
  });
  const marketSuggestions: Suggestion[] = marketList.map(({ market, next }) => {
    const place = market.neighborhood ?? market.area;
    const when = next ? occurrenceLine(next, now) : "Next date not posted yet";
    return {
      id: `market-${market.id}`,
      label: market.name,
      href: market.href,
      detail: [when, place].filter(Boolean).join(" · "),
      group: "markets" as const,
      match: matchRange(market.name, query),
    };
  });
  const placeSuggestions: Suggestion[] = results.places.map((p) => ({
    id: `place-${normalize(p.label)}`,
    label: p.label,
    href: p.href,
    detail: [p.markets ? plural(p.markets, "market") : null, p.vendors ? plural(p.vendors, "vendor") : null]
      .filter(Boolean)
      .join(", "),
    group: "places" as const,
    match: matchRange(p.label, query),
  }));

  // Share eight slots: topics, then up to three of each list, then fill.
  const picked: Suggestion[] = topics.slice(0, 2);
  const queues = [vendorSuggestions, marketSuggestions, placeSuggestions.slice(0, 2)];
  const quotas = [3, 3, 1];
  queues.forEach((queue, i) => picked.push(...queue.splice(0, quotas[i])));
  for (const queue of queues) {
    while (queue.length && picked.length < MAX_SUGGESTIONS) picked.push(queue.shift()!);
  }
  const unique = picked.filter((s, i) => picked.findIndex((t) => t.href === s.href) === i).slice(0, MAX_SUGGESTIONS);

  // Group order follows the lead: markets first for place and kind searches.
  const order = results.lead === "markets" ? ["markets", "places", "vendors"] : ["vendors", "markets", "places"];
  return unique.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
}
