import Link from "next/link";

import { cn } from "@/lib/cn";
import {
  KIND_PLURALS,
  SIDE_NAMES,
  SIDE_ORDER,
  getDirectory,
  homeSideHref,
  searchHref,
} from "@/lib/directory";

import { HangingLogo } from "./HangingLogo";
import { type MenuGroups, SIGN_NAV } from "./nav";
import { SignMenu } from "./SignMenu";

/** Menu groups from the directory: sides, categories with listings, market kinds with listings. */
async function menuGroups(): Promise<MenuGroups> {
  const { categories, vendors, markets } = await getDirectory();
  const used = new Set(vendors.map((v) => v.category?.id));
  const kinds = new Set(markets.map((m) => m.kind));
  return {
    sides: SIDE_ORDER.map((side) => ({ href: homeSideHref(side), label: SIDE_NAMES[side] })),
    categories: categories.filter((c) => used.has(c.id)).map((c) => ({ href: searchHref(c.name), label: c.name })),
    kinds: (Object.keys(KIND_PLURALS) as (keyof typeof KIND_PLURALS)[])
      .filter((kind) => kinds.has(kind))
      .map((kind) =>
        kind === "holiday_fair"
          ? { href: "/holiday-fairs", label: KIND_PLURALS[kind] }
          : { href: searchHref(KIND_PLURALS[kind]), label: KIND_PLURALS[kind] },
      ),
  };
}

/**
 * The site header for the sign pages: hanging logo sign, plain-text nav links
 * from md up, and a Menu button below md. `current` is the href of the page
 * the visitor is on; its link gets the cream underline.
 */
export async function SignHeader({ current, className }: { current?: string; className?: string }) {
  const groups = await menuGroups();
  return (
    <header id="top" className={cn("relative", className)}>
      <span aria-hidden="true" className="absolute inset-x-0 top-0 hidden h-3.5 bg-gl-shade md:block" />
      <div className="relative mx-auto flex max-w-[1200px] items-start justify-between gap-x-6 px-4 md:px-10">
        <HangingLogo />
        <nav aria-label="Main" className="hidden flex-wrap items-center gap-x-[30px] gap-y-1 pt-10 md:flex">
          {SIGN_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={current === link.href ? "page" : undefined}
              className={cn(
                "block border-b-4 pt-2 pb-1.5 text-[17px] font-extrabold text-gl-cream no-underline hover:text-gl-soft",
                current === link.href ? "border-gl-cream" : "border-transparent",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <SignMenu groups={groups} className="mt-[26px] md:hidden" />
      </div>
    </header>
  );
}
