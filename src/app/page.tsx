import type { Metadata } from "next";
import Link from "next/link";

import { Byline } from "@/components/Byline";
import { Door } from "@/components/Door";
import { Hero } from "@/components/Hero";
import { ArrowRight } from "@/components/Icons";
import { Sign } from "@/components/Sign";
import { SignupForm } from "@/components/SignupForm";
import { SiteFooter } from "@/components/SiteFooter";
import { LEI_TYPES } from "@/content/lei-types";
import { formatDay, latestCheck } from "@/lib/checked";
import { getCategoryListing } from "@/lib/queries";
import { showSignup } from "@/lib/site";

// The checked dates on the doors come from the data, so nothing is cached.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Honolulu Airport Lei and Sending a Lei | Get Local Hawaii" },
};

/**
 * The lightweight home: doors only to pages that are live, the lūʻau guide
 * as an email signup until it exists, and the lei type pages. A door is
 * added here when its page goes live; there are no "coming soon" tiles.
 */
export default async function Home() {
  const listing = await getCategoryListing("oahu", "lei", new Date());
  const vendors = listing?.vendors ?? [];

  const checked = (items: typeof vendors) => {
    const date = latestCheck(items);
    return date ? `Checked ${formatDay(date)}` : null;
  };

  return (
    <>
      <Hero
        title="Get the lei of the land"
        sub="Honolulu airport lei stands and sending a lei to the mainland, from someone born and raised on Oʻahu."
        image={{ src: "/images/lei-rows.jpg", alt: "Rows of fresh flower lei", position: "30% center" }}
      />

      <main className="mx-auto flex w-full max-w-(--container-page) flex-col px-4 md:px-8">
        <section className="flex flex-col gap-4 pt-7 md:gap-5 md:pt-14">
          <Sign title="What do you need?" />
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            <Door
              href="/oahu/lei/airport"
              kicker="AT THE AIRPORT NOW"
              title="Honolulu airport lei"
              checked={checked(vendors.filter((vendor) => vendor.area === "Airport"))}
              image={{
                src: "/images/plumeria-lei-greeting.jpg",
                alt: "Hands placing a yellow plumeria lei over someone’s shoulders",
                position: "center 35%",
              }}
            />
            <Door
              href="/oahu/lei/delivery"
              kicker="SENDING A LEI"
              title="Send a lei to the mainland"
              checked={checked(vendors.filter((vendor) => vendor.shipsMainland))}
              image={{
                src: "/images/orchid-lei-stringing.jpg",
                alt: "Hands stringing a purple and white orchid lei",
                position: "center 45%",
              }}
            />
          </div>
        </section>

        {showSignup() ? (
        <section className="pt-7 md:pt-12">
          <div className="flex flex-col gap-3 rounded-2xl bg-sand px-4 py-5 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-x-12 md:gap-y-6 md:rounded-[18px] md:px-9 md:py-8">
            <div className="flex flex-col gap-3 md:flex-[1_1_420px] md:gap-3.5">
              <Sign title="Coming next" tag="Lūʻau guide" />
              <p className="m-0 max-w-[520px] text-[17px] leading-[1.5] md:text-[19px]">
                Every Oʻahu lūʻau compared for 2026: price, place and who each one suits. Get it by
                email when it is up.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:flex-[1_1_380px]">
              <SignupForm
                id="luau-email"
                label="Your email"
                button="Send it to me"
                tag="luau-guide"
                tone="light"
              />
              <span className="text-[13px] text-ink-soft md:text-[14px]">
                Plus Lei Day and graduation reminders. A few emails a year, and you can unsubscribe
                anytime.
              </span>
            </div>
          </div>
        </section>
        ) : null}

        <section id="lei-by-flower" className="flex scroll-mt-6 flex-col gap-4 pt-8 md:gap-5 md:pt-12">
          <Sign title="Lei by flower" tag={`${LEI_TYPES.length} lei`} />
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0 md:gap-3">
            {LEI_TYPES.map((type) => (
              <li key={type.slug}>
                <Link
                  href={`/oahu/lei/${type.slug}`}
                  className="flex min-h-11 items-center rounded-full border border-[#c9cbc5] bg-white px-4 text-[15px] font-bold no-underline hover:border-ink md:text-[16px]"
                >
                  {type.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/guides/graduation-lei"
            className="group flex min-h-11 items-center gap-2 self-start font-bold no-underline md:text-[17px]"
          >
            Graduation lei: what to buy and when to order
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-orchid text-white">
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-[3px]" />
            </span>
          </Link>
        </section>

        <Byline />
      </main>

      <SiteFooter signup={false} />
    </>
  );
}
