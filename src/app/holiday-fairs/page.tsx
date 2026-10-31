import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/JsonLd";
import { FairMonthBoard } from "@/components/fairs/FairList";
import { fairRuns, fairsWithoutDates, groupByMonth } from "@/components/fairs/fairs";
import { bodyDateYear } from "@/components/market/format";
import { SignArrow } from "@/components/sign/ArrowSign";
import { CreamBoard } from "@/components/sign/CreamBoard";
import { SignFooter } from "@/components/sign/SignFooter";
import { SignHeader } from "@/components/sign/SignHeader";
import { SignIcon } from "@/components/sign/SignIcon";
import { TapedPhoto } from "@/components/sign/TapedPhoto";
import { cn } from "@/lib/cn";
import {
  HOLIDAY_FAIRS_HREF,
  SIDE_NAMES,
  SIDE_ORDER,
  getMarkets,
  hawaiiToday,
  sideFromParam,
  sideParam,
} from "@/lib/directory";
import { absoluteUrl, mailto } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Holiday craft fairs on Oahu: dates and hours",
  description:
    "Holiday craft fairs and annual makers fairs on Oʻahu by month, with dates, hours when posted and where each one is. Most run one day, so check the date.",
  alternates: { canonical: HOLIDAY_FAIRS_HREF },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const CHIP =
  "flex min-h-10 flex-none items-center border-2 border-gl-ink px-3 font-display text-[12px] whitespace-nowrap no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gl-cream";

