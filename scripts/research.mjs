#!/usr/bin/env node
// Vendor research: finds Oʻahu vendors from public sources with Claude and web
// search, and writes a review file. It never writes to the database; approved
// rows go into the seed sheet, then the import migration, as before.
//
//   npm run research -- --market "KCC Farmers Market"
//   npm run research -- --category "food trucks" --side windward
//   npm run research -- --query "lei stands in Kalihi"   (optional --max 30)
//
// Needs ANTHROPIC_API_KEY in .env.local. Output: data/research/<date>-<slug>.csv and .json
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}
const KEY = process.env.ANTHROPIC_API_KEY;
if (!KEY) { console.error('ANTHROPIC_API_KEY is missing from .env.local'); process.exit(1); }
const MODEL = process.env.RESEARCH_MODEL || 'claude-sonnet-5-5';
const PRICE_IN = Number(process.env.RESEARCH_PRICE_IN || 3);    // USD per million input tokens
const PRICE_OUT = Number(process.env.RESEARCH_PRICE_OUT || 15); // USD per million output tokens
const PRICE_SEARCH = 0.01;                                      // USD per web search

const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const max = Number(args.max || 25);
const MODE = args.enrich ? 'enrich' : args.events ? 'events' : 'vendors';
const target = args.market ? `vendors who sell at the ${args.market} on Oʻahu`
  : args.category ? `${args.category} on Oʻahu${args.side ? `, on the ${args.side} side` : ''}`
  : args.events ? args.events : args.enrich ? 'social links for listed vendors' : args.query;
if (!target) { console.error('Give --market, --category (and optional --side), --query, --events "what" or --enrich OFFSET:COUNT'); process.exit(1); }

const known = JSON.parse(fs.readFileSync(path.join(root, 'data/research/known.json'), 'utf8'));
const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯʻ'’`]/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\b(the|llc|co|company|hawaii|oahu)\b/g, '').trim();
const knownNames = new Map(known.vendors.map((v) => [norm(v.n), v]));

const EVENT_FIELDS = ['name', 'kind', 'side', 'neighborhood', 'venue_name', 'address', 'schedule_text', 'dates', 'organizer', 'website', 'instagram',
  'facebook', 'vendor_application_url', 'admission', 'description', 'source_url', 'source_date', 'source_label', 'confidence', 'notes'];
const ENRICH_FIELDS = ['name', 'seed_id', 'instagram', 'facebook', 'website', 'schedule_source_url', 'order_url', 'still_active', 'source_url', 'confidence', 'notes'];
const VENDOR_FIELDS = ['name', 'category', 'side', 'neighborhood', 'description', 'products', 'tags', 'markets', 'fixed_or_roaming', 'address',
  'website', 'instagram', 'facebook', 'phone', 'schedule_source_url', 'order_url', 'payment_methods', 'made_where', 'source_url',
  'source_date', 'source_label', 'confidence', 'notes'];

const FIELDS = MODE === 'events' ? EVENT_FIELDS : MODE === 'enrich' ? ENRICH_FIELDS : VENDOR_FIELDS;
const RULES = `Rules, all strict:
- Only use public sources: the business's or organizer's own website and social accounts, organizer vendor lists, and news or community articles. Never use Yelp, Google Maps, TripAdvisor or other review sites, and never copy reviews.
- Never guess. A field the source does not state is null. Do not invent hours, dates, addresses, prices or handles.
- Oʻahu only. Preserve Hawaiian spelling as the business writes it.
- side is one of: north_shore, windward, central, leeward_ewa, town, east (null if unclear).
- confidence: high (own page or organizer list, current), medium (recent third-party source), low (thin, indirect, or a handle you could not tie to this exact business).`;
const systemEvents = `You research recurring markets, festivals and sales on Oʻahu, Hawaiʻi where local vendors sell, for a directory that tells residents where and when.
${RULES}
- Keep only events with a 2026 or later date, or an organizer page showing it is current.
- kind is one of: festival, plant_sale, flea_market, swap_meet, farm_stand, u_pick, farmers_market, makers_market, night_market, popup_series, holiday_fair, craft_fair_annual, food_truck_park, food_truck_rally.
- dates: list of {"date": "YYYY-MM-DD", "start": "HH:MM" or null, "end": "HH:MM" or null} only for dates a source states; schedule_text in plain words for anything recurring.
Return your final answer as one JSON array in a \`\`\`json code block, with these keys: ${EVENT_FIELDS.join(', ')}.`;
const systemEnrich = `You find the official online presence of Oʻahu vendors already listed in a directory.
${RULES}
- For each vendor given, find its own Instagram, Facebook page and website, and where it posts its weekly schedule or market stops (schedule_source_url, often an Instagram or a page).
- Give full URLs. Only give a handle when the account clearly belongs to this exact business on Oʻahu (name, products or location match). If unsure, leave it null and say why in notes.
- still_active: true, false, or null if you cannot tell, with the reason in notes.
- Return every vendor you were given, even with all nulls.
Return your final answer as one JSON array in a \`\`\`json code block, with these keys: ${ENRICH_FIELDS.join(', ')}.`;
const system = MODE === 'events' ? systemEvents : MODE === 'enrich' ? systemEnrich : `You research local vendors on Oʻahu, Hawaiʻi for a directory that tells residents where and when to find them.
Rules, all strict:
- Only use public sources: the vendor's own website or social accounts, the market organizer's own pages and vendor lists, and news or community articles. Never use Yelp, Google Maps, TripAdvisor or other review sites, and never copy reviews.
- Keep a vendor only if a source dated 2025 or later, or the vendor's or organizer's own current page, shows them active. Skip anything closed or older.
- Never guess. A field the source does not state is null. Do not invent hours, addresses, prices or products.
- Oʻahu only. Skip other islands.
- Preserve Hawaiian spelling as the business writes it.
- category is one of: ${known.cats.join(', ')}.
- side is one of: north_shore, windward, central, leeward_ewa, town, east (null if unclear).
- payment_methods values: cash, card, venmo, snap, da_bux, other.
- markets: list of {"name", "usual_days"} for markets the source says they sell at; usual_days only if stated.
- source_label: plain words for the source, like "the market's vendor list" or "their Instagram".
- confidence: high (own page or organizer list, current), medium (recent third-party source), low (thin or indirect).
- description: 80 characters or fewer, plain, no marketing words.
Return your final answer as one JSON array in a \`\`\`json code block, with these keys for each vendor: ${FIELDS.join(', ')}.`;

