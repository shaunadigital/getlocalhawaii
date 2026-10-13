import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListingPage, type ListingPageProps } from "@/components/ListingPage";
import { AREA_PAGES, DELIVERY, type PageCopy } from "@/content/pages";
import { findLeiType } from "@/content/lei-types";
import { getCategoryListing, getSlugSets } from "@/lib/queries";
import { asciiSlug } from "@/lib/slug";
import type { VendorSummary } from "@/lib/types";

/**
 * The capture pages, all under /[island]/[category]/[slug].
 *
 * One route serves three kinds of page because they share a shape: prose plus
 * a filtered list of the same vendors. The third segment resolves to a lei
 * type, to the delivery page, or to an area page, in that order. An area only
 * becomes a page once someone has written prose for it, so AREA_PAGES is the
 * list rather than the set of areas present in the data.
 */

export const dynamic = "force-dynamic";

/** Photo and menu highlight for the pages that have them. */
const PAGE_EXTRAS: Record<string, Partial<ListingPageProps>> = {
  airport: {
    heading: "Honolulu airport lei",
    current: "/oahu/lei/airport",
    image: {
      src: "/images/plumeria-lei-greeting.jpg",
      alt: "Hands placing a yellow plumeria lei over someone\u2019s shoulders",
      position: "center 35%",
    },
  },
  delivery: {
    heading: "Send a lei to the mainland",
    current: "/oahu/lei/delivery",
    image: {
      src: "/images/orchid-lei-stringing.jpg",
      alt: "Hands stringing a purple and white orchid lei",
      position: "center 45%",
    },
    proseTitle: "Before you order",
  },
};

type Resolved = {
  copy: PageCopy;
  filter: (vendor: VendorSummary) => boolean;
  emptyMessage: string;
};

function resolve(three: string): Resolved | null {
  const type = findLeiType(three);
  if (type) {
    return {
      copy: {
        slug: type.slug,
        heading: `${type.name} lei on Oʻahu`,
        title: type.title,
        description: type.description,
        intro: type.intro,
        body: type.body,
      },
      // A shop qualifies when its own posted product list names the flower.
      filter: (vendor) =>
        vendor.productLabels.some((label) => asciiSlug(label) === type.slug),
      emptyMessage: `No listing on this site names ${type.name.toLowerCase()} in its posted products yet. That does not mean nobody strings it, only that no source I have read says so. If you know a shop that does, tell me.`,
    };
  }

  if (three === DELIVERY.slug) {
    return {
      copy: DELIVERY,
      filter: (vendor) => vendor.shipsMainland === true,
      emptyMessage:
        "No listing on this site currently says it ships to the mainland. Local delivery is common and often unadvertised, so it is worth asking any shop directly.",
    };
  }

  const area = AREA_PAGES.find((page) => page.slug === three);
  if (area) {
    return {
      copy: area,
      filter: (vendor) => asciiSlug(vendor.area) === area.slug,
      emptyMessage: `No shops are listed in this area yet.`,
    };
  }

  return null;
}

async function load(one: string, two: string, three: string) {
  const resolved = resolve(three);
  if (!resolved) return null;

  const { islands, categories } = await getSlugSets();
  // This depth only means anything under an island and a category.
  if (!islands.has(one) || !categories.has(two)) return null;

  const listing = await getCategoryListing(one, two, new Date());
  if (!listing) return null;

  return { ...resolved, vendors: listing.vendors.filter(resolved.filter) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ one: string; two: string; three: string }>;
}): Promise<Metadata> {
  const { one, two, three } = await params;
  const resolved = resolve(three);
  if (!resolved) return {};

  const path = `/${one}/${two}/${three}`;
  return {
    title: resolved.copy.title,
    description: resolved.copy.description,
    alternates: { canonical: path },
    openGraph: {
      title: resolved.copy.title,
      description: resolved.copy.description,
      url: path,
    },
  };
}

export default async function CapturePage({
  params,
}: {
  params: Promise<{ one: string; two: string; three: string }>;
}) {
  const { one, two, three } = await params;
  const page = await load(one, two, three);
  if (!page) notFound();

  const path = `/${one}/${two}/${three}`;
  const extra = PAGE_EXTRAS[three] ?? {};

  return (
    <ListingPage
      heading={page.copy.heading}
      {...extra}
      intro={page.copy.intro}
      body={page.copy.body}
      vendors={page.vendors}
      path={path}
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: page.copy.heading, path },
      ]}
      emptyMessage={page.emptyMessage}
    />
  );
}