export default async function HolidayFairsPage({ searchParams }: { searchParams: SearchParams }) {
  const now = new Date();
  const today = hawaiiToday(now);
  const params = await searchParams;
  const markets = await getMarkets(now);

  const allRuns = fairRuns(markets, today);
  const sides = SIDE_ORDER.filter((side) => allRuns.some((r) => r.market.side === side));
  const requested = sideFromParam(params.side);
  const side = requested && sides.includes(requested) ? requested : null;
  const runs = side ? allRuns.filter((r) => r.market.side === side) : allRuns;
  const months = groupByMonth(runs, today);
  const undated = fairsWithoutDates(markets, today);

  const oneDay = allRuns.filter((r) => r.dates.length === 1).length;
  const intro =
    oneDay * 2 > allRuns.length
      ? "Holiday craft fairs and annual makers fairs on Oʻahu, by month. Most run one day, so check the date."
      : "Holiday craft fairs and annual makers fairs on Oʻahu, by month.";

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Holiday craft fairs on Oahu",
    url: absoluteUrl(HOLIDAY_FAIRS_HREF),
    numberOfItems: allRuns.length,
    itemListElement: allRuns.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(r.market.href),
      name: r.market.name,
    })),
  };

  const sideFilter =
    sides.length > 1 ? (
      <nav aria-label="Filter by side of the island">
        <ul className="m-0 flex list-none gap-2 overflow-x-auto p-0 pb-1 md:flex-wrap md:overflow-visible">
          <li className="flex">
            <Link
              href={HOLIDAY_FAIRS_HREF}
              scroll={false}
              aria-current={side === null ? "true" : undefined}
              className={cn(CHIP, side === null ? "bg-gl-ink text-gl-cream" : "bg-gl-cream text-gl-ink hover:bg-gl-cream2")}
            >
              ALL SIDES
            </Link>
          </li>
          {sides.map((s) => (
            <li key={s} className="flex">
              <Link
                href={`${HOLIDAY_FAIRS_HREF}?side=${sideParam(s)}`}
                scroll={false}
                aria-current={side === s ? "true" : undefined}
                className={cn(CHIP, side === s ? "bg-gl-ink text-gl-cream" : "bg-gl-cream text-gl-ink hover:bg-gl-cream2")}
              >
                {SIDE_NAMES[s].toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    ) : null;

  return (
    <div className="flex min-h-dvh grow flex-col overflow-x-hidden bg-gl-ground font-sans text-[16px] leading-normal text-gl-cream">
      <JsonLd data={schema} />
      <SignHeader current={HOLIDAY_FAIRS_HREF} className="h-[104px] md:h-auto" />

      <section className="mx-auto flex w-full max-w-[1200px] flex-col gap-3.5 px-4 pt-1.5 md:flex-row md:items-end md:justify-between md:gap-10 md:px-10 md:pt-5">
        <div className="flex min-w-0 flex-col gap-3.5 md:gap-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="m-0 font-display text-[40px] leading-[0.95] font-normal text-gl-cream [text-shadow:0_2px_0_#2a1c30] md:text-[clamp(48px,5.4vw,72px)]">
              HOLIDAY CRAFT FAIRS
            </h1>
            <span
              aria-hidden="true"
              className="flex size-[84px] flex-none -rotate-6 items-center justify-center rounded-full border-2 border-gl-ink bg-gl-cream text-gl-ink shadow-gl-board md:hidden"
            >
              <SignIcon name="gift" size={54} />
            </span>
          </div>
          <p className="m-0 max-w-[680px] text-[18px] leading-normal text-gl-soft md:text-[21px]">{intro}</p>
        </div>
        <span
          aria-hidden="true"
          className="hidden size-[120px] flex-none -rotate-6 items-center justify-center rounded-full border-2 border-gl-ink bg-gl-cream text-gl-ink shadow-gl-board md:flex"
        >
          <SignIcon name="gift" size={78} />
        </span>
      </section>

      <main className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-[30px] px-4 pt-4 pb-11 md:grid-cols-[minmax(0,1fr)_300px] md:items-start md:gap-x-11 md:px-10 md:pt-8 md:pb-16 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-[18px]">
          {sideFilter ? <div className="md:hidden">{sideFilter}</div> : null}
          <p className="m-0 text-[15px] text-gl-soft md:text-[16px]">
            Dates and hours are what each organizer posts. Hours not posted means the source gives the date but not
            the times yet.
          </p>

          {months.length > 0 ? (
            months.map((month) => <FairMonthBoard key={month.key} month={month} />)
          ) : (
            <CreamBoard>
              <div className="flex flex-col gap-2 p-4 md:px-5">
                <span className="font-display text-[13px] text-gl-purple">NOT POSTED YET</span>
                <p className="m-0 text-[16px]">
                  {side
                    ? `No fair dates posted yet for ${SIDE_NAMES[side]}.`
                    : "No upcoming fair dates are posted yet."}
                </p>
                {side ? (
                  <Link href={HOLIDAY_FAIRS_HREF} className="font-extrabold text-gl-ink">
                    See fairs on any side
                  </Link>
                ) : null}
              </div>
            </CreamBoard>
          )}

          {undated.length > 0 ? (
            <CreamBoard as="section" aria-labelledby="undated-heading" className="mt-3">
              <div className="flex flex-col gap-2 p-4 md:px-5">
                <h2 id="undated-heading" className="m-0 font-display text-[13px] font-normal text-gl-purple">
                  DATES NOT POSTED YET
                </h2>
                <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[15px]">
                  {undated.map(({ market, lastDate }) => (
                    <li key={market.id}>
                      <Link href={market.href} className="font-bold text-gl-ink">
                        {market.name}
                      </Link>
                      {lastDate ? <span className="text-gl-muted"> ({bodyDateYear(lastDate).replace(", ", " in ")})</span> : null}
                    </li>
                  ))}
                </ul>
                <a
                  href={mailto("A holiday fair date")}
                  className="flex min-h-11 items-center gap-2 self-start font-extrabold text-gl-ink no-underline"
                >
                  Know a date? Tell me <SignArrow size={18} className="text-gl-purple" />
                </a>
              </div>
            </CreamBoard>
          ) : null}
        </div>

        <aside className="hidden flex-col gap-8 md:sticky md:top-6 md:flex">
          <div className="px-3 pt-4">
            <TapedPhoto
              src="/images/stock/craft-table.webp"
              alt="Handmade earrings, soap and woven ornaments on a craft fair table"
              caption="Holiday fairs"
              tilt={2}
              sizes="340px"
            />
          </div>
          {sideFilter ? (
            <div className="flex flex-col gap-3">
              <span className="font-display text-[13px] text-gl-soft">BY SIDE OF THE ISLAND</span>
              {sideFilter}
            </div>
          ) : null}
        </aside>
      </main>

      <SignFooter subject="Something changed: holiday fairs" />
    </div>
  );
}
