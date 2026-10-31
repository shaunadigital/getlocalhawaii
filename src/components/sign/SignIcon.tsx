import { cn } from "@/lib/cn";

/** The brush icon set in public/art/icons. */
export const ICON_NAMES = [
  "ahi",
  "bananas",
  "basket",
  "bread",
  "coffee",
  "earrings",
  "flowers",
  "gift",
  "honey",
  "lei",
  "lights",
  "papaya",
  "plant",
  "shaveice",
  "soap",
  "table",
  "tent",
  "truck",
] as const;
export type IconName = (typeof ICON_NAMES)[number];

/**
 * A brush icon, painted in currentColor through a CSS mask so it takes the
 * text color of wherever it sits. Decorative unless `label` is given.
 */
export function SignIcon({
  name,
  size,
  label,
  className,
}: {
  name: IconName;
  /** Pixels. Leave unset to size with className (default size-11, 44px). */
  size?: number;
  label?: string;
  className?: string;
}) {
  const url = `url(/art/icons/${name}.svg)`;
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("inline-block shrink-0 bg-current", size === undefined && "size-11", className)}
      style={{
        ...(size === undefined ? {} : { width: size, height: size }),
        maskImage: url,
        WebkitMaskImage: url,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  );
}
