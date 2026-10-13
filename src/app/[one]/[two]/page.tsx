import { notFound, redirect } from "next/navigation";

import { getSlugSets, loadVendor } from "@/lib/queries";

/**
 * The old directory lived at this depth: /oahu/lei, /oahu/fish and
 * /oahu/farmers-markets as listings, and /lei/[shop], /fish/[shop] and
 * /farmers-markets/[market] as detail pages.
 *
 * While the site is rebuilt around visitors and gifting:
 * - lei pages redirect, temporarily, to the restyled page that now carries
 *   them, since they will come back in the new design;
 * - fish and farmers markets are not part of the new site and return 404.
 */

export const dynamic = "force-dynamic";

type Params = Promise<{ one: string; two: string }>;

export default async function Page({ params }: { params: Params }) {
  const { one, two } = await params;
  const { islands, categories } = await getSlugSets();

  // /oahu/lei, the old all-shops listing.
  if (islands.has(one) && two === "lei") redirect("/");

  // /lei/[shop]: send the visitor to the page that lists that shop now.
  if (categories.has(one) && one === "lei") {
    const { vendor } = await loadVendor(one, two);
    if (!vendor) notFound();
    if (vendor.area === "Airport") redirect(`/oahu/lei/airport#${vendor.slug}`);
    if (vendor.shipsMainland) redirect(`/oahu/lei/delivery#${vendor.slug}`);
    if (vendor.area === "Chinatown") redirect(`/oahu/lei/chinatown#${vendor.slug}`);
    redirect("/");
  }

  notFound();
}
