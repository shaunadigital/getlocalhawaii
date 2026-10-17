import Link from "next/link";

import { SITE_LOGO } from "@/lib/site";

/**
 * The hanging shop sign: orchid board, white lettering, white cords and a
 * thin white edge, so it reads on any photo and on charcoal. On a light
 * ground (the coming-soon home) the cords and top pins turn charcoal so they
 * stay visible; the sign itself does not change.
 */
export function Logo({ ground = "dark", className = "" }: { ground?: "dark" | "light"; className?: string }) {
  const cord = ground === "light" ? "bg-ink" : "bg-white";
  const dot = "absolute size-2 rounded-full bg-white";
  const pin = `absolute size-2 rounded-full ${cord}`;
  return (
    <Link
      href="/"
      aria-label={`${SITE_LOGO} home`}
      className={`relative block h-[88px] w-[196px] shrink-0 no-underline ${className}`}
    >
      <span className={`${pin} top-1 left-[46px]`} />
      <span className={`${pin} top-1 left-[142px]`} />
      <span className={`absolute top-[9px] left-[49px] h-[22px] w-0.5 ${cord}`} />
      <span className={`absolute top-[9px] left-[145px] h-[22px] w-0.5 ${cord}`} />
      <span className={`absolute top-7 left-3.5 flex h-[54px] w-[168px] items-center justify-center rounded-lg bg-orchid font-script text-[16px] leading-none text-white ${ground === "light" ? "shadow-[0_0_0_2px_#fff,0_6px_12px_rgba(21,24,27,0.22)]" : "shadow-[0_0_0_2px_#fff,0_6px_10px_rgba(0,0,0,0.35)]"}`}>
        {SITE_LOGO}
      </span>
      <span className={`${dot} top-[25px] left-[46px]`} />
      <span className={`${dot} top-[25px] left-[142px]`} />
    </Link>
  );
}
