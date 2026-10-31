import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { cache } from "react";

import { VendorPage } from "@/components/vendor/VendorPage";
import { getCategories, getMarket, getMarkets, getVendor, getVendorBySlug, getVendors, marketHref } from "@/lib/directory";
import { getSlugSets, loadVendor } from "@/lib/queries";

/**
 * Two-segment URLs:
 * - /[category]/[vendor], the vendor page, read from the directory. A vendor
 *   asked for under the wrong category moves permanently to its real URL.
 * - /farmers-markets/[market], the old market URL, moves to /markets/[market].
 * - /oahu/lei, the old all-shops listing, still redirects home.
 * - /lei/[shop] for a shop that is not in the directory keeps the old
 *   temporary redirect to the page that lists it now.
 */

export const dynamic = "force-dynamic";

type Params = Promise<{ one: string; two: string }>;

/** One `now` and one lookup per request, shared by the metadata and the page. */
const loadDirectoryVendor = cache(async (categorySlug: string, vendorSlug: string) => {
  const now = new Date();
  const categories = await getCategories();
  const isCategory = categories.some((c) => c.slug === categorySlug);
  const vendor = isCategory ? await getVendor(categorySlug, vendorSlug, now) : null;
  return { now, isCategory, vendor };
});

/** Plain spelling for titles: no ʻokina or kahakō, straight apostrophes. */
function plain(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ʻ‘]/g, "")
    .replace(/’/g, "'");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { one, two } = await params;
  const { vendor } = await loadDirectoryVendor(one, two);
  if (!vendor || !vendor.href) return {};

  const place = vendor.neighborhood ?? vendor.area;
  const kind = vendor.category?.name.toLowerCase();
  const where = place ? `${place}, Oahu` : "Oahu";
  const title = plain(`${vendor.name}: ${kind ? `${kind} in ` : ""}${where}`);
  const description = [
    vendor.description ? `${vendor.description}.` : null,
    "Hours, address and where to find them. Each listing shows the day I last checked its source.",
  ]
    .filter(Boolean)
    .join(" ")
    .replace("..", ".");

  return {
    title,
    description,
    alternates: { canonical: vendor.href },
    openGraph: { title, description, url: vendor.href },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { one, two } = await params;

  // /oahu/lei, the old all-shops listing.
  const { islands, categories: legacyCategories } = await getSlugSets();
  if (islands.has(one) && two === "lei") redirect("/");

  // /farmers-markets/[slug] moved to /markets/[slug].
  if (one === "farmers-markets") {
    const market = await getMarket(two, new Date());
    if (!market) notFound();
    permanentRedirect(marketHref(market.slug));
  }

  const { now, isCategory, vendor } = await loadDirectoryVendor(one, two);

  if (vendor) {
    const [markets, vendors] = await Promise.all([getMarkets(now), getVendors(now)]);
    const linked = new Set(vendor.markets.map((m) => m.id));
    const nearby = vendor.side
      ? vendors
          .filter((v) => v.id !== vendor.id && v.side === vendor.side && v.category?.id === vendor.category?.id && v.href)
          .sort((a, b) => Number(b.status.isOpenNow) - Number(a.status.isOpenNow) || a.name.localeCompare(b.name))
          .slice(0, 3)
      : [];
    return (
      <VendorPage vendor={vendor} markets={markets.filter((m) => linked.has(m.id))} nearby={nearby} now={now} />
    );
  }

  if (isCategory) {
    // The same vendor filed under another category: send it to its real URL.
    const elsewhere = await getVendorBySlug(two, now);
    if (elsewhere?.href) permanentRedirect(elsewhere.href);
  }

  // /lei/[shop] for a shop not published in the directory: the old fallback.
  if (legacyCategories.has(one) && one === "lei") {
    const { vendor: legacy } = await loadVendor(one, two);
    if (!legacy) notFound();
    if (legacy.area === "Airport") redirect(`/oahu/lei/airport#${legacy.slug}`);
    if (legacy.shipsMainland) redirect(`/oahu/lei/delivery#${legacy.slug}`);
    if (legacy.area === "Chinatown") redirect(`/oahu/lei/chinatown#${legacy.slug}`);
    redirect("/");
  }

  notFound();
}
