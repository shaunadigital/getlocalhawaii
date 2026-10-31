"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { searchHref } from "@/lib/directory/labels";
import { cn } from "@/lib/cn";

import { SignArrow } from "./ArrowSign";
import { SignIcon } from "./SignIcon";
import { type SearchSuggestion, useSearchSuggestions } from "./useSearchSuggestions";

const GROUP_TITLES: Record<NonNullable<SearchSuggestion["group"]>, string> = {
  vendors: "VENDORS",
  markets: "MARKETS",
  places: "PLACES",
};

function GroupIcon({ group }: { group: NonNullable<SearchSuggestion["group"]> }) {
  if (group === "vendors") return <SignIcon name="tent" size={26} />;
  if (group === "markets") return <SignIcon name="basket" size={26} />;
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

/** The label with the typed part bolded, as the board shows it. */
function Highlighted({ label, match }: { label: string; match?: [number, number] }) {
  if (!match || match[0] >= match[1]) return <>{label}</>;
  const [start, end] = match;
  return (
    <>
      {label.slice(0, start)}
      <b className="bg-[#f5dfa6] font-black">{label.slice(start, end)}</b>
      {label.slice(end)}
    </>
  );
}

/**
 * The search box: a GET form to /search?q=, so it works without JavaScript.
 * With JavaScript, suggestions show under the box while typing, following
 * the ARIA combobox pattern: arrow keys move through them, Enter opens the
 * highlighted one (or searches), Escape closes the list.
 */
export function SearchBox({
  label = "Search a name or a food",
  placeholder = "Like poke, honey or Tamura’s",
  defaultValue = "",
  size = "md",
  labelClassName,
  className,
}: {
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  size?: "md" | "lg";
  labelClassName?: string;
  className?: string;
}) {
  const id = useId();
  const inputId = `${id}-q`;
  const listId = `${id}-suggestions`;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [hydrated, setHydrated] = useState(false);
  const { suggestions } = useSearchSuggestions(open ? query : "");

  // The clear button only does anything with JavaScript, so it waits for it.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHydrated(true), []);

  const trimmed = query.trim();
  const showList = open && trimmed.length >= 2 && suggestions.length > 0;
  const seeAllHref = searchHref(trimmed);
  // Options in order, the "see all" row last.
  const total = showList ? suggestions.length + 1 : 0;
  const optionId = (i: number) => `${id}-opt-${i}`;
  const activeIndex = showList && active < total ? active : -1;

  function go(index: number) {
    const href = index < suggestions.length ? suggestions[index].href : seeAllHref;
    setOpen(false);
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      if (total) setActive((i) => (i + 1 >= total ? 0 : i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (total) setActive((i) => (i <= 0 ? total - 1 : i - 1));
    } else if (event.key === "Enter") {
      if (activeIndex >= 0) {
        event.preventDefault();
        go(activeIndex);
      }
    } else if (event.key === "Escape") {
      if (showList) {
        event.preventDefault();
        setOpen(false);
        setActive(-1);
      } else if (query) {
        event.preventDefault();
        setQuery("");
      }
    }
  }

  // Group headings between runs of the same group.
  const rows: React.ReactNode[] = [];
  if (showList) {
    let i = 0;
    while (i < suggestions.length) {
      const group = suggestions[i].group ?? "vendors";
      const start = i;
      while (i < suggestions.length && (suggestions[i].group ?? "vendors") === group) i++;
      const headId = `${id}-group-${group}`;
      rows.push(
        <div key={group} role="group" aria-labelledby={headId}>
          <div
            id={headId}
            className="flex items-center gap-2.5 border-b-2 border-gl-ink px-4 pt-3.5 pb-2 font-display text-[14px] text-gl-ink"
          >
            <GroupIcon group={group} />
            {GROUP_TITLES[group]}
          </div>
          {suggestions.slice(start, i).map((s, j) => {
            const index = start + j;
            return (
              <Link
                key={s.id}
                id={optionId(index)}
                href={s.href}
                role="option"
                aria-selected={index === activeIndex}
                tabIndex={-1}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setActive(index)}
                className={cn(
                  "flex min-h-[58px] items-center gap-2.5 py-2 pr-3.5 pl-4 text-gl-ink no-underline",
                  j > 0 && "border-t-2 border-dashed border-gl-rule",
                  index === activeIndex && "bg-gl-cream2",
                )}
              >
                <span className="flex min-w-0 grow flex-col">
                  <span className="text-[17px] leading-[1.25] font-medium">
                    <Highlighted label={s.label} match={s.match} />
                  </span>
                  {s.detail ? <span className="text-[14px] text-gl-muted">{s.detail}</span> : null}
                </span>
                <SignArrow size={20} className="text-gl-purple" />
              </Link>
            );
          })}
        </div>,
      );
    }
  }

  return (
    <form
      role="search"
      action="/search"
      method="get"
      className={cn("flex flex-col gap-1.5", className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label htmlFor={inputId} className={cn("text-[15px] font-bold text-gl-cream", labelClassName)}>
        {label}
      </label>
      <div className="relative">
        <div className="flex border-2 border-gl-ink bg-gl-cream shadow-gl-board focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-gl-cream">
          <input
            ref={inputRef}
            id={inputId}
            name="q"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            enterKeyHint="search"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
            className={cn(
              "box-border min-w-0 grow border-0 bg-gl-cream px-3 text-[16px] text-gl-ink outline-none placeholder:text-gl-muted [&::-webkit-search-cancel-button]:appearance-none",
              size === "lg" ? "min-h-[54px] px-3.5 text-[17px]" : "min-h-[50px]",
              query && "font-bold",
            )}
          />
          {hydrated && query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setActive(-1);
                inputRef.current?.focus();
              }}
              className="w-11 shrink-0 cursor-pointer border-0 bg-gl-cream text-[22px] text-gl-muted hover:text-gl-ink"
            >
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
          <button
            type="submit"
            className={cn(
              "shrink-0 cursor-pointer border-0 border-l-2 border-gl-ink bg-gl-marigold font-display text-gl-ink",
              size === "lg" ? "px-5 text-[16px]" : "px-3.5 text-[15px]",
            )}
          >
            GO
          </button>
        </div>
        <div
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          hidden={!showList}
          className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-[70vh] overflow-y-auto border-2 border-gl-ink bg-gl-cream text-gl-ink shadow-gl-board"
        >
          {rows}
          {showList ? (
            <Link
              id={optionId(suggestions.length)}
              href={seeAllHref}
              role="option"
              aria-selected={activeIndex === suggestions.length}
              tabIndex={-1}
              onClick={() => setOpen(false)}
              onMouseEnter={() => setActive(suggestions.length)}
              className={cn(
                "flex min-h-[52px] items-center justify-center gap-2.5 border-t-2 border-gl-ink px-4 font-display text-[15px] text-gl-ink no-underline",
                activeIndex === suggestions.length ? "bg-gl-cream" : "bg-gl-cream2",
              )}
            >
              SEE ALL RESULTS FOR “{trimmed.toUpperCase()}”
              <SignArrow size={20} />
            </Link>
          ) : null}
        </div>
        <p aria-live="polite" className="sr-only">
          {showList ? `${suggestions.length} suggestions. Use the arrow keys to move through them.` : ""}
        </p>
      </div>
    </form>
  );
}
