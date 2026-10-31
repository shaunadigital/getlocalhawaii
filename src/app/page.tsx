import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";

import { HomeFilterProvider, HomeMap } from "@/components/home/HomeFilter";
import { type HomeDay, WeekendBoard } from "@/components/home/WeekendBoard";
import { SignArrow } from "@/components/sign/ArrowSign";
import { marketRowData } from "@/components/sign/rows";
import { SearchBox } from "@/components/sign/SearchBox";
import { SignFooter } from "@/components/sign/SignFooter";
import { SignHeader } from "@/components/sign/SignHeader";
import { type IconName, SignIcon } from "@/components/sign/SignIcon";
import { TapedPhoto } from "@/components/sign/TapedPhoto";
import {
  HOLIDAY_FAIRS_HREF,
  type MarketKind,
  type FairRun,
  type MarketListing,
  getDirectory,
  getHolidayFairs,
  getWeekend,
  searchHref,
  sideFromParam,
} from "@/lib/directory";
import { dayName, hawaiiClock, monthAbbr } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "What’s open on Oahu: markets, makers and local vendors | Get Local Hawaii" },
  description:
    "See if Oʻahu farmers markets, craft fairs, lei stands and fish markets are open before you go. Each listing shows the day I last checked its source.",
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#4A3354",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface Tile {
  label: string;
  href: string;
  icon: IconName;
}

/** "WHAT KIND?" entry points. A tile shows only when it has listings behind it. */
function kindTiles(kinds: Set<MarketKind | null>, categories: Map<string, string>, hasFairs: boolean): Tile[] {
  const tiles: (Tile & { show: boolean })[] = [
    { label: "FARMERS MARKETS", href: searchHref("Farmers markets"), icon: "basket", show: kinds.has("farmers_market") },
    { label: "NIGHT MARKETS", href: searchHref("Night markets"), icon: "lights", show: kinds.has("night_market") },
    {
      label: "MAKERS",
      href: searchHref("Makers"),
      icon: "earrings",
      show: kinds.has("makers_market") || categories.has("makers"),
    },
    { label: "HOLIDAY FAIRS", href: HOLIDAY_FAIRS_HREF, icon: "gift", show: hasFairs },
    {
      label: "FOOD TRUCKS",
      href: searchHref("Food trucks"),
      icon: "truck",
      show: categories.has("food-trucks") || kinds.has("food_truck_park") || kinds.has("food_truck_rally"),
    },
    { label: "FARM STANDS", href: searchHref("Farm stands"), icon: "bananas", show: kinds.has("farm_stand") },
    {
      label: "SWAP MEETS",
      href: searchHref("Swap meets"),
      icon: "table",
      show: kinds.has("swap_meet") || kinds.has("flea_market"),
    },
    { label: "LEI STANDS", href: searchHref(categories.get("lei") ?? "Lei"), icon: "lei", show: categories.has("lei") },
    { label: "FISH AND POKE", href: searchHref(categories.get("fish") ?? "Fish"), icon: "ahi", show: categories.has("fish") },
    { label: "PRODUCE", href: searchHref("Produce"), icon: "papaya", show: categories.has("produce") },
    { label: "FLOWERS", href: searchHref("Flowers"), icon: "flowers", show: categories.has("flowers") },
    { label: "PLANTS", href: searchHref("Plants"), icon: "plant", show: categories.has("plants") },
    { label: "SNACKS AND PANTRY", href: searchHref("Snacks and pantry"), icon: "honey", show: categories.has("food-producers") },
    { label: "PREPARED FOOD", href: searchHref("Prepared food"), icon: "bread", show: categories.has("prepared-food") },
    { label: "BATH AND BODY", href: searchHref("Bath and body"), icon: "soap", show: categories.has("bath-body") },
  ];
  return tiles.filter((tile) => tile.show);
}

const TILE_TILTS = [-0.8, 0.6, -0.4, 0.8, -0.6, 0.5, 0.7, -0.7, 0.4];

interface PhotoTile {
  caption: string;
  href: string;
  src: string;
  alt: string;
}

