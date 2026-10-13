import type { MetadataRoute } from "next";

import { CAPTURE_SLUGS, GRADUATION } from "@/content/pages";
import { absoluteUrl } from "@/lib/site";

/**
 * Only the pages in the new site. The old directory pages (shop, fish and
 * farmers market pages) redirect or return 404 and are left out.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
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