const skip = known.vendors.map((v) => v.n).join('; ');
let user;
let batch = [];
if (MODE === 'enrich') {
  const [off, cnt] = String(args.enrich).split(':').map(Number);
  const pool = JSON.parse(fs.readFileSync(path.join(root, 'data/research/enrich-pool.json'), 'utf8'));
  batch = pool.slice(off, off + (cnt || 15));
  if (!batch.length) { console.error('No vendors in that range'); process.exit(1); }
  user = `Find the official online presence for these Oʻahu vendors:\n${batch.map((v) => `- ${v.n}${v.s ? ` [${v.s}]` : ''}${v.c ? `, ${v.c}` : ''}${v.a ? `, ${v.a}` : ''}${v.d ? `, sells: ${v.d}` : ''}${v.m ? `, seen at ${v.m}` : ''}`).join('\n')}`;
} else if (MODE === 'events') {
  user = `Find up to ${max} ${target} on Oʻahu.\nAlready in the directory (skip these): ${known.markets.map((m) => m.n).join('; ')}`;
} else {
  user = `Find up to ${max} ${target}.\nAlready in the directory (skip these, but you may add a note if one looks closed or renamed): ${skip}`;
}

async function call(messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 32000, system, messages,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: Number(process.env.RESEARCH_MAX_SEARCHES || (MODE === 'enrich' ? 14 : 8)) }] }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

const usage = { in: 0, out: 0, searches: 0 };
let messages = [{ role: 'user', content: user }];
let reply;
for (let turn = 0; turn < 6; turn++) {
  reply = await call(messages);
  usage.in += reply.usage?.input_tokens || 0;
  usage.out += reply.usage?.output_tokens || 0;
  usage.searches += reply.usage?.server_tool_use?.web_search_requests || 0;
  if (reply.stop_reason !== 'pause_turn') break;
  messages = [...messages, { role: 'assistant', content: reply.content }];
}
const text = reply.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
const m = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\[[\s\S]*\])/);
// Parse the JSON array; if the reply was cut off, keep every complete row.
function salvage(t) {
  const start = t.indexOf('[', t.indexOf('```json') + 1);
  if (start < 0) return [];
  let body = t.slice(start).replace(/```[\s\S]*$/, '');
  for (let cut = body.length; cut > 0; cut = body.lastIndexOf('}', cut - 1)) {
    try { return JSON.parse(body.slice(0, cut + 1).replace(/,\s*$/, '') + (body.slice(0, cut + 1).trim().endsWith(']') ? '' : ']')); } catch { /* keep trimming */ }
  }
  return [];
}
let rows = [];
try { rows = JSON.parse(m[1]); } catch { rows = salvage(text); if (rows.length) console.error(`Reply was cut off; kept ${rows.length} complete rows.`); else console.error('Could not parse the result. Raw reply saved.'); }

const knownMarkets = new Map(known.markets.map((m) => [norm(m.n), m]));
for (const r of rows) {
  if (MODE === 'enrich') continue;
  const hit = (MODE === 'events' ? knownMarkets : knownNames).get(norm(r.name));
  r.possible_duplicate = hit ? `${hit.n}${hit.s ? ` (${hit.s})` : ''}` : '';
}
const slugBase = MODE === 'enrich' ? `enrich-${String(args.enrich).replace(':', '-')}` : MODE === 'events' ? `events-${args.events}` : (args.market || args.category || args.query);
const slug = slugBase.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const stamp = new Date().toISOString().slice(0, 10);
const dir = path.join(root, 'data/research');
fs.mkdirSync(dir, { recursive: true });
const base = path.join(dir, `${stamp}-${slug}`);
fs.writeFileSync(`${base}.json`, JSON.stringify({ target, model: MODEL, usage, rows, raw: rows.length ? undefined : text }, null, 2));
const cols = MODE === 'enrich' ? FIELDS : [...FIELDS, 'possible_duplicate'];
const cell = (v) => { const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
fs.writeFileSync(`${base}.csv`, [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n'));

const cost = (usage.in * PRICE_IN + usage.out * PRICE_OUT) / 1e6 + usage.searches * PRICE_SEARCH;
const dupes = rows.filter((r) => r.possible_duplicate).length;
const low = rows.filter((r) => r.confidence === 'low').length;
console.log(`Target: ${target}`);
console.log(`Found ${rows.length} ${MODE === 'events' ? 'events' : MODE === 'enrich' ? 'vendors checked' : 'vendors'} (${dupes} possible duplicates, ${low} low confidence)`);
console.log(`Tokens in ${usage.in}, out ${usage.out}, searches ${usage.searches}. Estimated cost $${cost.toFixed(2)} (${MODEL})`);
console.log(`Review file: ${path.relative(root, base)}.csv`);
