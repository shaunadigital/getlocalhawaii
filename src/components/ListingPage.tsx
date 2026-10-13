import Link from "next/link";

import { Byline } from "@/components/Byline";
import { Hero } from "@/components/Hero";
import { ArrowDown } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { ShopCard } from "@/components/ShopCard";
import { Sign } from "@/components/Sign";
import { SiteFooter } from "@/components/SiteFooter";
import { formatDay, latestCheck } from "@/lib/checked";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import type { VendorSummary } from "@/lib/types";

/**
 * Shared page for the airport, delivery, lei type, area and graduation pages:
 * a hero, the shops, then the prose. They differ only in copy, photo and
 * which shops they carry.
 */
export interface ListingPageProps {
  heading: string;
  intro: string;
  body: string[];
  vendors: VendorSummary[];
  path: string;
  breadcrumbs: { name: string; path: string }[];
  /** Shown when the page has prose but nothing to list yet. */
  emptyMessage: string;
  image?: { src: string; alt: string; position?: string };
  /** The menu item this page belongs to, underlined on desktop. */
  current?: string;
  /** Heading for the prose section. */
  proseTitle?: string;
  /** Guides lead with the writing; the shop pages lead with the shops. */
  proseFirst?: boolean;
}

export function ListingPage({
  heading,
  intro,
  body,
  vendors,
  path,
  breadcrumbs,
  emptyMessage,
  image,
  current,
  proseTitle = "Before you go",
  proseFirst = false,
}: ListingPageProps) {
  // Open first, then the rest in the order the data gives them.
  const sorted = [...vendors].sort(
    (a, b) => Number(b.status.isOpenNow) - Number(a.status.isOpenNow),
  );
  const openNow = vendors.filter((vendor) => vendor.status.isOpenNow).length;
  const checked = latestCheck(vendors);

  // Facts only: no total of open stands, and a zero is left off entirely.
  const meta = [
    checked ? `Sources checked ${formatDay(checked)}` : null,
    openNow > 0 ? `${openNow} open now` : null,
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      {vendors.length > 0 ? <JsonLd data={itemListSchema(vendors, { name: heading, path })} /> : null}

      <Hero
        title={heading}
        sub={intro}
        image={image}
        current={current}
        meta={
          meta.length > 0 ? (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {openNow > 0 ? (
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full bg-open shadow-[0_0_0_3px_rgba(74,222,128,0.25),0_0_12px_rgba(74,222,128,0.8)]"
                />
              ) : null}
              {meta.join(" · ")}
            </span>
          ) : null
        }
      >
        {vendors.length > 0 ? (
          <Link
            href="#shops"
            className="group mt-1 flex min-h-[50px] items-stretch self-start overflow-hidden rounded-lg border border-ink text-ink no-underline"
          >
            <span className="flex w-[52px] items-center justify-center bg-orchid text-white">
              <ArrowDown size={24} className="transition-transform group-hover:translate-y-[3px]" />
            </span>
            <span className="flex items-center bg-white px-5 text-[16px] font-extrabold tracking-[0.08em]">
              SEE THE SHOPS
            </span>
          </Link>
        ) : null}
      </Hero>

      <main className="mx-auto flex w-full max-w-(--container-page) flex-col px-4 md:px-8">
        {proseFirst ? (
          <>
        <section className="flex flex-col gap-4 pt-8 md:pt-12">
          <Sign title={proseTitle} />
          <div className="flex max-w-[68ch] flex-col gap-4">
            {body.map((paragraph, index) => (
              <p key={index} className="m-0 text-[16px] leading-[1.7] md:text-[17px]">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section id="shops" className="flex scroll-mt-6 flex-col gap-4 pt-10 md:gap-5 md:pt-14">
          <Sign
            title="The shops"
            tag={vendors.length > 0 ? `${vendors.length} listed` : undefined}
          />
          {vendors.length === 0 ? (
            <p className="m-0 max-w-[68ch] rounded-2xl bg-sand p-4 text-[15px] leading-[1.6] text-ink-soft">
              {emptyMessage}
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              {sorted.map((vendor) => (
                <ShopCard key={vendor.slug} vendor={vendor} />
              ))}
            </div>
          )}
        </section>

          </>
        ) : (
          <>
        <section id="shops" className="flex scroll-mt-6 flex-col gap-4 pt-8 md:gap-5 md:pt-12">
          <Sign
            title="The shops"
            tag={vendors.length > 0 ? `${vendors.length} listed` : undefined}
          />
          {vendors.length === 0 ? (
            <p className="m-0 max-w-[68ch] rounded-2xl bg-sand p-4 text-[15px] leading-[1.6] text-ink-soft">
              {emptyMessage}
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              {sorted.map((vendor) => (
                <ShopCard key={vendor.slug} vendor={vendor} />
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4 pt-10 md:pt-14">
          <Sign title={proseTitle} />
          <div className="flex max-w-[68ch] flex-col gap-4">
            {body.map((paragraph, index) => (
              <p key={index} className="m-0 text-[16px] leading-[1.7] md:text-[17px]">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

          </>
        )}

        <Byline />
      </main>

      <SiteFooter />
    </>
  );
}
