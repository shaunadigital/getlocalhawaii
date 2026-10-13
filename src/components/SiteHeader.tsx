import Link from "next/link";

import { Logo } from "@/components/Logo";
import { MenuIcon } from "@/components/Icons";
import { NAV_LINKS } from "@/lib/site";

/**
 * Logo and menu. Sits over the hero photo, so everything here is white.
 * The phone menu is a <details> element: it works without JavaScript.
 */
export function SiteHeader({ current }: { current?: string }) {
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-(--container-page) items-start justify-between gap-6 px-4 md:px-8">
      <Logo />

      <nav aria-label="Site" className="mt-[30px] hidden flex-wrap gap-x-7 gap-y-1 md:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={link.href === current ? "page" : undefined}
            className={`py-2 text-[15px] font-bold text-white no-underline [text-shadow:0_1px_8px_rgba(0,0,0,0.5)] hover:text-white ${
              link.href === current ? "border-b-[3px] border-orchid" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <details className="group relative mt-3.5 md:hidden">
        <summary
          aria-label="Open menu"
          className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg border border-white/35 bg-ink/55 text-white [&::-webkit-details-marker]:hidden"
        >
          <MenuIcon />
        </summary>
        <nav
          aria-label="Site"
          className="absolute top-13 right-0 flex w-56 flex-col rounded-xl bg-ink p-2 shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-3 text-[16px] font-bold text-white no-underline hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </details>
    </div>
  );
}
