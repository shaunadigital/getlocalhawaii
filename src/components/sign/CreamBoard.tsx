import { cn } from "@/lib/cn";

/**
 * The cream sign board: ink outline, a hard plum drop and two nail heads.
 * Pass `as` to render it as a section, article or li.
 */
export function CreamBoard({
  children,
  as: Tag = "div",
  nails = true,
  tilt = 0,
  className,
  ...rest
}: {
  children: React.ReactNode;
  as?: "div" | "section" | "article" | "li" | "aside";
  nails?: boolean;
  /** Degrees. Keep under 1 for boards that hold text. */
  tilt?: number;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">) {
  return (
    <Tag
      {...rest}
      className={cn("relative border-2 border-gl-ink bg-gl-cream text-gl-ink shadow-gl-board", className)}
      style={tilt ? { transform: `rotate(${tilt}deg)`, ...rest.style } : rest.style}
    >
      {nails ? (
        <>
          <span aria-hidden="true" className="absolute top-2 left-2 size-[7px] rounded-full bg-gl-nail md:size-2" />
          <span aria-hidden="true" className="absolute top-2 right-2 size-[7px] rounded-full bg-gl-nail md:size-2" />
        </>
      ) : null}
      {children}
    </Tag>
  );
}
