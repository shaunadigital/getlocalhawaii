"use client";

import Link from "next/link";

import { ArrowSign } from "@/components/sign/ArrowSign";
import { BoardList, ListBoard, MarketRow } from "@/components/sign/ListingRows";
import type { MarketRowData } from "@/components/sign/rows";
import { cn } from "@/lib/cn";
import { SIDE_NAMES, sideParam } from "@/lib/directory/labels";

import { useHomeFilter } from "./HomeFilter";

export interface HomeDay {
  date: string;
  label: string;
  longLabel: string;
  kicker: string;
  longKicker: string;
  title: string;
  name: string;
  rows: MarketRowData[];
}

const TILTS = [-1.2, 0.8, -0.5];

/**
 * Today and the rest of the weekend: arrow-board day picker over a cream
 * board of markets, filtered by the side picked on the map.
 */
export function WeekendBoard({ days, defaultDay }: { days: HomeDay[]; defaultDay: string }) {
  const { side, day, setDay, setSide } = useHomeFilter();
  const current = days.find((d) => d.date === day) ?? days[0];
  const rows = side ? current.rows.filter((row) => row.side === side) : current.rows;
  const sideName = side ? SIDE_NAMES[side] : null;

  const href = (date: string, withSide = side) => {
    const params = new URLSearchParams();
    if (date !== defaultDay) params.set("day", date);
    if (withSide) params.set("side", sideParam(withSide));
    const qs = params.toString();
    return `/${qs ? `?${qs}` : ""}#this-weekend`;
  };

  const count = `${sideName ? `${sideName.toUpperCase()} · ` : ""}${rows.length === 1 ? "1 PLACE" : `${rows.length} PLACES`}`;

  return (
    <div className="flex flex-col gap-3.5 md:gap-4">
      {days.length > 1 ? (
        <nav aria-label="Day" className="relative pt-1 pr-4 pb-1 pl-7 md:px-0 md:pt-2 md:pb-1.5">
          <span
            aria-hidden="true"
            className="absolute -top-3 -bottom-3 left-[34px] w-3.5 rounded-[3px] bg-gl-ink md:inset-x-0 md:top-1/2 md:bottom-auto md:-mt-[7px] md:h-3.5 md:w-auto"
          />
          <ul className="relative m-0 flex list-none flex-col items-start gap-2.5 p-0 md:flex-row md:flex-wrap md:gap-x-[22px] md:gap-y-3.5">
            {days.map((d, i) => {
              const selected = d.date === current.date;
              return (
                <li key={d.date}>
                  <Link
                    href={href(d.date)}
                    scroll={false}
                    aria-current={selected ? "true" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      setDay(d.date);
                    }}
                    className="flex no-underline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-gl-cream"
                  >
                    <ArrowSign
                      selected={selected}
                      tilt={TILTS[i % TILTS.length]}
                      label={d.label}
                      kicker={
                        <>
                          <span className="md:hidden">{d.kicker}</span>
                          <span className="hidden md:inline">{d.longKicker}</span>
                        </>
                      }
                      className={cn(!selected && "opacity-90")}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      <ListBoard title={current.title} aside={count} className="mx-4 mt-3.5 md:mx-0 md:mt-0">
        {rows.length > 0 ? (
          <BoardList>
            {rows.map((row) => (
              <li key={row.key}>
                <MarketRow row={row} />
              </li>
            ))}
          </BoardList>
        ) : (
          <div className="flex flex-col items-start gap-2.5 px-4 py-5 md:flex-row md:flex-wrap md:items-center md:gap-x-4 md:gap-y-3 md:px-[26px] md:py-6">
            <p className="m-0 text-[17px] font-bold md:text-[18px]">
              {side
                ? `Nothing listed on that side of the island for ${current.name} yet.`
                : `Nothing listed for ${current.name} yet.`}
            </p>
            {side ? (
              <Link
                href={href(current.date, null)}
                scroll={false}
                onClick={(event) => {
                  event.preventDefault();
                  setSide(null);
                }}
                className="flex min-h-11 items-center border-2 border-gl-ink bg-gl-cream2 px-3.5 font-display text-[13px] text-gl-ink no-underline"
              >
                ALL OF OʻAHU
              </Link>
            ) : null}
          </div>
        )}
      </ListBoard>
    </div>
  );
}
