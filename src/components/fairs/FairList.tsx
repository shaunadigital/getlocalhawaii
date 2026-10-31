import Link from "next/link";

import { SignArrow } from "@/components/sign/ArrowSign";
import { BoardList } from "@/components/sign/ListingRows";
import { CreamBoard } from "@/components/sign/CreamBoard";
import { StatusChip } from "@/components/sign/StatusChip";

import type { FairMonth, FairRunRow } from "./fairs";

function FairRow({ row }: { row: FairRunRow }) {
  const { market } = row;
  const kicker = [row.dayLabel, market.sideName?.toUpperCase()].filter(Boolean).join(" · ");
  const place = market.neighborhood ?? market.area;
  return (
    <Link
      href={market.href}
      className="flex items-center gap-3 px-3.5 py-3 text-gl-ink no-underline hover:bg-gl-cream2/60 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-gl-purple md:gap-5 md:px-[22px] md:py-3.5"
    >
      <time
        dateTime={row.first}
        className="flex h-[58px] w-[54px] flex-none flex-col items-center justify-center bg-gl-ink text-gl-cream md:h-16 md:w-[62px]"
      >
        <span className="font-display text-[10px] text-gl-soft md:text-[11px]">{row.month}</span>
        <span className="font-display text-[22px] leading-none md:text-[26px]">{row.day}</span>
      </time>
      <span className="flex min-w-0 grow flex-col gap-0.5">
        <span className="font-display text-[11px] text-gl-purple md:text-[12px]">{kicker}</span>
        <span className="text-[16px] leading-[1.25] font-extrabold md:text-[18px]">{market.name}</span>
        <span className="text-[13px] text-gl-muted md:text-[15px]">
          {[row.timeLabel, place].filter(Boolean).join(" · ")}
        </span>
        {row.onToday ? (
          <span className="mt-1 flex">
            <StatusChip status={market.status} />
          </span>
        ) : null}
      </span>
      <SignArrow size={20} className="text-gl-purple md:size-6" />
    </Link>
  );
}

/** One month heading and its board of fair runs. */
export function FairMonthBoard({ month }: { month: FairMonth }) {
  const id = `month-${month.key}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <div className="mt-1.5 flex items-baseline justify-between gap-2.5">
        <h2 id={id} className="m-0 font-display text-[16px] font-normal text-gl-cream md:text-[20px]">
          {month.label}
        </h2>
        <span className="text-[14px] text-gl-soft">
          {month.rows.length} {month.rows.length === 1 ? "fair" : "fairs"}
        </span>
      </div>
      <CreamBoard className="pt-2">
        <BoardList>
          {month.rows.map((row) => (
            <li key={row.key}>
              <FairRow row={row} />
            </li>
          ))}
        </BoardList>
      </CreamBoard>
    </section>
  );
}
