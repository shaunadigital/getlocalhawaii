"use client";

import { useEffect, useState } from "react";

/**
 * Suggestions while typing in a SearchBox, from /api/search?q=. Debounced,
 * cached per query for the page's lifetime, and stale answers are dropped.
 * Without JavaScript none of this runs and the box is a plain GET form to
 * /search.
 */

export interface SearchSuggestion {
  /** Stable key. */
  id: string;
  label: string;
  href: string;
  /** Small line under the label: "Fish · Kalihi", "Farmers market · NEXT: SAT OCT 31". */
  detail?: string;
  /** Heading the suggestion sits under: VENDORS, MARKETS or PLACES. */
  group?: "vendors" | "markets" | "places";
  /** [start, end) of the typed text inside label, for the highlight. */
  match?: [number, number];
}

export interface SearchSuggestionsState {
  suggestions: SearchSuggestion[];
  loading: boolean;
  /** The query the current suggestions answer. */
  query: string;
}

const DEBOUNCE_MS = 160;
const MIN_LENGTH = 2;
const cache = new Map<string, SearchSuggestion[]>();

function key(query: string): string {
  return query.trim().toLowerCase();
}

export function useSearchSuggestions(query: string): SearchSuggestionsState {
  const k = key(query);
  const [state, setState] = useState<SearchSuggestionsState>({ suggestions: [], loading: false, query: "" });

  useEffect(() => {
    if (k.length < MIN_LENGTH) return;
    if (cache.has(k)) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setState((s) => ({ ...s, loading: true }));
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(k)}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data: unknown = await res.json();
        const list = Array.isArray(data) ? (data as SearchSuggestion[]) : [];
        cache.set(k, list);
        setState({ suggestions: list, loading: false, query: k });
      } catch {
        if (!controller.signal.aborted) setState((s) => ({ ...s, loading: false }));
      }
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [k]);

  if (k.length < MIN_LENGTH) return { suggestions: [], loading: false, query: k };
  const cached = cache.get(k);
  if (cached) return { suggestions: cached, loading: false, query: k };
  // While the next answer loads, keep showing the last one.
  return state;
}
