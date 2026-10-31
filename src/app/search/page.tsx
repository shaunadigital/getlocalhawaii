import type { Metadata } from "next";

import {
  type AlsoLink,
  AlsoMatches,
  type BrowseTile,
  BrowseInstead,
  MarketBoard,
  NothingListed,
  SearchHeading,
  VendorBoard,
} from "@/components/search/SearchParts";
import { headingIcon, marketHitRow, vendorHitRow } from "@/components/search/searchRows";
import { SearchBox } from "@/components/sign/SearchBox";
import { SignFooter } from "@/components/sign/SignFooter";
import { SignHeader } from "@/components/sign/SignHeader";
import { LEI_TYPES } from "@/content/lei-types";
import { HOLIDAY_FAIRS_HREF, getDirectory, getHolidayFairs, searchHref } from "@/lib/directory";
import { type SearchResults, normalize, searchDirectory } from "@/lib/directory/search";
import { asciiText } from "@/lib/slug";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readQuery(params: Record<string, string | string[] | undefined>): string {
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  return (raw ?? "").trim().slice(0, 100);
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const q = readQuery(await searchParams);
  return {
    title: q ? `Search results for ${asciiText(q)}` : "Search Oahu markets and vendors",
    description: "Search Oʻahu markets and vendors by name, food or place, and see if they’re open before you go.",
    alternates: { canonical: "/search" },
    robots: q ? { index: false, follow: true } : undefined,
  };
}

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** What the lead list is about, in caps: "LEI", "FARMERS MARKETS", "WHO SELLS POKE". */
function headingFor(results: SearchResults): { title: string; term: string | null } {
  const { intent, query, lead } = results;
  const typed = query.toUpperCase();
  switch (intent.type) {
    case "category":
      return { title: intent.category.name.toUpperCase(), term: intent.category.name.toLowerCase() };
    case "kind": {
      if (!intent.within) return { title: intent.label.toUpperCase(), term: null };
      const place = results.markets
        .flatMap((m) => [m.market.neighborhood, m.market.area])
        .find((p) => p && normalize(p) === intent.within);
      return { title: `${intent.label} in ${place ?? intent.within}`.toUpperCase(), term: null };
    }
    case "place":
      return { title: intent.label.toUpperCase(), term: null };
    default:
      if (lead === "vendors" && results.productMatch) return { title: `WHO SELLS ${typed}`, term: query.toLowerCase() };
      return { title: `${lead === "vendors" ? "VENDORS" : "MARKETS"} MATCHING “${typed}”`, term: null };
  }
}

function leadSub(results: SearchResults): string {
  if (results.lead === "vendors") {
    const n = results.vendors.length;
    const base = n === 1 ? "1 vendor." : `${n} vendors, soonest first.`;
    return results.vendors.some((v) => v.next)
      ? `${base} Times are the market’s hours, and not every vendor comes every week.`
      : base;
  }
  const n = results.markets.length;
  return n === 1 ? "1 market." : `${n} markets, soonest first.`;
}

function emptyCopy(results: SearchResults): { title: string; body: string } {
  const { intent, query } = results;
  const title = `NOTHING LISTED FOR “${query.toUpperCase()}” YET`;
  switch (intent.type) {
    case "category":
      return { title, body: `No ${intent.category.name.toLowerCase()} vendors are listed here yet.` };
    case "kind":
      return { title, body: `No ${intent.label.toLowerCase()} are listed here yet.` };
    case "place":
      return { title, body: `Nothing in ${intent.label} is listed here yet.` };
    default:
      return { title, body: `None of the vendors listed here mention ${query} yet.` };
  }
}

