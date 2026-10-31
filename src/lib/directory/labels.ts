/**
 * Display names and URL helpers for the directory. Pure and client-safe: the
 * home board, the menu and the map import from here without pulling in the
 * data loader.
 */

export const SIDES = ["north_shore", "windward", "central", "leeward_ewa", "town", "east"] as const;
export type Side = (typeof SIDES)[number];

/** Display names, in the order the menu lists them. */
export const SIDE_NAMES: Record<Side, string> = {
  town: "Town",
  east: "East",
  windward: "Windward",
  north_shore: "North Shore",
  central: "Central",
  leeward_ewa: "Leeward and ʻEwa",
};

/** Menu and footer order: Town, East, Windward, North Shore, Central, Leeward and ʻEwa. */
export const SIDE_ORDER: Side[] = ["town", "east", "windward", "north_shore", "central", "leeward_ewa"];

export function isSide(value: unknown): value is Side {
  return typeof value === "string" && (SIDES as readonly string[]).includes(value);
}

/** URL form of a side: "north-shore", "leeward-ewa", "windward". */
export function sideParam(side: Side): string {
  return side.replace("_", "-");
}

/** Reads ?side= back. Accepts "north-shore" and "north_shore"; anything else is null. */
export function sideFromParam(value: string | string[] | undefined | null): Side | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase().replace("-", "_");
  return isSide(normalized) ? normalized : null;
}

export const MARKET_KINDS = [
  "farmers_market",
  "farm_stand",
  "u_pick",
  "makers_market",
  "night_market",
  "popup_series",
  "holiday_fair",
  "craft_fair_annual",
  "swap_meet",
  "food_truck_park",
  "food_truck_rally",
  "brewery_truck_night",
  "festival",
  "plant_sale",
  "flea_market",
] as const;
export type MarketKind = (typeof MARKET_KINDS)[number];

/** Singular, sentence case: the "place · kind" line on a row. */
export const KIND_LABELS: Record<MarketKind, string> = {
  farmers_market: "Farmers market",
  farm_stand: "Farm stand",
  u_pick: "U-pick farm",
  makers_market: "Makers market",
  night_market: "Night market",
  popup_series: "Pop-up market",
  holiday_fair: "Holiday fair",
  craft_fair_annual: "Craft fair",
  swap_meet: "Swap meet",
  food_truck_park: "Food truck park",
  food_truck_rally: "Food truck rally",
  brewery_truck_night: "Brewery truck night",
  festival: "Festival",
  plant_sale: "Plant sale",
  flea_market: "Flea market",
};

/** Plural, for menus, tiles and search entry points. */
export const KIND_PLURALS: Record<MarketKind, string> = {
  farmers_market: "Farmers markets",
  farm_stand: "Farm stands",
  u_pick: "U-pick farms",
  makers_market: "Makers markets",
  night_market: "Night markets",
  popup_series: "Pop-up markets",
  holiday_fair: "Holiday fairs",
  craft_fair_annual: "Craft fairs",
  swap_meet: "Swap meets",
  food_truck_park: "Food truck parks",
  food_truck_rally: "Food truck rallies",
  brewery_truck_night: "Brewery truck nights",
  festival: "Festivals",
  plant_sale: "Plant sales",
  flea_market: "Flea markets",
};

export function kindLabel(kind: string | null | undefined): string {
  return kind && kind in KIND_LABELS ? KIND_LABELS[kind as MarketKind] : "Market";
}

/** Kinds that read as holiday or annual fairs on /holiday-fairs. */
export const HOLIDAY_FAIR_KINDS: MarketKind[] = ["holiday_fair", "craft_fair_annual"];

/**
 * Public category order, matching docs/DECISIONS.md (Oct 31). "other" is an
 * internal holding category and "farmers-markets" is the legacy pseudo
 * category for the old markets listing; neither gets a public page or chip.
 */
export const CATEGORY_ORDER = [
  "food-trucks",
  "prepared-food",
  "food-producers",
  "farms",
  "produce",
  "fish",
  "poi",
  "lei",
  "flowers",
  "plants",
  "makers",
  "clothing-jewelry",
  "bath-body",
  "pets",
] as const;

export const HIDDEN_CATEGORY_SLUGS = new Set(["other", "farmers-markets"]);

// URLs ------------------------------------------------------------------------

export function marketHref(slug: string): string {
  return `/markets/${slug}`;
}

export function vendorHref(categorySlug: string, vendorSlug: string): string {
  return `/${categorySlug}/${vendorSlug}`;
}

export function searchHref(query: string): string {
  return `/search?q=${encodeURIComponent(query)}`;
}

export const HOLIDAY_FAIRS_HREF = "/holiday-fairs";

/** Home with a side picked, landing on the weekend list. */
export function homeSideHref(side: Side | null, day?: string | null): string {
  const params = new URLSearchParams();
  if (day) params.set("day", day);
  if (side) params.set("side", sideParam(side));
  const query = params.toString();
  return `/${query ? `?${query}` : ""}#this-weekend`;
}
