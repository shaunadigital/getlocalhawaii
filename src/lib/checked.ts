import type { Freshness } from "./status";
import { HAWAII_TZ } from "./time";

const DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: HAWAII_TZ,
});

/**
 * "Checked Aug 19" for a listing read from a public source, "Verified Aug 19"
 * only when a person made contact. Null when nothing has been checked, so the
 * line is hidden rather than shown empty.
 */
export function checkedLine(freshness: Freshness): string | null {
  if (!freshness.verifiedAt || !freshness.method) return null;
  const verb = freshness.method === "source_check" ? "Checked" : "Verified";
  return `${verb} ${DAY.format(freshness.verifiedAt)}`;
}

/** The most recent check across a set of listings, for a page or a door. */
export function latestCheck(items: { freshness: Freshness }[]): Date | null {
  let latest: Date | null = null;
  for (const { freshness } of items) {
    if (freshness.verifiedAt && (!latest || freshness.verifiedAt > latest)) {
      latest = freshness.verifiedAt;
    }
  }
  return latest;
}

export function formatDay(date: Date): string {
  return DAY.format(date);
}
