import { NextResponse } from "next/server";

import { getDirectory } from "@/lib/directory";
import { searchSuggestions } from "@/lib/directory/search";

export const dynamic = "force-dynamic";

/**
 * Suggestions for the search box while typing: a JSON array of at most eight
 * { id, label, href, detail, group, match }. Status words in `detail` ("Open
 * now") depend on the clock, so the cache window is a minute.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.slice(0, 100) ?? "";
  const suggestions = q.trim() ? searchSuggestions(await getDirectory(), q, new Date()) : [];
  return NextResponse.json(suggestions, {
    headers: {
      "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=60",
      "X-Robots-Tag": "noindex",
    },
  });
}
