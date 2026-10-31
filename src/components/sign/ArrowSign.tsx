import { cn } from "@/lib/cn";

/** The small painted arrow used on links and rows. Decorative. */
export function SignArrow({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={cn("gl-lift shrink-0", className)}>
      <path d="M3.5 9.5h8.5V5l8.5 7-8.5 7v-4.5H3.5z" fill="currentColor" />
    </svg>
  );
}

/**
 * An arrow board: a cream plank with an ink outline that points right.
 * `selected` darkens the dot and lifts the plank to full cream; unselected
 * planks sit on cream2. Marigold is never used here (two per screen at most,
 * and the home page spends them on the search button and the footer link).
 */
export function ArrowSign({
  label,
  kicker,
  selected = true,
  tilt = 0,
  className,
  size = "md",
}: {
  label: React.ReactNode;
  kicker?: React.ReactNode;
  selected?: boolean;
  /** Degrees. */
  tilt?: number;
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={cn("inline-flex", className)}
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
    >
      <span className="gl-arrowboard gl-lift flex bg-gl-ink p-[3px] drop-shadow-[0_6px_6px_rgba(42,28,48,0.25)]">
        <span
          className={cn(
            "gl-arrowboard flex items-center gap-3 pr-[34px] pl-4 text-gl-ink",
            size === "lg" ? "min-h-[58px] md:pr-[38px]" : "min-h-[52px]",
            selected ? "bg-gl-cream" : "bg-gl-cream2",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "size-2 shrink-0 rounded-full",
              selected ? "bg-gl-ink" : "border-2 border-gl-ink bg-transparent",
            )}
          />
          <span className={cn("font-display leading-none", size === "lg" ? "text-[24px]" : "text-[22px]")}>
            {label}
          </span>
          {kicker ? (
            <span className={cn("font-extrabold tracking-[0.06em]", size === "lg" ? "text-[14px]" : "text-[13px]")}>
              {kicker}
            </span>
          ) : null}
        </span>
      </span>
    </span>
  );
}

/**
 * A section heading painted on an arrow board. Use for headings that say what
 * is under them: WHERE TO FIND THEM, WHO SELLS HERE.
 */
export function ArrowHeading({
  children,
  kicker,
  level = 2,
  tilt = -1,
  id,
  className,
}: {
  children: React.ReactNode;
  kicker?: React.ReactNode;
  level?: 2 | 3;
  tilt?: number;
  id?: string;
  className?: string;
}) {
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Tag id={id} className={cn("m-0 font-normal", className)}>
      <ArrowSign label={children} kicker={kicker} tilt={tilt} />
    </Tag>
  );
}
