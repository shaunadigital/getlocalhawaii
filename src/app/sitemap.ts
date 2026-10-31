import type { MetadataRoute } from "next";

import { CAPTURE_SLUGS, GRADUATION } from "@/content/pages";
import { HOLIDAY_FAIRS_HREF, getDirectory } from "@/lib/directory";
import { absoluteUrl } from "@/lib/site";

/** Same window as the directory fetch cache. */
export const revalidate = 300;

/**
 * The pages in the new site: home, holiday fairs, each published market and
 * each published vendor with a source, plus the lei capture pages, the guide
 * and the legal pages. Old /farmers-markets/* URLs redirect and are left out.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const { markets, vendors } = await getDirectory();

  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl(HOLIDAY_FAIRS_HREF), lastModified, changeFrequency: "daily", priority: 0.9 },
    ...markets.map((market) => ({
      url: absoluteUrl(market.href),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...vendors
      .filter((vendor) => vendor.sourceUrl && vendor.href)
      .map((vendor) => ({
        url: absoluteUrl(vendor.href as string),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...CAPTURE_SLUGS.map((slug) => ({
      url: absoluteUrl(`/oahu/lei/${slug}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: slug === "airport" || slug === "delivery" ? 0.9 : 0.7,
    })),
    {
      url: absoluteUrl(`/guides/${GRADUATION.slug}`),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: absoluteUrl("/about"), lastModified, changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/disclosure"), lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/privacy"), lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
