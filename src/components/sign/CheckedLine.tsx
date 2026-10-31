import { cn } from "@/lib/cn";
import type { Checked } from "@/lib/directory/types";

/**
 * "CHECKED OCT 23, 2026" on a small cream tag with a check mark. The date is
 * the day a source was last read; the site never says verified. Renders
 * nothing when there is no check on record.
 */
export function CheckedLine({ checked, className }: { checked: Checked | null; className?: string }) {
  if (!checked) return null;
  return (
    <span
      className={cn(
        "inline-flex -rotate-1 items-center gap-2 self-start border-2 border-gl-ink bg-gl-cream px-2.5 py-1.5 font-display text-[12px] leading-none text-gl-ink",
        className,
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
      <time dateTime={checked.at.toISOString()}>{checked.label}</time>
    </span>
  );
}
