import Link from "next/link";

import { SITE_LOGO } from "@/lib/site";

/**
 * The hanging shop sign: orchid board, white lettering, white cords and a
 * thin white edge, so it reads on any photo and on charcoal.
 */
export function Logo() {
  const dot = "absolute size-2 rounded-full bg-white";
  return (
    <Link
      href="/"
      aria-label={`${SITE_LOGO} home`}
      className="relative block h-[88px] w-[196px] shrink-0 no-underline"
    >
      <span className={`${dot} top-1 left-[46px]`} />
      <span className={`${dot} top-1 left-[142px]`} />
      <span className="absolute top-[9px] left-[49px] h-[22px] w-0.5 bg-white" />
      <span className="absolute top-[9px] left-[145px] h-[22px] w-0.5 bg-white" />
      <span className="absolute top-7 left-3.5 flex h-[54px] w-[168px] items-center justify-center rounded-lg bg-orchid font-script text-[16px] leading-none text-white shadow-[0_0_0_2px_#fff,0_6px_10px_rgba(0,0,0,0.35)]">
        {SITE_LOGO}
      </span>
      <span className={`${dot} top-[25px] left-[46px]`} />
      <span className={`${dot} top-[25px] left-[142px]`} />
    </Link>
  );
}
