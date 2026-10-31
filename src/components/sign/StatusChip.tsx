import { cn } from "@/lib/cn";
import type { ListingStatus, StatusTone } from "@/lib/directory/status";

/**
 * The status chip. Three looks that differ by fill and line, not hue:
 * open is solid green, upcoming is cream2 with an ink border and a ring dot,
 * not posted is an empty dashed outline. "ended" is plain muted text.
 */
export function StatusChip({
  status,
  tone,
  label,
  className,
}: {
  status?: Pick<ListingStatus, "tone" | "label"> | null;
  tone?: StatusTone;
  label?: string;
  className?: string;
}) {
  const t = tone ?? status?.tone;
  const text = label ?? status?.label;
  if (!t || !text) return null;

  if (t === "ended") {
    return <span className={cn("font-display text-[12px] text-gl-muted", className)}>{text}</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border-2 px-2 py-1 font-display text-[12px] leading-none whitespace-nowrap",
        t === "open" && "border-gl-open bg-gl-open text-gl-cream",
        t === "upcoming" && "border-gl-ink bg-gl-cream2 text-gl-ink",
        t === "not_posted" && "border-dashed border-gl-dash text-gl-muted",
        className,
      )}
    >
      {t === "open" ? <span aria-hidden="true" className="size-2 rounded-full bg-gl-cream" /> : null}
      {t === "upcoming" ? (
        <span aria-hidden="true" className="box-border size-[9px] rounded-full border-2 border-gl-ink" />
      ) : null}
      {text}
    </span>
  );
}
