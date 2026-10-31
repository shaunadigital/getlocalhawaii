/**
 * JSON-LD for a market page. A market is an Event: weekly markets carry an
 * eventSchedule, dated fairs carry one Event per upcoming run. Fields the
 * source did not give are left out rather than padded.
 */

import type { MarketListing } from "@/lib/directory";
import { absoluteUrl } from "@/lib/site";

import { splitRuns } from "./format";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function prune<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== null)) as T;
}

/** "777 Ward Ave, Honolulu, HI 96814" into PostalAddress parts. */
function postalAddress(address: string | null, locality: string | null) {
  if (!address) {
    return prune({ "@type": "PostalAddress", addressLocality: locality ?? undefined, addressRegion: "HI", addressCountry: "US" });
  }
  const parts = address.split(",").map((p) => p.trim());
  const region = parts[2]?.match(/^([A-Z]{2})\s*(\d{5})?/);
  return prune({
    "@type": "PostalAddress",
    streetAddress: parts[0] || undefined,
    addressLocality: parts[1] || locality || undefined,
    addressRegion: region?.[1] ?? "HI",
    postalCode: region?.[2],
    addressCountry: "US",
  });
}

export function marketSchema(market: MarketListing, today: string) {
  const url = absoluteUrl(market.href);
  const organizerName = market.organizer?.name ?? market.operator;
  const base = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: market.name,
    url,
    description: market.description ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: organizerName
      ? prune({ "@type": "Organization", name: organizerName, url: market.organizer?.website ?? undefined })
      : undefined,
    location: prune({
      "@type": "Place",
      name: market.venueName ?? market.locationNotes ?? market.area ?? market.name,
      address: postalAddress(market.address, market.area),
      geo:
        market.lat !== null && market.lng !== null
          ? { "@type": "GeoCoordinates", latitude: market.lat, longitude: market.lng }
          : undefined,
    }),
    sameAs: market.website ? [market.website] : undefined,
  };

  if (market.sessions.length > 0) {
    return prune({
      ...base,
      startDate: market.next?.startsAt?.toISOString(),
      eventSchedule: market.sessions.map((s) => ({
        "@type": "Schedule",
        repeatFrequency: "P1W",
        byDay: `https://schema.org/${DAY_NAMES[s.dayOfWeek]}`,
        startTime: s.starts.slice(0, 5),
        endTime: s.ends.slice(0, 5),
        scheduleTimezone: "Pacific/Honolulu",
      })),
    });
  }

  const runs = splitRuns(market.dates.filter((d) => d.date >= today));
  if (runs.length === 0) return null;
  const events = runs.map((run) => {
    const first = run[0];
    const last = run[run.length - 1];
    const posted = run.every((d) => d.timePosted);
    return prune({
      ...base,
      startDate: posted ? first.startsAt.toISOString() : first.date,
      endDate: posted
        ? (last.endsAt ?? last.startsAt).toISOString()
        : run.length > 1
          ? last.date
          : undefined,
    });
  });
  return events.length === 1 ? events[0] : events;
}
