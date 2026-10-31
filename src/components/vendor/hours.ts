/**
 * Weekly hours as the vendor boards print them: a one-line summary
 * ("Fri 10a to 6p · Sat 10a to 3p") and a row per day for the full list.
 * Days without posted hours read "Closed" only when other days are posted.
 */

import { bodyRange } from "@/lib/directory/status";
import type { OpeningHours } from "@/lib/status";
import { dayName, longDayName } from "@/lib/time";

function dayText(hours: OpeningHours[], dow: number): string | null {
  const rows = hours
    .filter((h) => h.dayOfWeek === dow)
    .sort((a, b) => a.opens.localeCompare(b.opens))
    .map((h) => bodyRange(h.opens, h.closes));
  return rows.length ? rows.join(", ") : null;
}

/** "Sun and Mon 7a to 6p · Tue to Sat 7a to 7p". Consecutive days with the same hours are grouped. */
export function hoursSummary(hours: OpeningHours[]): string | null {
  if (hours.length === 0) return null;
  const groups: { from: number; to: number; text: string }[] = [];
  for (let dow = 0; dow < 7; dow++) {
    const text = dayText(hours, dow);
    if (!text) continue;
    const last = groups[groups.length - 1];
    if (last && last.to === dow - 1 && last.text === text) last.to = dow;
    else groups.push({ from: dow, to: dow, text });
  }
  return groups
    .map(({ from, to, text }) => {
      const days =
        from === to
          ? dayName(from)
          : to === from + 1
            ? `${dayName(from)} and ${dayName(to)}`
            : `${dayName(from)} to ${dayName(to)}`;
      return `${days} ${text}`;
    })
    .join(" · ");
}

export interface HoursRow {
  day: string;
  text: string;
  isToday: boolean;
  closed: boolean;
}

export function hoursRows(hours: OpeningHours[], todayDow: number): HoursRow[] {
  return Array.from({ length: 7 }, (_, dow) => {
    const text = dayText(hours, dow);
    return { day: longDayName(dow), text: text ?? "Closed", isToday: dow === todayDow, closed: text === null };
  });
}
