#!/usr/bin/env node
// Cleans the three review files from research:merge so they match what the site
// can show, and sorts every row into a review tier. Free: no API calls.
//   npm run research:clean   ->  data/research/clean/{vendors,enrichment,events}.json and .csv
//
// What it does
// - Links: trims tracking and trailing junk, keeps only profile links for Instagram
//   and Facebook, and checks that websites and source pages load.
// - Duplicates: matches on website domain and Instagram handle as well as name,
//   against listed vendors and within the new rows.
// - Side: from neighborhood or address with a fixed place table, else from the
//   markets a vendor sells at when they are all on one side. Never guessed.
// - Category (vendors) and kind (events): mapped to what the site uses. CSAs become
//   a "csa" channel on the farm's listing.
// - Dates: keeps only dates still to come (Hawaiʻi time).
// - Tier: auto (pre-approved, skim it), review (look at it), hold (low confidence),
//   closed (a source says it closed or the site is gone).
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dir = path.join(root, 'data/research');
const outDir = path.join(dir, 'clean');
fs.mkdirSync(outDir, { recursive: true });
const today = new Date(Date.now() - 10 * 3600e3).toISOString().slice(0, 10); // Hawaiʻi date

// ---------- helpers ----------
export const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯʻ‘’'`]/g, '')
  .replace(/[^a-z0-9]+/g, ' ').replace(/\b(the|llc|inc|co|company|dba|hawaii|oahu)\b/g, ' ').replace(/\s+/g, ' ').trim();
function parseCSV(text) {
  const rows = []; let row = []; let cell = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}
const json = (v) => { if (!v) return []; try { const x = JSON.parse(v); return Array.isArray(x) ? x : [x]; } catch { return [v]; } };
const cell = (v) => { const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const latest = (prefix) => {
  const f = fs.readdirSync(dir).filter((f) => f.startsWith(prefix) && f.endsWith('.csv')).sort().pop();
  if (!f) throw new Error(`No ${prefix}*.csv. Run npm run research:merge first.`);
  return parseCSV(fs.readFileSync(path.join(dir, f), 'utf8'));
};

// ---------- links ----------
const SOCIAL = /(^|\.)(instagram\.com|facebook\.com|fb\.com|linktr\.ee|linkin\.bio|tiktok\.com|yelp\.com|google\.com|goo\.gl|maps\.app\.goo\.gl)$/;
function cleanUrl(u) {
  if (!u || !/^https?:\/\//i.test(u.trim())) return '';
  try {
    const x = new URL(u.trim());
    x.hash = '';
    for (const k of [...x.searchParams.keys()]) if (/^(utm_|fbclid|igsh|igshid|si|ref|mibextid|hl)/i.test(k)) x.searchParams.delete(k);
    x.hostname = x.hostname.toLowerCase().replace(/^m\./, 'www.');
    return x.toString().replace(/\/$/, '');
  } catch { return ''; }
}
function igProfile(u) {
  const x = cleanUrl(u); if (!x) return '';
  const m = x.match(/instagram\.com\/([A-Za-z0-9_.]+)/);
  if (!m || /^(p|reel|reels|explore|accounts|stories|tv|share)$/i.test(m[1])) return '';
  return `https://www.instagram.com/${m[1].toLowerCase()}`;
}
function fbProfile(u) {
  const x = cleanUrl(u); if (!x) return '';
  if (/sharer|share\.php|\/plugins\/|\/dialog\/|\/tr\?|\/posts\/|\/photos\/|\/videos\/|\/events\/\d|\/story\.php/i.test(x)) return '';
  if (!/facebook\.com\/./.test(x)) return '';
  return x.replace(/^https?:\/\/(www\.|web\.)?facebook\.com/, 'https://www.facebook.com').replace(/\?(?!id=).*$/, '');
}
const handle = (ig) => (ig.match(/instagram\.com\/([^/?]+)/) || [])[1] || '';
const domain = (u) => { try { const h = new URL(u).hostname.replace(/^www\./, ''); return SOCIAL.test(h) ? '' : h; } catch { return ''; } };

const linkCache = new Map();
async function alive(u) {
  if (!u) return null;
  if (linkCache.has(u)) return linkCache.get(u);
  const p = (async () => {
    // A site that answers at all (even "blocked" or a server error) exists. Only a 404 or no answer
    // on both https and http counts as not loading, and that is a flag to check, never "closed".
    const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
    for (const v of [u, u.replace(/^https:/, 'http:')]) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const r = await fetch(v, { headers: { 'user-agent': UA, accept: 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
          if (r.status !== 404 && r.status !== 410) return true;
          break;
        } catch { /* retry */ }
      }
    }
    return false;
  })();
  linkCache.set(u, p);
  return p;
}
async function checkAll(urls) {
  const list = [...new Set(urls.filter((u) => u && !SOCIAL.test((() => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } })())))];
  for (let i = 0; i < list.length; i += 12) await Promise.all(list.slice(i, i + 12).map(alive));
}

