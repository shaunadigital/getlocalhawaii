import Link from "next/link";

import { mailto } from "@/lib/site";

import { FOOTER_LINKS } from "./nav";

/** From docs/BRAND_VOICE.md, Patterns. */
export const FOOTER_LINE =
  "I list what organizers and businesses post, plus other public sources. Each listing shows the day I last checked its source.";

/**
 * The footer, with the page's one "Something changed? Tell me" link. Pass
 * `subject` to name the listing in the email subject line.
 */
export function SignFooter({ subject = "Something changed" }: { subject?: string }) {
  return (
    <footer className="mt-auto bg-gl-shade text-[14px] text-gl-soft">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3.5 px-4 pt-[26px] pb-[34px] md:flex-row md:flex-wrap md:justify-between md:gap-x-10 md:gap-y-4 md:px-10 md:pt-8 md:pb-10">
        <div className="flex flex-col gap-2.5 md:flex-[1_1_320px]">
          <a
            href={mailto(subject)}
            className="self-start font-display text-[15px] text-gl-marigold no-underline hover:text-gl-cream md:text-[16px]"
          >
            SOMETHING CHANGED? TELL ME
          </a>
          <p className="m-0 hidden max-w-[520px] text-gl-footnote md:block">{FOOTER_LINE}</p>
        </div>
        <nav aria-label="Site" className="flex flex-wrap content-start gap-x-[18px] gap-y-2 md:gap-x-[22px]">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-gl-soft underline-offset-2 hover:text-gl-cream">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="m-0 text-gl-footnote md:hidden">{FOOTER_LINE}</p>
      </div>
    </footer>
  );
}