function photoTiles(kinds: Set<MarketKind | null>, categories: Map<string, string>): PhotoTile[] {
  const tiles: (PhotoTile & { show: boolean })[] = [
    {
      caption: "Farmers markets",
      href: searchHref("Farmers markets"),
      src: "/images/stock/produce.webp",
      alt: "Papayas, apple bananas and lychee on a market table",
      show: kinds.has("farmers_market"),
    },
    {
      caption: "Farm stands",
      href: searchHref("Farm stands"),
      src: "/images/stock/farm-stand.webp",
      alt: "A parent and child choosing fruit at a roadside stand",
      show: kinds.has("farm_stand"),
    },
    {
      caption: "Night markets",
      href: searchHref("Night markets"),
      src: "/images/stock/night-market.webp",
      alt: "A night market under string lights",
      show: kinds.has("night_market"),
    },
    {
      caption: "Makers markets",
      href: searchHref("Makers markets"),
      src: "/images/stock/vendor-setup.webp",
      alt: "A vendor raising a canopy at sunrise",
      show: kinds.has("makers_market"),
    },
    {
      caption: "Lei stands",
      href: searchHref(categories.get("lei") ?? "Lei"),
      src: "/images/lei-rows.jpg",
      alt: "Rows of fresh flower lei",
      show: categories.has("lei"),
    },
  ];
  return tiles.filter((tile) => tile.show).slice(0, 3);
}

const PHOTO_TILTS = [-2, 1.5, -1];
const FAIR_TILTS = [-2, 1.5, -1, 2, -1.5];

