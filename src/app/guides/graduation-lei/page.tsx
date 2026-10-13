import type { Metadata } from "next";

import { ListingPage } from "@/components/ListingPage";
import { GRADUATION } from "@/content/pages";
import { getCategoryListing } from "@/lib/queries";

export const dynamic = "force-dynamic";

const PATH = "/guides/graduation-lei";

export const metadata: Metadata = {
  title: GRADUATION.title,
  description: GRADUATION.description,
  alternates: { canonical: PATH },
  openGraph: {
    title: GRADUATION.title,
    description: GRADUATION.description,
    url: PATH,
  },
};

export default async function GraduationGuide() {
  const listing = await getCategoryListing("oahu", "lei", new Date());

  return (
    <ListingPage
      heading={GRADUATION.heading}
      intro={GRADUATION.intro}
      body={GRADUATION.body}
      vendors={listing?.vendors ?? []}
      path={PATH}
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: GRADUATION.heading, path: PATH },
      ]}
      emptyMessage="No lei shops are listed yet."
      proseTitle="What to buy and when"
      proseFirst
    />
  );
}
