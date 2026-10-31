import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/JsonLd";
import {
  LinksBoard,
  MoreOnSide,
  type NearbyRow,
  OrganizerBoard,
  PaymentBoard,
  SourceLine,
  WhoSellsHere,
  nearbyRow,
} from "@/components/market/DetailBoards";
import {
  MORE_ON_SIDE,
  addDays,
  bodyDateYear,
  dateTimes,
  kindIcon,
  occurrenceTimes,
  plainSpelling,
  pluralDay,
  splitRuns,
} from "@/components/market/format";
import { marketSchema } from "@/components/market/marketSchema";
import { ComingDates, NextBoard } from "@/components/market/NextBoard";
import { CheckedLine } from "@/components/sign/CheckedLine";
import { SignFooter } from "@/components/sign/SignFooter";
import { SignHeader } from "@/components/sign/SignHeader";
import { SignIcon } from "@/components/sign/SignIcon";
import {
  HOLIDAY_FAIRS_HREF,
  HOLIDAY_FAIR_KINDS,
  KIND_PLURALS,
  type MarketListing,
  getMarket,
  getMarkets,
  hawaiiToday,
  homeSideHref,
  marketOccurrences,
  occurrenceStatus,
  searchHref,
} from "@/lib/directory";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

function isFairKind(market: Pick<MarketListing, "kind">): boolean {
  return market.kind !== null && (HOLIDAY_FAIR_KINDS.includes(market.kind) || market.kind === "festival");
}

/** "Saturdays 7:30a to 11a" or "Fri Nov 27 to Sun Nov 29, 2026", for the meta description. */
function whenPhrase(market: MarketListing, today: string): string | null {
  const next = market.next;
  if (!next) return null;
  if (next.source === "session") {
    return [pluralDay(next.dayOfWeek), occurrenceTimes(next)].filter(Boolean).join(" ");
  }
  const run = splitRuns(market.dates.filter((d) => d.date >= today))[0];
  if (!run) return null;
  const first = run[0];
  const last = run[run.length - 1];
  if (run.length > 1) return `${bodyDateYear(first.date).replace(/, \d{4}$/, "")} to ${bodyDateYear(last.date)}`;
  const times = dateTimes(first);
  return times ? `${bodyDateYear(first.date)}, ${times}` : bodyDateYear(first.date);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const now = new Date();
  const market = await getMarket(slug, now);
  if (!market) return { title: "Not found", robots: { index: false } };

  const today = hawaiiToday(now);
  const name = plainSpelling(market.name);
  const year = market.next?.date.slice(0, 4);
  const title =
    market.sessions.length > 0
      ? `${name}${market.area ? `, ${plainSpelling(market.area)}` : ""}: hours and next market day`
      : `${name}: ${year ? `${year} dates` : "dates"} and hours`;

  const when = whenPhrase(market, today);
  const place = [market.venueName ?? market.locationNotes, market.neighborhood ?? market.area].filter(Boolean).join(", ");
  const lead = when ? `${market.name}: ${when}${place ? ` at ${place}` : ""}.` : `${market.name}${place ? `, ${place}` : ""}. Next date not posted yet.`;
  const description = `${lead} See if it’s on before you go.${market.checked ? ` Checked ${market.checked.date}.` : ""}`;

  return {
    title,
    description,
    alternates: { canonical: market.href },
    openGraph: { title, description, url: market.href },
  };
}