// ---------- side ----------
const PLACES = {
  north_shore: ['haleiwa', 'waialua', 'mokuleia', 'sunset beach', 'pupukea', 'waimea', 'kahuku', 'turtle bay', 'kawela', 'north shore', 'laie', 'hauula'],
  windward: ['kailua', 'kaneohe', 'waimanalo', 'kahaluu', 'waiahole', 'waikane', 'heeia', 'lanikai', 'enchanted lake', 'windward', 'kaaawa', 'punaluu', 'kahana', 'kualoa', 'maunawili', 'bellows', 'temple valley', 'kaneohe bay'],
  central: ['wahiawa', 'mililani', 'waipio', 'kunia', 'schofield', 'whitmore', 'helemano', 'wheeler', 'launani'],
  leeward_ewa: ['aiea', 'pearl city', 'pearlridge', 'kalauao', 'waimalu', 'halawa', 'waipahu', 'waikele', 'ewa', 'kapolei', 'makakilo', 'ko olina', 'kalaeloa', 'nanakuli', 'waianae', 'makaha', 'maili', 'lualualei', 'wai kai', 'hoakalei', 'royal kunia', 'village park', 'leeward', 'aloha stadium', 'pearl harbor', 'hickam'],
  town: ['honolulu', 'kakaako', 'kalihi', 'waikiki', 'manoa', 'kaimuki', 'ala moana', 'chinatown', 'downtown', 'mccully', 'moiliili', 'makiki', 'kapahulu', 'nuuanu', 'palolo', 'salt lake', 'moanalua', 'kapalama', 'iwilei', 'liliha', 'kalakaua', 'kapiolani', 'diamond head', 'kcc', 'st louis', 'kahala', 'waialae', 'ward', 'kewalo', 'punchbowl', 'pauoa', 'mapunapuna', 'airport', 'hnl', 'sand island', 'university'],
  east: ['hawaii kai', 'koko marina', 'aina haina', 'niu valley', 'kuliouou', 'portlock', 'wailupe', 'koko head', 'kalama valley', 'hahaione', 'east honolulu'],
};
// Kāhala sits with Town in the side shapes; East starts at ʻĀina Haina.
const placeList = Object.entries(PLACES).flatMap(([side, names]) => names.map((n) => [n, side])).sort((a, b) => b[0].length - a[0].length);
function sideOf(text) {
  const t = ` ${norm(text)} `;
  for (const [n, side] of placeList) if (t.includes(` ${n} `)) return side;
  return '';
}
const SIDES = new Set(Object.keys(PLACES));

// ---------- known listings ----------
const known = JSON.parse(fs.readFileSync(path.join(dir, 'known.json'), 'utf8'));
const knownMarketSide = new Map();
for (const m of known.markets) knownMarketSide.set(norm(m.n), sideOf(m.n));
const siteData = JSON.parse(fs.readFileSync(path.join(root, 'src/data/site-data.json'), 'utf8'));
const existingDomain = new Map(); const existingHandle = new Map(); const existingName = new Map();
for (const v of known.vendors) existingName.set(norm(v.n), `${v.n}${v.s ? ` (${v.s})` : ''}`);
for (const v of siteData.vendors || []) { const d = domain(cleanUrl(v.website)); if (d) existingDomain.set(d, v.name); }

