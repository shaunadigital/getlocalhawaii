"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { IslandMap } from "@/components/sign/IslandMap";
import { type Side, sideParam } from "@/lib/directory/labels";

interface FilterState {
  side: Side | null;
  day: string;
  setSide: (side: Side | null) => void;
  setDay: (day: string) => void;
}

const FilterContext = createContext<FilterState | null>(null);

export function useHomeFilter(): FilterState {
  const state = useContext(FilterContext);
  if (!state) throw new Error("useHomeFilter needs HomeFilterProvider");
  return state;
}

/** Keeps ?side= and ?day= in the address bar so a filtered view can be shared. */
function syncUrl(side: Side | null, day: string, defaultDay: string) {
  const url = new URL(window.location.href);
  if (side) url.searchParams.set("side", sideParam(side));
  else url.searchParams.delete("side");
  if (day && day !== defaultDay) url.searchParams.set("day", day);
  else url.searchParams.delete("day");
  window.history.replaceState(window.history.state, "", url);
}

/**
 * Shared state for the home page's side filter and day picker. The server
 * renders the initial state from ?side= and ?day=, so both work without
 * JavaScript; with it, picks filter in place.
 */
export function HomeFilterProvider({
  initialSide,
  initialDay,
  defaultDay,
  children,
}: {
  initialSide: Side | null;
  initialDay: string;
  defaultDay: string;
  children: React.ReactNode;
}) {
  const [side, setSideState] = useState<Side | null>(initialSide);
  const [day, setDayState] = useState(initialDay);

  const setSide = useCallback(
    (next: Side | null) => {
      setSideState(next);
      syncUrl(next, day, defaultDay);
    },
    [day, defaultDay],
  );
  const setDay = useCallback(
    (next: string) => {
      setDayState(next);
      syncUrl(side, next, defaultDay);
    },
    [side, defaultDay],
  );

  return <FilterContext.Provider value={{ side, day, setSide, setDay }}>{children}</FilterContext.Provider>;
}

/** The island map wired to the home filter. */
export function HomeMap({
  size,
  framed,
  defaultDay,
}: {
  size?: "md" | "lg";
  framed?: boolean;
  defaultDay: string;
}) {
  const { side, day, setSide } = useHomeFilter();
  return (
    <IslandMap
      selected={side}
      onSelect={setSide}
      params={day !== defaultDay ? { day } : {}}
      size={size}
      framed={framed}
    />
  );
}