export default async function MarketPage({ params }: { params: Params }) {
  const { slug } = await params;
  const now = new Date();
  const market = await getMarket(slug, now);
  if (!market) notFound();

  const today = hawaiiToday(now);
  const pageUrl = absoluteUrl(market.href);

  // Coming dates: the next few weekly days, or the dated runs ahead.
  const coming = marketOccurrences(market, today, addDays(today, market.sessions.length > 0 ? 42 : 400))
    .filter((o) => o.date > today || !o.endsAt || o.endsAt > now)
    .slice(0, market.sessions.length > 0 ? 6 : 10);
  const singleWeekday =
    market.sessions.length > 0 && new Set(market.sessions.map((s) => s.dayOfWeek)).size === 1
      ? market.sessions[0].dayOfWeek
      : null;
  const comingLabel = singleWeekday !== null ? `COMING ${pluralDay(singleWeekday).toUpperCase()}` : "COMING DATES";

  // More on this side: other markets with a next date, soonest first.
  let nearby: NearbyRow[] = [];
  if (market.side) {
    const others = (await getMarkets(now))
      .filter((m) => m.side === market.side && m.id !== market.id && m.next)
      .sort(
        (a, b) =>
          a.next!.date.localeCompare(b.next!.date) ||
          (a.next!.starts ?? "99").localeCompare(b.next!.starts ?? "99") ||
          a.name.localeCompare(b.name),
      )
      .slice(0, 4);
    nearby = others
      .map((m) => {
        const s = occurrenceStatus(m.next!, now);
        // The time column already says "Hours not posted"; skip the matching chip.
        const chip = s && s.tone !== "not_posted" ? { tone: s.tone, label: s.label } : null;
        return nearbyRow(m, today, chip);
      })
      .filter((r): r is NearbyRow => r !== null);
  }

  const fair = isFairKind(market);
  const crumbs: { href?: string; label: string }[] = [];
  if (market.kind) {
    crumbs.push(
      fair
        ? { href: HOLIDAY_FAIRS_HREF, label: "Holiday fairs" }
        : { href: searchHref(KIND_PLURALS[market.kind]), label: KIND_PLURALS[market.kind] },
    );
  }
  if (market.side && market.sideName) crumbs.push({ href: homeSideHref(market.side), label: market.sideName });
  const placeCrumb = market.neighborhood ?? market.area;
  if (placeCrumb) crumbs.push({ label: placeCrumb });

  const schema = marketSchema(market, today);

  return (
    <div className="flex min-h-dvh grow flex-col overflow-x-hidden bg-gl-ground font-sans text-[16px] leading-normal text-gl-cream">
      {schema ? <JsonLd data={schema} /> : null}
      <SignHeader current={fair ? HOLIDAY_FAIRS_HREF : undefined} className="h-[104px] md:h-auto" />

      <section className="mx-auto flex w-full max-w-[1200px] flex-col gap-3.5 px-4 pt-1.5 md:flex-row md:items-end md:justify-between md:gap-10 md:px-10 md:pt-5">
        <div className="flex min-w-0 flex-col gap-3.5 md:gap-3">
          {crumbs.length > 0 ? (
            <nav aria-label="Breadcrumb">
              <ol className="m-0 flex list-none flex-wrap gap-1.5 p-0 text-[14px] font-bold text-gl-soft">
                {crumbs.map((c, i) => (
                  <li key={c.label} className="flex gap-1.5">
                    {i > 0 ? <span aria-hidden="true">/</span> : null}
                    {c.href ? (
                      <Link href={c.href} className="text-gl-cream underline underline-offset-2 hover:text-gl-soft">
                        {c.label}
                      </Link>
                    ) : (
                      <span aria-current="page">{c.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <h1 className="m-0 font-display text-[clamp(32px,10vw,42px)] leading-[0.95] font-normal break-words text-gl-cream uppercase [text-shadow:0_2px_0_#2a1c30] md:text-[clamp(48px,5.4vw,72px)]">
              {market.name}
            </h1>
            <span
              aria-hidden="true"
              className="flex size-[84px] flex-none -rotate-6 items-center justify-center rounded-full border-2 border-gl-ink bg-gl-cream text-gl-ink shadow-gl-board md:hidden"
            >
              <SignIcon name={kindIcon(market.kind)} size={54} />
            </span>
          </div>
          {market.description ? (
            <p className="m-0 max-w-[720px] text-[19px] leading-normal text-gl-soft md:text-[21px]">
              {market.description}
            </p>
          ) : (
            <p className="m-0 text-[17px] text-gl-soft">{market.kindLabel}</p>
          )}
          <CheckedLine checked={market.checked} />
        </div>
        <span
          aria-hidden="true"
          className="hidden size-[120px] flex-none -rotate-6 items-center justify-center rounded-full border-2 border-gl-ink bg-gl-cream text-gl-ink shadow-gl-board md:flex"
        >
          <SignIcon name={kindIcon(market.kind)} size={78} />
        </span>
      </section>

      <main className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-9 px-4 pt-6 pb-11 md:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] md:items-start md:gap-x-11 md:px-10 md:pt-9 md:pb-16">
        <div className="flex flex-col gap-[22px] md:sticky md:top-6 md:col-start-2 md:row-start-1">
          <NextBoard market={market} today={today} pageUrl={pageUrl} />
          <ComingDates occurrences={coming} label={comingLabel} />
        </div>

        <div className="flex min-w-0 flex-col gap-9 md:col-start-1 md:row-start-1">
          <PaymentBoard market={market} />
          <OrganizerBoard market={market} />
          <LinksBoard market={market} />
          <SourceLine market={market} />
          <WhoSellsHere market={market} />
          {market.side ? <MoreOnSide heading={MORE_ON_SIDE[market.side]} rows={nearby} /> : null}
        </div>
      </main>

      <SignFooter subject={`Something changed: ${market.name}`} />
    </div>
  );
}
