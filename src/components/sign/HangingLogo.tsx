import Link from "next/link";

import { SITE_LOGO } from "@/lib/site";

/**
 * The hanging logo sign: a purple board on two strings and two nails, tilted
 * a touch. 176 by 90 on phones, 210 by 112 from md up.
 */
export function HangingLogo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label={`${SITE_LOGO} home`}
      className="relative block h-[90px] w-[176px] shrink-0 no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gl-cream md:h-[112px] md:w-[210px]"
    >
      <span aria-hidden="true" className="absolute top-0 left-[44px] h-9 w-0.5 bg-gl-cream md:top-2.5 md:left-[52px]" />
      <span aria-hidden="true" className="absolute top-0 left-[130px] h-9 w-0.5 bg-gl-cream md:top-2.5 md:left-[154px]" />
      <span className="absolute top-[34px] left-3 box-border flex h-[50px] w-[152px] -rotate-2 items-center justify-center rounded-lg bg-gl-logo font-script text-[14px] leading-none text-gl-cream shadow-[0_0_0_2px_#fbf7f0,0_8px_14px_rgba(42,28,48,0.3)] md:top-11 md:left-4 md:h-[58px] md:w-[178px] md:rounded-[9px] md:text-[17px]">
        {SITE_LOGO}
      </span>
      <span aria-hidden="true" className="absolute top-[31px] left-[41px] size-2 rounded-full bg-gl-cream md:top-[41px] md:left-[49px]" />
      <span aria-hidden="true" className="absolute top-[31px] left-[127px] size-2 rounded-full bg-gl-cream md:top-[41px] md:left-[151px]" />
    </Link>
  );
}
