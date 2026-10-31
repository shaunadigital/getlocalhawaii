import type { Metadata } from "next";
import Link from "next/link";

import { SignArrow } from "@/components/sign/ArrowSign";
import { SearchBox } from "@/components/sign/SearchBox";
import { SignFooter } from "@/components/sign/SignFooter";
import { SignHeader } from "@/components/sign/SignHeader";
import { HOLIDAY_FAIRS_HREF, SIDE_NAMES, SIDE_ORDER, homeSideHref } from "@/lib/directory";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh grow flex-col overflow-x-hidden bg-gl-ground font-sans text-[16px] leading-normal text-gl-cream">
      <SignHeader />
      <main className="mx-auto box-border flex w-full max-w-[760px] flex-col gap-3.5 px-4 pt-2.5 pb-11 md:px-10 md:pt-10 md:pb-16">
        <div className="flex -rotate-3 pt-[18px]">
          <span className="gl-arrowboard flex bg-gl-ink p-[3px] drop-shadow-[0_6px_6px_rgba(42,28,48,0.3)]">
            <span className="gl-arrowboard flex flex-col gap-0.5 bg-gl-cream py-4 pr-[52px] pl-5 text-gl-ink">
              <span className="font-display text-[13px] text-gl-purple">404</span>
              <span className="font-display text-[34px] leading-[0.95] md:text-[44px]">WRONG TURN</span>
            </span>
          </span>
        </div>
        <span aria-hidden="true" className="-mt-3.5 ml-[60px] h-[60px] w-2.5 bg-gl-shade" />
        <h1 className="m-0 font-display text-[30px] leading-none font-normal text-gl-cream md:text-[40px]">
          THIS PAGE ISN’T HERE
        </h1>
        <p className="m-0 text-[17px] leading-normal text-gl-soft md:text-[19px]">
          The link may be old, or the listing may have moved. Search for it, or start from a side of the island.
        </p>

        <SearchBox className="mt-2" />

        <nav aria-label="Sides of the island">
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {SIDE_ORDER.map((side) => (
              <li key={side}>
                <Link
                  href={homeSideHref(side)}
                  className="flex min-h-10 items-center border-2 border-gl-ink bg-gl-cream px-3 font-display text-[12px] text-gl-ink uppercase no-underline hover:bg-gl-cream2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gl-cream"
                >
                  {SIDE_NAMES[side]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="m-0 flex list-none flex-col p-0">
          {[
            { href: "/#this-weekend", label: "What’s open this weekend" },
            { href: HOLIDAY_FAIRS_HREF, label: "Holiday fairs" },
          ].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex min-h-11 items-center gap-2 self-start font-extrabold text-gl-cream no-underline hover:underline"
              >
                {link.label}
                <SignArrow size={20} className="text-gl-soft" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SignFooter />
    </div>
  );
}