// ---------- categories ----------
// Proposed set. Slugs stay where they exist so links do not change.
export const CATEGORIES = {
  'food-trucks': 'Food trucks', 'prepared-food': 'Prepared food', 'food-producers': 'Snacks and pantry',
  farms: 'Farms', produce: 'Produce', fish: 'Fish', poi: 'Poi', lei: 'Lei', flowers: 'Flowers', plants: 'Plants',
  makers: 'Makers', 'clothing-jewelry': 'Clothing and jewelry', 'bath-body': 'Bath and body', pets: 'Pets',
};
const CAT_RULES = [
  ['pets', /\b(dog|dogs|pet|pets|cat treats|puppy|bark)\b/],
  ['plants', /\b(nursery|orchid|orchids|plant|plants|succulent|succulents|ornamental|ornamentals|bonsai|seedlings?)\b/],
  ['bath-body', /\b(henna|beauty|skin ?care|skin|soap|soaps|body|lotion|balm|spa|candle|candles|bath|cosmetic)\b/],
  ['clothing-jewelry', /\b(swim|swimwear|apparel|clothing|clothes|shirts?|tees?|dress|dresses|jewelry|earrings?|necklaces?|bracelets?|accessor\w*|boutique|vintage|hats?|bags?)\b/],
  ['prepared-food', /\b(shave ice|snow|crepes?|paella|kitchen|meals?|cakes?|bbq|barbecue|plate|plates|oysters?|grill|tacos?|burgers?|bowls?|musubi|malasadas?|desserts?|treats|ice cream|smoothies?|juice bar|fried|catering)\b/],
  ['food-producers', /\b(soda|kava|coffee|sauce|sauces|salt|honey|jam|jams|jelly|pickles?|kimchi|chips|cookies|mochi|chocolate|bread|sourdough|granola|snacks?|jerky|crackseed|taffy|salsa|tea)\b/],
  ['makers', /\b(art|artist|prints?|ceramics?|pottery|wood|woodwork|lamps?|studio|creations|crafts?|handmade|resin|stickers?|toys?|books?|cards|glass|textiles?)\b/],
];
function mapCategory(r) {
  const c = (r.category || '').trim();
  if (CATEGORIES[c] && c !== 'other') return { slug: c, how: '' };
  const text = norm(`${r.name} ${r.description} ${json(r.products).join(' ')} ${json(r.tags).join(' ')}`);
  for (const [slug, re] of CAT_RULES) if (re.test(text)) return { slug, how: `was "${c || 'blank'}", matched on words` };
  return { slug: '', how: `was "${c || 'blank'}", pick one` };
}

