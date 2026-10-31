/**
 * Where the public tables come from.
 *
 * - GL_SNAPSHOT set (local, tests, CI): read that JSON file. Same table names
 *   and row shapes as the REST API.
 * - Otherwise: Supabase PostgREST at NEXT_PUBLIC_SUPABASE_URL with the anon
 *   key. Vendors, markets and organizers have column-level grants, so their
 *   columns are listed; never select=* on those. RLS returns published rows
 *   and their children only.
 * - Neither configured: empty tables, so the build needs no env. Pages hide
 *   their empty sections.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { TABLE_NAMES, type Tables } from "./types";

const VENDOR_COLUMNS =
  "id,slug,name,category_id,island_id,area,description,story,lat,lng,phone,contact_method,payment_notes,good_to_know,is_active,address,website,ships_mainland,source_url,fixed_or_roaming,instagram,facebook,accepts_snap,claimed_at,status,confidence,publish_status,side,neighborhood,made_where,icon_override,hours_note,schedule_source_url,order_url,source_label,payment_methods,tags,photo_url,photo_credit,photo_taken_at,aliases,brand";

const MARKET_COLUMNS =
  "id,slug,name,island_id,area,description,location_notes,instagram,getting_there,is_active,lat,lng,operator,ebt_tokens,source_url,kind,organizer_id,venue_name,address,frequency,schedule_text,website,facebook,admission,parking_notes,vendor_count_est,vendor_application_url,booth_fee,accepts_snap,da_bux,dog_friendly,status,confidence,source_date,publish_status,side,neighborhood";

const ORGANIZER_COLUMNS = "id,slug,name,website,vendor_application_url,public_contact,booth_fee_info,source_url";

const SELECT: Record<keyof Tables, string> = {
  islands: "*",
  categories: "*",
  vendors: VENDOR_COLUMNS,
  markets: MARKET_COLUMNS,
  organizers: ORGANIZER_COLUMNS,
  vendor_hours: "*",
  vendor_products: "*",
  market_sessions: "*",
  market_vendors: "*",
  market_dates: "*",
  popups: "*",
  verification_events: "*",
  vendor_channels: "*",
};

/** Stable order so Range paging never skips or repeats a row. */
const ORDER: Partial<Record<keyof Tables, string>> = {
  market_vendors: "market_id,vendor_id",
};

const PAGE_SIZE = 1000;
/** Seconds the REST responses stay in the Next data cache. Status is still computed per request. */
export const REVALIDATE_SECONDS = 300;

function emptyTables(): Tables {
  return Object.fromEntries(TABLE_NAMES.map((name) => [name, []])) as unknown as Tables;
}

async function readSnapshot(file: string): Promise<Tables> {
  // Local and test only, so keep the file out of the deployment trace.
  const resolved = path.isAbsolute(file) ? file : path.join(/*turbopackIgnore: true*/ process.cwd(), file);
  const parsed = JSON.parse(await readFile(/*turbopackIgnore: true*/ resolved, "utf8")) as Partial<Tables>;
  const tables = emptyTables();
  for (const name of TABLE_NAMES) {
    const rows = parsed[name];
    if (Array.isArray(rows)) (tables as unknown as Record<string, unknown[]>)[name] = rows;
  }
  return tables;
}

async function fetchTable<K extends keyof Tables>(base: string, key: string, table: K): Promise<Tables[K]> {
  const rows: unknown[] = [];
  const order = ORDER[table] ?? "id";
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url = `${base}/rest/v1/${table}?select=${SELECT[table]}&order=${order}`;
    const response = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Range: `${offset}-${offset + PAGE_SIZE - 1}`,
        "Range-Unit": "items",
      },
      next: { revalidate: REVALIDATE_SECONDS, tags: ["directory"] },
    });
    if (!response.ok && response.status !== 206) {
      throw new Error(`directory: ${table} returned ${response.status}`);
    }
    const page = (await response.json()) as unknown[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows as Tables[K];
}

async function fetchRest(base: string, key: string): Promise<Tables> {
  const entries = await Promise.all(
    TABLE_NAMES.map(async (name) => [name, await fetchTable(base, key, name)] as const),
  );
  return Object.fromEntries(entries) as unknown as Tables;
}

let warned = false;

export async function loadTables(): Promise<Tables> {
  const snapshot = process.env.GL_SNAPSHOT;
  if (snapshot) return readSnapshot(snapshot);

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (base && key) return fetchRest(base, key);

  if (!warned) {
    warned = true;
    console.warn("directory: no GL_SNAPSHOT or Supabase env set, rendering with no listings");
  }
  return emptyTables();
}
