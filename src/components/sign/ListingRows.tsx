import Link from "next/link";

import { cn } from "@/lib/cn";

import { SignArrow } from "./ArrowSign";
import type { MarketRowData, RowChecked, VendorRowData } from "./rows";
import { StatusChip } from "./StatusChip";

function RowCheckedLine({ checked }: { checked: RowChecked | null | undefined }) {
  if (!checked) return null;
  return (
    <span className="mt-[3px] font-display text-[11px] leading-none tracking-[0.02em] text-gl-muted">
      <time dateTime={checked.iso}>{checked.label}</time>
    </span>
  );
}

function SnapTag() {
  return (
    <span className="border-2 border-gl-purple px-2 py-[3px] text-[12px] leading-none font-extrabold tracking-[0.06em] text-gl-purple">
      TAKES SNAP
    </span>
  );
}

/**
 * A market on a day list: time column, name, "place · kind", status chip and
 * an arrow. Chips sit under the name on phones and at the right from md up.
 */
export function MarketRow({ row, className }: { row: MarketRowData; className?: string }) {
  const chips =
    row.status || row.takesSnap ? (
      <>
        <StatusChip status={row.status} />
        {row.takesSnap ? <SnapTag /> : null}
      </>
    ) : null;

  return (
    <Link
      href={row.href}
      className={cn(
        "flex items-stretch gap-3 py-3.5 pr-3 pl-3.5 text-gl-ink no-underline hover:bg-gl-cream2/60 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-gl-purple md:items-center md:gap-5 md:py-4 md:pr-[22px] md:pl-[26px]",
        className,
      )}
    >
      <span className="flex w-[66px] shrink-0 flex-col md:w-[104px]">
        {row.dayLabel ? (
          <span className="font-display text-[12px] leading-tight text-gl-purple md:text-[13px]">{row.dayLabel}</span>
        ) : null}
        {row.startLabel ? (
          <>
            <span className="font-display text-[19px] leading-[1.05] md:text-[24px]">{row.startLabel}</span>
            {row.endLabel ? (
              <span className="text-[13px] font-semibold text-gl-muted md:text-[14px]">to {row.endLabel}</span>
            ) : null}
          </>
        ) : (
          <span className="text-[13px] font-semibold text-gl-muted md:text-[14px]">{row.timeNote ?? "Hours not posted"}</span>
        )}
      </span>
      <span className="flex min-w-0 grow flex-col gap-[3px] md:gap-0.5">
        <span className="text-[17px] leading-[1.25] font-extrabold md:text-[19px]">{row.name}</span>
        <span className="text-[14px] text-gl-muted md:text-[15px]">
          {[row.place, row.kindLabel].filter(Boolean).join(" · ")}
        </span>
        {row.note ? <span className="mt-0.5 text-[14px] font-bold md:text-[15px]">{row.note}</span> : null}
        {chips ? <span className="mt-[3px] flex flex-wrap gap-1.5 md:hidden">{chips}</span> : null}
        <RowCheckedLine checked={row.checked} />
      </span>
      {chips ? (
        <span className="hidden max-w-[220px] shrink-0 flex-wrap justify-end gap-1.5 md:flex">{chips}</span>
      ) : null}
      <SignArrow size={22} className="self-center text-gl-purple md:size-6" />
    </Link>
  );
}

/** A vendor on a list: name, "category · place", what they sell, status chip, arrow. */
export function VendorRow({ row, className }: { row: VendorRowData; className?: string }) {
  return (
    <Link
      href={row.href}
      className={cn(
        "flex items-center gap-3 py-3.5 pr-3 pl-3.5 text-gl-ink no-underline hover:bg-gl-cream2/60 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-gl-purple md:gap-5 md:py-4 md:pr-[22px] md:pl-[26px]",
        className,
      )}
    >
      <span className="flex min-w-0 grow flex-col gap-[3px]">
        <span className="text-[17px] leading-[1.25] font-extrabold md:text-[19px]">{row.name}</span>
        {row.detail ? <span className="text-[14px] text-gl-muted md:text-[15px]">{row.detail}</span> : null}
        {row.products ? <span className="text-[14px] text-gl-ink md:text-[15px]">{row.products}</span> : null}
        {row.status || row.where ? (
          <span className="mt-[3px] flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <StatusChip status={row.status} />
            {row.where ? <span className="text-[14px] font-bold">{row.where}</span> : null}
          </span>
        ) : null}
        <RowCheckedLine checked={row.checked} />
      </span>
      <SignArrow size={22} className="text-gl-purple md:size-6" />
    </Link>
  );
}

/**
 * A cream board holding a list of rows, with a title bar ("SATURDAY, OCT 31")
 * and an optional right-hand note ("8 PLACES"). Children are <li> rows.
 */
export function ListBoard({
  title,
  aside,
  children,
  className,
}: {
  title: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative border-2 border-gl-ink bg-gl-cream text-gl-ink shadow-gl-board", className)}>
      <span aria-hidden="true" className="absolute top-2 left-2 size-[7px] rounded-full bg-gl-nail md:top-[9px] md:left-[9px] md:size-2" />
      <span aria-hidden="true" className="absolute top-2 right-2 size-[7px] rounded-full bg-gl-nail md:top-[9px] md:right-[9px] md:size-2" />
      <div className="flex justify-between gap-2 border-b-2 border-gl-ink px-4 pt-[18px] pb-2.5 font-display text-[15px] md:px-[26px] md:pt-5 md:pb-3 md:text-[18px]">
        <span>{title}</span>
        {aside ? <span className="text-right text-gl-purple">{aside}</span> : null}
      </div>
      {children}
    </div>
  );
}

/** The <ul> inside a ListBoard: dashed rules between rows. */
export function BoardList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul className={cn("m-0 list-none divide-y-2 divide-dashed divide-gl-rule p-0", className)}>{children}</ul>
  );
}