/** Lei type guides that match ("pikake" also links the pīkake lei page). */
function guideLinks(normalized: string): AlsoLink[] {
  const words = normalized.split(" ");
  return LEI_TYPES.filter((type) => normalized === type.slug || words.includes(type.slug)).map((type) => ({
    href: `/oahu/lei/${type.slug}`,
    label: `${type.name} lei guide`,
  }));
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const now = new Date();
  const q = readQuery(await searchParams);
  const [directory, fairs] = await Promise.all([getDirectory(), getHolidayFairs(now)]);
  const results = searchDirectory(directory, q, now);

  const kinds = new Set(directory.markets.map((m) => m.kind));
  const usedCategories = new Set(directory.vendors.map((v) => v.category?.slug));
  const tileCandidates: (BrowseTile & { show: boolean })[] = [
    { label: "FARMERS MARKETS", href: searchHref("Farmers markets"), icon: "basket", show: kinds.has("farmers_market") },
    { label: "MAKERS", href: searchHref("Makers"), icon: "earrings", show: kinds.has("makers_market") || usedCategories.has("makers") },
    { label: "HOLIDAY FAIRS", href: HOLIDAY_FAIRS_HREF, icon: "gift", show: fairs.length > 0 },
    { label: "LEI STANDS", href: searchHref("Lei"), icon: "lei", show: usedCategories.has("lei") },
    { label: "FISH AND POKE", href: searchHref("Fish"), icon: "ahi", show: usedCategories.has("fish") },
  ];
  const tiles = tileCandidates.filter((t) => t.show).slice(0, 3);

  const hasResults = results.vendors.length + results.markets.length > 0;
  const { title, term } = headingFor(results);

  const vendorRows = results.vendors.map((hit) => vendorHitRow(hit, now));
  const marketRows = results.markets.map((hit) => marketHitRow(hit, now, results.productMatch ? term : null));
  const leadVendors = results.lead === "vendors";

  let secondaryTitle: string | null = null;
  if (leadVendors && marketRows.length > 0) {
    const allLinked = results.markets.every((m) => m.vendorMatches > 0);
    secondaryTitle = allLinked && term ? `MARKETS WITH ${term.toUpperCase()}` : "MARKETS";
  } else if (!leadVendors && vendorRows.length > 0) {
    secondaryTitle = results.intent.type === "place" ? `VENDORS IN ${results.intent.label.toUpperCase()}` : "VENDORS";
  }

  const also: AlsoLink[] = [
    ...results.places.map((p) => ({
      href: p.href,
      label: p.label,
      detail: [p.markets ? plural(p.markets, "market") : null, p.vendors ? plural(p.vendors, "vendor") : null]
        .filter(Boolean)
        .join(", "),
    })),
    ...guideLinks(results.normalized),
  ];

  return (
    <div className="flex min-h-dvh grow flex-col overflow-x-hidden bg-gl-ground font-sans text-[16px] leading-normal text-gl-cream">
      <SignHeader className="h-[104px] md:h-auto" />

      <section aria-label="Search" className="mx-auto w-full max-w-[1200px] px-4 pb-2 md:px-10 md:pt-6">
        <div className="md:max-w-[720px]">
          <SearchBox key={q} defaultValue={q} />
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-[34px] px-4 pt-[26px] pb-10 md:flex-row md:flex-wrap md:items-start md:gap-x-11 md:gap-y-9 md:px-10 md:pt-9 md:pb-16">
        {!q ? (
          <div className="flex w-full flex-col gap-[34px]">
            <h1 className="m-0 font-display text-[34px] leading-none font-normal md:text-[44px]">SEARCH</h1>
            <BrowseInstead tiles={tiles} />
          </div>
        ) : !hasResults ? (
          <div className="flex w-full flex-col gap-[34px]">
            <NothingListed {...emptyCopy(results)} />
            {also.length > 0 ? (
              <div className="md:max-w-[720px]">
                <AlsoMatches links={also} />
              </div>
            ) : null}
            <BrowseInstead tiles={tiles} />
          </div>
        ) : (
          <>
            <section aria-labelledby="results-heading" className="flex min-w-0 flex-col gap-3.5 md:flex-[999_1_540px] md:gap-4">
              <div id="results-heading">
                <SearchHeading title={title} sub={leadSub(results)} icon={headingIcon(results)} />
              </div>
              {leadVendors ? <VendorBoard rows={vendorRows} /> : <MarketBoard rows={marketRows} />}
            </section>

            {secondaryTitle || also.length > 0 ? (
              <aside className="flex min-w-0 flex-col gap-3.5 md:flex-[1_1_340px] md:gap-4 md:pt-[18px]">
                {secondaryTitle ? (
                  <>
                    <h2 className="m-0 font-display text-[24px] leading-none font-normal text-gl-cream">{secondaryTitle}</h2>
                    {leadVendors ? <MarketBoard rows={marketRows} /> : <VendorBoard rows={vendorRows} />}
                  </>
                ) : null}
                <AlsoMatches links={also} />
              </aside>
            ) : null}
          </>
        )}
      </main>

      <SignFooter subject={q ? `Search: ${q}` : undefined} />
    </div>
  );
}