// ---------- tiers ----------
function tier(r, flags) {
  if (r.still_active === 'false') return 'closed';
  if (r.confidence === 'low') return 'hold';
  if (r.confidence === 'high' && !flags.length) return 'auto';
  return 'review';
}
const write = (name, cols, rows) => {
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(rows, null, 2));
  fs.writeFileSync(path.join(outDir, `${name}.csv`), [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n'));
};
const count = (rows, k) => JSON.stringify(rows.reduce((a, r) => ((a[r[k] || 'none'] = (a[r[k] || 'none'] || 0) + 1), a), {}));

// ---------- enrichment (links for vendors already listed) ----------
const enrich = latest('review-enrichment-').map((r) => ({
  ...r, website: cleanUrl(r.website), instagram: igProfile(r.instagram), facebook: fbProfile(r.facebook),
  schedule_source_url: cleanUrl(r.schedule_source_url), order_url: cleanUrl(r.order_url), source_url: cleanUrl(r.source_url),
}));
for (const r of enrich) { const d = domain(r.website); if (d && !existingDomain.has(d)) existingDomain.set(d, r.name); if (r.instagram) existingHandle.set(handle(r.instagram), r.name); }

// ---------- vendors ----------
const vendors = latest('review-vendors-').map((r) => {
  const markets = json(r.markets);
  const out = { ...r, website: cleanUrl(r.website), instagram: igProfile(r.instagram), facebook: fbProfile(r.facebook),
    schedule_source_url: cleanUrl(r.schedule_source_url), order_url: cleanUrl(r.order_url), source_url: cleanUrl(r.source_url) };
  const flags = [];
  let side = SIDES.has(r.side) ? r.side : '';
  let side_from = side ? 'source' : '';
  if (!side) { side = sideOf(`${r.neighborhood} ${r.address}`); if (side) side_from = 'place'; }
  if (!side && markets.length) {
    const s = [...new Set(markets.map((m) => knownMarketSide.get(norm(m.name || m)) || sideOf(m.name || m)).filter(Boolean))];
    if (s.length === 1) { side = s[0]; side_from = 'market'; }
  }
  if (!side) flags.push('needs side');
  const cat = mapCategory(r);
  if (!cat.slug) flags.push('needs category'); else if (cat.how) flags.push('category changed');
  if (!out.source_url) flags.push('no source link');
  if (!markets.length && !r.address && !out.website && !out.instagram) flags.push('no where or when');
  return { ...out, side, side_from, category_new: cat.slug, category_note: cat.how, flags };
});
// duplicates against listed vendors and within the new rows
const seen = new Map();
for (const r of vendors) {
  const d = domain(r.website); const h = handle(r.instagram); const n = norm(r.name);
  const ex = (d && existingDomain.get(d)) || (h && existingHandle.get(h)) || existingName.get(n);
  if (ex) r.flags.push(`same as listed: ${ex}`);
  for (const k of [d && `d:${d}`, h && `h:${h}`, `n:${n}`].filter(Boolean)) {
    if (seen.has(k) && seen.get(k) !== r) r.flags.push(`same as new row: ${seen.get(k).name}`);
    else seen.set(k, r);
  }
}
// names where one contains the other ("Bueno Salsa" / "Andy's Bueno Salsa")
const names = vendors.map((r) => [norm(r.name), r]).filter(([n]) => n.split(' ').length >= 2);
for (const [a, ra] of names) for (const [b, rb] of names) if (ra !== rb && a !== b && ` ${b} `.includes(` ${a} `)) rb.flags.push(`maybe same as: ${ra.name}`);

// ---------- events and new listing types ----------
const KINDS = new Set(['farmers_market', 'farm_stand', 'u_pick', 'makers_market', 'night_market', 'popup_series', 'holiday_fair', 'craft_fair_annual',
  'swap_meet', 'food_truck_park', 'food_truck_rally', 'brewery_truck_night', 'festival', 'plant_sale', 'flea_market']);
const events = latest('review-events-').map((r) => {
  const flags = [];
  const out = { ...r, website: cleanUrl(r.website), instagram: igProfile(r.instagram), facebook: fbProfile(r.facebook),
    vendor_application_url: cleanUrl(r.vendor_application_url), source_url: cleanUrl(r.source_url) };
  const text = norm(`${r.name} ${r.description} ${r.notes}`);
  let action = 'new listing';
  let kind = KINDS.has(r.kind) ? r.kind : '';
  if (/\b(csa|farm box|farm boxes|produce box|subscription|weekly box|community supported)\b/.test(text)) {
    action = 'csa channel on farm';
    const farm = r.organizer || r.name.replace(/\b(csa|farm box(es)?|produce box(es)?|subscription)\b/gi, '').trim();
    out.channel_for = existingName.get(norm(farm)) || [...known.markets].find((m) => norm(m.n).includes(norm(farm).split(' ').slice(0, 2).join(' ')))?.n || farm;
    kind = '';
  } else if (!kind) flags.push(`kind "${r.kind}" not used by the site`);
  const dates = json(r.dates).filter((d) => d && d.date);
  const upcoming = dates.filter((d) => d.date >= today);
  if (dates.length && !upcoming.length && !r.schedule_text) flags.push('all dates past');
  if (!dates.length && !r.schedule_text && action === 'new listing') flags.push('no dates or schedule');
  let side = SIDES.has(r.side) ? r.side : sideOf(`${r.neighborhood} ${r.address} ${r.venue_name}`);
  if (!side) flags.push('needs side');
  if (!out.source_url) flags.push('no source link');
  return { ...out, kind, action, side, dates: upcoming, flags };
});
const eseen = new Map();
for (const r of events) {
  const n = norm(r.name).replace(/\b(stand|farm stand|fruit stand|annual|\d+(st|nd|rd|th)?)\b/g, '').replace(/\s+/g, ' ').trim();
  const ex = [...known.markets].find((m) => norm(m.n) === n);
  if (ex) r.flags.push(`same as listed: ${ex.n} (${ex.s})`);
  const key = n.split(' ').slice(0, 3).join(' ');
  if (eseen.has(key)) r.flags.push(`maybe same as: ${eseen.get(key).name}`); else eseen.set(key, r);
}

// ---------- link checks ----------
await checkAll([...vendors, ...enrich, ...events].flatMap((r) => [r.website, r.source_url]));
for (const r of [...vendors, ...events]) {
  if (r.website && !(await alive(r.website))) r.flags.push('website not loading');
  if (r.source_url && !(await alive(r.source_url))) r.flags.push('source page not loading');
}
for (const r of enrich) {
  r.flags = [];
  if (r.website && !(await alive(r.website))) r.flags.push('website not loading');
  if (r.still_active === 'false') r.flags.push('may have closed');
}

// ---------- tiers and output ----------
for (const r of vendors) { r.tier = tier(r, r.flags.filter((f) => f !== 'category changed' || !/matched/.test(r.category_note))); }
for (const r of events) r.tier = tier(r, r.flags);
for (const r of enrich) {
  const found = r.website || r.instagram || r.facebook;
  r.tier = r.still_active === 'false' ? 'closed'
    : !found ? 'hold' : (r.social_source === 'from their website' || r.confidence === 'high') && !r.flags.length ? 'auto' : r.confidence === 'low' ? 'hold' : 'review';
}
for (const r of [...vendors, ...events, ...enrich]) { r.approve = r.tier === 'auto' ? 'yes' : ''; r.flags = [...new Set(r.flags)].join('; '); }
const order = { closed: 0, review: 1, hold: 2, auto: 3 };
const sort = (a, b) => order[a.tier] - order[b.tier] || a.name.localeCompare(b.name);

write('vendors', ['approve', 'tier', 'flags', 'name', 'category_new', 'category_note', 'side', 'side_from', 'neighborhood', 'description', 'products', 'tags', 'markets',
  'fixed_or_roaming', 'address', 'website', 'instagram', 'facebook', 'phone', 'schedule_source_url', 'order_url', 'payment_methods', 'made_where',
  'source_url', 'source_date', 'source_label', 'confidence', 'still_active', 'notes', 'runs'], vendors.sort(sort));
write('enrichment', ['approve', 'tier', 'flags', 'name', 'seed_id', 'website', 'instagram', 'facebook', 'social_source', 'schedule_source_url', 'order_url',
  'still_active', 'source_url', 'confidence', 'notes'], enrich.sort(sort));
write('events', ['approve', 'tier', 'flags', 'action', 'channel_for', 'name', 'kind', 'side', 'neighborhood', 'venue_name', 'address', 'schedule_text', 'dates',
  'organizer', 'website', 'instagram', 'facebook', 'vendor_application_url', 'admission', 'description', 'source_url', 'source_date', 'source_label',
  'confidence', 'still_active', 'notes'], events.sort(sort));

// rows worth a second look with the API (npm run research -- --verify vendors:0:10)
const pick = (r, keys) => Object.fromEntries(keys.filter((k) => r[k] && r[k] !== '[]').map((k) => [k, r[k]]));
const needV = vendors.filter((r) => r.tier === 'hold' || (r.tier === 'review' && /needs side|no where or when|no source link/.test(r.flags)));
const needE = events.filter((r) => r.tier === 'hold' || (r.tier === 'review' && /needs side|no dates|no source link|all dates past/.test(r.flags)));
fs.writeFileSync(path.join(dir, 'verify-vendors.json'), JSON.stringify(needV.map((r) => pick(r, ['name', 'category_new', 'neighborhood', 'description', 'products', 'markets', 'website', 'instagram', 'source_url', 'notes'])), null, 2));
fs.writeFileSync(path.join(dir, 'verify-events.json'), JSON.stringify(needE.map((r) => pick(r, ['name', 'kind', 'neighborhood', 'venue_name', 'schedule_text', 'organizer', 'website', 'source_url', 'notes'])), null, 2));

console.log(`Vendors ${vendors.length}: tiers ${count(vendors, 'tier')}, categories ${count(vendors, 'category_new')}`);
console.log(`Enrichment ${enrich.length}: tiers ${count(enrich, 'tier')}`);
console.log(`Events ${events.length}: tiers ${count(events, 'tier')}, actions ${count(events, 'action')}`);
console.log(`Second look queued: ${needV.length} vendors, ${needE.length} events`);
const flagCount = {};
for (const r of [...vendors, ...events, ...enrich]) for (const f of r.flags.split('; ').filter(Boolean)) { const k = f.replace(/:.*/, ''); flagCount[k] = (flagCount[k] || 0) + 1; }
console.log('Flags:', JSON.stringify(flagCount));
