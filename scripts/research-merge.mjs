#!/usr/bin/env node
// Merges the research runs in data/research into three review files:
//   review-vendors-<date>.csv     new vendors from market, category and query runs
//   review-enrichment-<date>.csv  links found for vendors already listed (enrich runs)
//   review-events-<date>.csv      festivals, plant sales, stands, CSAs, flea markets (events runs)
// Each has an empty "approve" column. Fill it in, then import only approved rows.
//   npm run research:merge
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dir = path.join(root, 'data/research');
const date = new Date().toISOString().slice(0, 10);
const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯʻ'’`]/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\b(the|llc|co|company|hawaii|oahu)\b/g, '').trim();
const known = JSON.parse(fs.readFileSync(path.join(dir, 'known.json'), 'utf8'));
const knownVendors = new Map(known.vendors.map((v) => [norm(v.n), v]));
const knownMarkets = new Map(known.markets.map((m) => [norm(m.n), m]));
const rank = { high: 3, medium: 2, low: 1 };
const cell = (v) => { const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const write = (name, cols, rows) => {
  const out = path.join(dir, `${name}-${date}.csv`);
  fs.writeFileSync(out, [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n'));
  return path.relative(root, out);
};
const runs = fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}-.*\.json$/.test(f));
const kindOf = (f) => (/-enrich-\d|-verify-existing-/.test(f) ? 'enrich' : /-events-/.test(f) ? 'events' : 'vendors');

function mergeRows(files, extra) {
  const merged = new Map();
  // second-look runs (verify) go last and correct earlier answers instead of only filling gaps
  for (const f of [...files].sort((x, y) => /-verify-/.test(x) - /-verify-/.test(y))) {
    const verify = /-verify-/.test(f);
    for (const r of JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).rows || []) {
      const k = norm(r.name);
      if (!k) continue;
      const prev = merged.get(k);
      const run = f.replace(/\.json$/, '');
      if (!prev) { merged.set(k, { ...r, markets: [...(r.markets || [])], runs: [run] }); continue; }
      for (const m of r.markets || []) if (!prev.markets.some((x) => norm(x.name) === norm(m.name))) prev.markets.push(m);
      const empty = (v) => v == null || v === '' || (Array.isArray(v) && !v.length);
      for (const [key, val] of Object.entries(r)) if (empty(prev[key]) || (verify && !empty(val))) prev[key] = val;
      if (verify) prev.confidence = r.confidence;
      else if ((rank[r.confidence] || 0) > (rank[prev.confidence] || 0)) prev.confidence = r.confidence;
      if (!prev.runs.includes(run)) prev.runs.push(run);
    }
  }
  return [...merged.values()].map((r) => ({ ...r, ...extra(r), approve: '' }));
}

// Vendors
const vendors = mergeRows(runs.filter((f) => kindOf(f) === 'vendors'), (r) => {
  const hit = knownVendors.get(norm(r.name));
  return { possible_duplicate: hit ? `${hit.n}${hit.s ? ` (${hit.s})` : ''}` : '' };
}).sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.name.localeCompare(b.name));
const vFile = write('review-vendors', ['approve', 'name', 'category', 'side', 'neighborhood', 'description', 'products', 'tags', 'markets', 'fixed_or_roaming', 'address', 'website',
  'instagram', 'facebook', 'phone', 'schedule_source_url', 'order_url', 'payment_methods', 'made_where', 'source_url', 'source_date', 'source_label',
  'confidence', 'still_active', 'notes', 'possible_duplicate', 'runs'], vendors);

// Enrichment: only rows where something was found
const enrich = mergeRows(runs.filter((f) => kindOf(f) === 'enrich'), () => ({}))
  .filter((r) => r.website || r.instagram || r.facebook || r.schedule_source_url || r.order_url || r.still_active === false)
  .sort((a, b) => a.name.localeCompare(b.name));
const eFile = write('review-enrichment', ['approve', 'name', 'seed_id', 'website', 'instagram', 'facebook', 'social_source', 'schedule_source_url', 'order_url',
  'still_active', 'source_url', 'confidence', 'notes', 'runs'], enrich);

// Events and new listing types
const events = mergeRows(runs.filter((f) => kindOf(f) === 'events'), (r) => {
  const hit = knownMarkets.get(norm(r.name));
  return { possible_duplicate: hit ? `${hit.n} (${hit.s})` : '' };
}).sort((a, b) => (a.kind || '').localeCompare(b.kind || '') || a.name.localeCompare(b.name));
const evFile = write('review-events', ['approve', 'name', 'kind', 'side', 'neighborhood', 'venue_name', 'address', 'schedule_text', 'dates', 'organizer', 'website',
  'instagram', 'facebook', 'social_source', 'vendor_application_url', 'admission', 'description', 'source_url', 'source_date', 'source_label', 'confidence', 'still_active', 'notes',
  'possible_duplicate', 'runs'], events);

const by = (rows, k) => JSON.stringify(rows.reduce((a, r) => ((a[r[k] || 'unknown'] = (a[r[k] || 'unknown'] || 0) + 1), a), {}));
console.log(`Vendors: ${vendors.length} unique (${vendors.filter((r) => r.possible_duplicate).length} possible duplicates). Confidence ${by(vendors, 'confidence')}. ${vFile}`);
console.log(`Enrichment: ${enrich.length} listed vendors with something found. Website ${enrich.filter((r) => r.website).length}, Instagram ${enrich.filter((r) => r.instagram).length}, Facebook ${enrich.filter((r) => r.facebook).length}, possibly closed ${enrich.filter((r) => r.still_active === false).length}. ${eFile}`);
console.log(`Events: ${events.length} unique (${events.filter((r) => r.possible_duplicate).length} possible duplicates). Kind ${by(events, 'kind')}. Confidence ${by(events, 'confidence')}. ${evFile}`);
