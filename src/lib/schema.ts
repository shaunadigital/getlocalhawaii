/**
 * JSON-LD builders. Every field is omitted when the data is missing, so a
 * sparse listing produces a small valid object rather than a complete-looking
 * one padded with guesses.
 */

import type { VendorDetail } from "./queries";
import { absoluteUrl } from "./site";
import type { OpeningHours } from "./status";
import type { VendorSummary } from "./types";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** "1034 Maunakea St, Honolulu, HI 96817" into schema.org PostalAddress parts. */
function postalAddress(address: string) {
  const parts = address.split(",").map((part) => part.trim());
  const region = parts[2]?.match(/^([A-Z]{2})\s*(\d{5})?/);

  return {
    "@type": "PostalAddress",
    streetAddress: parts[0] || undefined,
    addressLocality: parts[1] || undefined,
    addressRegion: region?.[1],
    postalCode: region?.[2],
    addressCountry: "US",
  };
}

/** Collapse the week into one specification per distinct opening time. */
function openingHours(hours: OpeningHours[]) {
  const grouped = new Map<string, number[]>();
  for (const entry of hours) {
    const key = `${entry.opens}|${entry.closes}`;
    grouped.set(key, [...(grouped.get(key) ?? []), entry.dayOfWeek]);
  }

  return [...grouped.entries()].map(([key, days]) => {
    const [opens, closes] = key.split("|");
    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days.sort((a, b) => a - b).map((day) => DAY_NAMES[day]),
      // schema.org wants 24-hour HH:MM; the columns are already that shape.
      opens: opens.slice(0, 5),
      closes: closes.slice(0, 5),
    };
  });
}

/**
 * Florist rather than the bare LocalBusiness: it is a valid schema.org subtype
 * and tells search engines what kind of shop this actually is.
 */
export function floristSchema(vendor: VendorDetail, path: string) {
  return prune({
    "@context": "https://schema.org",
    "@type": "Florist",
    name: vendor.name,
    url: absoluteUrl(path),
    description: vendor.description ?? vendor.story ?? undefined,
    telephone: vendor.phone ?? undefined,
    address: vendor.address ? postalAddress(vendor.address) : undefined,
    openingHoursSpecification: vendor.hours.length > 0 ? openingHours(vendor.hours) : undefined,
    areaServed: vendor.islandName || undefined,
    // The vendor's own site, which is also where this listing was read from.
    sameAs: vendor.website ? [vendor.website] : undefined,
  });
}

export function itemListSchema(
  vendors: VendorSummary[],
  options: { name: string; path: string },
) {
  return prune({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: options.name,
    url: absoluteUrl(options.path),
    numberOfItems: vendors.length,
    itemListElement: vendors.map((vendor, index) => ({
      "@type": "ListItem",
      position: index + 1,
      // Shop pages are paused, so each item points at its card on this page.
      url: absoluteUrl(`${options.path}#${vendor.slug}`),
      name: vendor.name,
    })),
  });
}

/**
 * A market as a recurring Event rather than a LocalBusiness.
 *
 * A People's Open Market stop is not a business at an address that keeps
 * opening hours; it is the same vendors turning up in a park for an hour a
 * week. Event with an eventSchedule describes that honestly, and it is the
 * type Google reads for the "when is it on" answer.
 */
export function marketEventSchema(
  market: {
    name: string;
    area: string;
    description: string | null;
    locationNotes: string | null;
    operator: string | null;
    lat: number | null;
    lng: number | null;
    sessions: OpeningHours[] | { dayOfWeek: number; starts: string; ends: string }[];
  },
  path: string,
) {
  const sessions = market.sessions as { dayOfWeek: number; starts: string; ends: string }[];

  return prune({
    "@context": "https://schema.org",
    "@type": "Event",
    name: market.name,
    url: absoluteUrl(path),
    description: market.description ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: market.operator ? { "@type": "Organization", name: market.operator } : undefined,
    location: prune({
      "@type": "Place",
      name: market.locationNotes ?? market.name,
      address: prune({
        "@type": "PostalAddress",
        addressLocality: market.area,
        addressRegion: "HI",
        addressCountry: "US",
      }),
      geo:
        market.lat !== null && market.lng !== null
          ? { "@type": "GeoCoordinates", latitude: market.lat, longitude: market.lng }
          : undefined,
    }),
    eventSchedule: sessions.map((session) => ({
      "@type": "Schedule",
      repeatFrequency: "P1W",
      byDay: `https://schema.org/${DAY_NAMES[session.dayOfWeek]}`,
      startTime: session.starts.slice(0, 5),
      endTime: session.ends.slice(0, 5),
      scheduleTimezone: "Pacific/Honolulu",
    })),
  });
}

/** The markets listing. Markets live on their own path, so this is separate. */
export function marketListSchema(
  markets: { slug: string; name: string }[],
  options: { name: string; path: string },
) {
  return prune({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: options.name,
    url: absoluteUrl(options.path),
    numberOfItems: markets.length,
    itemListElement: markets.map((market, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/farmers-markets/${market.slug}`),
      name: market.name,
    })),
  });
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** Drop undefined keys so the emitted JSON has no empty scaffolding in it. */
function prune<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined && v !== null),
  ) as T;
}