/** "Next one Nov 5." / "One is on today." plus the one-day note when it holds. */
function fairsLine(fairs: FairRun<MarketListing>[], today: string): string {
  const [first] = fairs;
  const [, month, day] = first.date.split("-").map(Number);
  const lead = first.date === today ? "One is on today." : `Next one ${monthAbbr(month, false)} ${day}.`;
  const oneDay = fairs.filter((f) => f.dates.length === 1).length;
  return oneDay * 2 > fairs.length ? `${lead} Most run one day, so check the date.` : lead;
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const now = new Date();
  const params = await searchParams;
  const [weekend, fairs, directory] = await Promise.all([getWeekend(now), getHolidayFairs(now), getDirectory()]);

  const clock = hawaiiClock(now);
  const todayChip = `${dayName(clock.dayOfWeek).toUpperCase()} ${monthAbbr(clock.month)} ${clock.day}`;

  const days: HomeDay[] = weekend.map((day) => ({
    date: day.date,
    label: day.label,
    longLabel: day.longLabel,
    kicker: day.kicker,
    longKicker: day.longKicker,
    title: day.title,
    name: day.name,
    rows: day.rows.map(marketRowData),
  }));
  const hasWeekend = days.some((day) => day.rows.length > 0);
  const defaultDay = (days.find((day) => day.rows.length > 0) ?? days[0]).date;
  const dayParam = Array.isArray(params.day) ? params.day[0] : params.day;
  const initialDay = days.some((day) => day.date === dayParam) ? dayParam! : defaultDay;
  const initialSide = sideFromParam(params.side);

  const kinds = new Set(directory.markets.map((m) => m.kind));
  const usedCategories = new Map(
    directory.vendors.flatMap((v) => (v.category ? [[v.category.slug, v.category.name] as const] : [])),
  );
  const tiles = kindTiles(kinds, usedCategories, fairs.length > 0);
  const photos = photoTiles(kinds, usedCategories);
  const fairTags = fairs.slice(0, 5);

  return (
    <div className="flex min-h-dvh grow flex-col overflow-x-hidden bg-gl-ground font-sans text-[16px] leading-normal text-gl-cream">
      <HomeFilterProvider initialSide={initialSide} initialDay={initialDay} defaultDay={defaultDay}>
        {/* Photo hero */}
        <div className="relative pb-0 md:pb-10">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[460px] overflow-hidden md:h-full">
            <Image
              src="/images/stock/market-crowd.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[60%_center] md:object-[center_40%]"
            />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(42,28,48,0.55)_0%,rgba(74,51,84,0.72)_45%,rgba(74,51,84,0.97)_88%,#4a3354_100%)] md:bg-[linear-gradient(90deg,rgba(42,28,48,0.88)_0%,rgba(74,51,84,0.70)_45%,rgba(74,51,84,0.35)_75%,rgba(74,51,84,0.55)_100%)]" />
            <span className="absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(74,51,84,0)_70%,#4a3354_100%)] md:block" />
          </div>

          <div className="relative">
            <SignHeader current="/#this-weekend" className="h-[104px] md:h-auto" />

            <div className="mx-auto flex max-w-[1200px] flex-col md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-x-14 md:gap-y-[18px] md:px-10 md:pt-6">
              <section className="order-1 flex flex-col gap-3.5 px-4 pt-2 pb-[34px] md:col-start-1 md:row-start-1 md:gap-[18px] md:self-end md:p-0">
                <span className="-rotate-[1.5deg] self-start bg-gl-cream px-3 py-1.5 font-display text-[14px] tracking-[0.02em] text-gl-ink shadow-gl-tab md:px-3.5 md:py-[7px] md:text-[15px]">
                  <time dateTime={clock.date}>{todayChip}</time>
                </span>
                <h1 className="m-0 font-display text-[50px] leading-[0.95] font-normal tracking-[-0.01em] text-gl-cream [text-shadow:0_2px_0_#2a1c30] md:text-[clamp(44px,5.4vw,72px)] md:leading-[0.92]">
                  <span className="md:hidden">
                    WHAT’S
                    <br />
                    OPEN ON
                    <br />
                    OʻAHU
                  </span>
                  <span className="hidden md:inline">
                    WHAT’S OPEN
                    <br />
                    ON OʻAHU
                  </span>
                </h1>
                <p className="m-0 max-w-[560px] text-[18px] leading-[1.45] text-gl-soft md:text-[20px]">
                  See if it’s open before you go. Each listing shows the day I last checked its source.
                </p>
              </section>

              <div className="order-3 px-4 pt-3.5 md:col-start-1 md:row-start-2 md:max-w-[560px] md:self-start md:p-0">
                <SearchBox size="lg" />
              </div>

              <div className="order-2 px-1.5 pt-2.5 md:col-start-2 md:row-span-2 md:row-start-1 md:p-0">
                <HomeMap size="lg" framed defaultDay={defaultDay} />
              </div>
            </div>
          </div>
        </div>

        <main className="mx-auto grid w-full max-w-[1200px] grid-cols-1 [grid-template-areas:'weekend'_'strip'_'fairs'_'kinds'] md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,340px)] lg:gap-x-11 lg:[grid-template-areas:'weekend_fairs'_'strip_strip'_'kinds_kinds']">
          {hasWeekend ? (
            <section
              id="this-weekend"
              aria-label="Markets this weekend"
              className="scroll-mt-4 pt-[30px] pb-2 [grid-area:weekend] md:pt-7"
            >
              <WeekendBoard days={days} defaultDay={defaultDay} />
            </section>
          ) : null}

          {fairTags.length > 0 ? (
            <section
              aria-labelledby="fairs-heading"
              className="flex flex-col gap-4 pt-[34px] pb-2 [grid-area:fairs] lg:gap-3.5 lg:pt-7"
            >
              <h2
                id="fairs-heading"
                className="mx-4 my-0 font-display text-[28px] leading-none font-normal text-gl-cream md:mx-0 lg:text-[30px] lg:leading-[0.98]"
              >
                HOLIDAY
                <br />
                CRAFT FAIRS
              </h2>
              <p className="mx-4 my-0 text-[16px] text-gl-soft md:mx-0">{fairsLine(fairs, clock.date)}</p>
              <div className="pt-3.5 pr-4 pl-10 md:max-w-[420px] md:pl-6 lg:max-w-none lg:px-2.5 lg:pb-1.5">
                <TapedPhoto
                  src="/images/stock/craft-table.webp"
                  alt="Handmade earrings, soap and woven ornaments on a craft fair table"
                  caption="Holiday fairs"
                  href={HOLIDAY_FAIRS_HREF}
                  tilt={2}
                  sizes="(min-width: 1024px) 320px, (min-width: 768px) 400px, 85vw"
                />
              </div>
              <ul className="m-0 flex list-none gap-3.5 overflow-x-auto px-4 pt-1.5 pb-[18px] md:px-0 lg:flex-col lg:overflow-visible lg:pt-1.5 lg:pb-0">
                {fairTags.map((fair, i) => {
                  const place = fair.market.neighborhood ?? fair.market.area;
                  const meta = [[fair.dayLabel, fair.timeLabel].filter(Boolean).join(" "), place]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <li key={fair.market.id} className="flex shrink-0">
                      <Link
                        href={fair.market.href}
                        className="flex grow no-underline drop-shadow-[0_3px_0_#2a1c30] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gl-cream"
                        style={{ transform: `rotate(${FAIR_TILTS[i % FAIR_TILTS.length] * 0.6}deg)` }}
                      >
                        <span className="gl-tagshape flex grow bg-gl-ink p-[3px]">
                          <span className="gl-tagshape relative box-border flex min-h-[168px] w-[196px] flex-col gap-1 bg-gl-cream py-3.5 pr-3.5 pl-[34px] text-gl-ink lg:min-h-0 lg:w-auto lg:grow lg:flex-row lg:items-center lg:gap-3.5 lg:py-3 lg:pl-9">
                            <span
                              aria-hidden="true"
                              className="absolute top-1/2 left-[13px] -mt-1.5 size-3 rounded-full bg-gl-purple shadow-[inset_0_0_0_2px_#221a26]"
                            />
                            <span className="flex flex-col lg:w-[52px] lg:shrink-0 lg:items-center">
                              <span className="font-display text-[13px] text-gl-purple lg:text-[12px]">{fair.month}</span>
                              <span className="font-display text-[40px] leading-[0.9] lg:text-[32px]">{fair.day}</span>
                            </span>
                            <span className="mt-1 flex min-w-0 flex-col gap-0.5 lg:mt-0">
                              <span className="text-[15px] leading-[1.25] font-extrabold">{fair.market.name}</span>
                              {meta ? <span className="text-[13px] text-gl-muted">{meta}</span> : null}
                            </span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href={HOLIDAY_FAIRS_HREF}
                className="mx-4 flex min-h-11 items-center gap-2.5 self-start font-display text-[15px] text-gl-cream no-underline md:mx-0"
              >
                MORE HOLIDAY FAIRS <SignArrow size={22} className="text-gl-soft" />
              </Link>
            </section>
          ) : null}

          {photos.length > 0 ? (
            <section aria-label="Browse by kind" className="pt-[30px] pb-2 [grid-area:strip] md:pt-[52px]">
              <ul className="m-0 flex list-none gap-[18px] overflow-x-auto px-4 pt-6 pb-[18px] md:gap-7 md:overflow-visible md:px-1.5 md:pt-[26px] md:pb-2.5">
                {photos.map((photo, i) => (
                  <li
                    key={photo.caption}
                    className={`w-[230px] shrink-0 md:w-auto md:min-w-0 md:flex-1 ${i === 1 ? "md:mt-[18px]" : ""}`}
                  >
                    <TapedPhoto
                      src={photo.src}
                      alt={photo.alt}
                      caption={photo.caption}
                      href={photo.href}
                      tilt={PHOTO_TILTS[i % PHOTO_TILTS.length]}
                      sizes="(min-width: 768px) 360px, 230px"
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {tiles.length > 0 ? (
            <section
              aria-labelledby="kinds-heading"
              className="flex flex-col gap-3.5 px-4 pt-6 pb-10 [grid-area:kinds] md:gap-4 md:px-0 md:pt-[52px] md:pb-16"
            >
              <h2
                id="kinds-heading"
                className="m-0 font-display text-[28px] leading-none font-normal text-gl-cream md:text-[34px]"
              >
                WHAT KIND?
              </h2>
              <ul className="m-0 grid list-none grid-cols-3 gap-2.5 p-0 md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:gap-3.5">
                {tiles.map((tile, i) => (
                  <li key={tile.label} className="flex">
                    <Link
                      href={tile.href}
                      className="box-border flex min-h-[112px] grow flex-col items-center justify-center gap-2 border-2 border-gl-ink bg-gl-cream px-1.5 py-2.5 text-gl-ink no-underline shadow-gl-tab hover:bg-gl-cream2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gl-cream md:min-h-[140px] md:gap-2.5 md:px-2 md:py-3.5 md:shadow-gl-board"
                      style={{ transform: `rotate(${TILE_TILTS[i % TILE_TILTS.length]}deg)` }}
                    >
                      <SignIcon name={tile.icon} className="md:size-14" />
                      <span className="text-center font-display text-[11px] leading-[1.1] md:text-[13px]">{tile.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </main>
      </HomeFilterProvider>

      <SignFooter />
    </div>
  );
}
