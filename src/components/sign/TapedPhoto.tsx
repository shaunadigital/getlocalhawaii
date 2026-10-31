import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

/**
 * A snapshot taped to the board: cream frame, ink outline, a strip of tape on
 * top and a handwritten caption. Captions name where the tile leads
 * ("Farmers markets"), never a real market for a generated photo.
 */
export function TapedPhoto({
  src,
  alt,
  caption,
  href,
  tilt = 0,
  sizes = "(min-width: 768px) 360px, 80vw",
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  caption?: string;
  href?: string;
  /** Degrees. */
  tilt?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const figure = (
    <figure
      className={cn(
        "relative m-0 box-border border-2 border-gl-ink bg-gl-cream p-[9px] pb-[38px] shadow-gl-board",
        className,
      )}
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
    >
      <span
        aria-hidden="true"
        className="absolute -top-3 left-1/2 z-10 -ml-[42px] h-6 w-[84px] -rotate-3 border-x-2 border-dashed border-x-[rgba(21,24,27,0.18)] bg-[rgba(239,231,218,0.85)]"
      />
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-gl-muted">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </span>
      {caption ? (
        <figcaption className="absolute right-[9px] bottom-[9px] left-[11px] truncate font-script text-[12px] leading-[1.2] text-gl-ink">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );

  if (!href) return figure;
  return (
    <Link
      href={href}
      className="block rounded-[2px] no-underline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-gl-cream"
    >
      {figure}
    </Link>
  );
}
