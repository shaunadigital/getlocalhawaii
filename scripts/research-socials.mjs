#!/usr/bin/env node
// Reads every research and enrichment file in data/research, opens each
// vendor's or event's own website, and fills Instagram and Facebook links the
// site itself publishes. No API cost. Marks each filled link "from their website".
//   npm run research:socials
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dir = path.join(root, 'data/research');
const BAD = /(sharer|share\.php|\/plugins\/|\/tr\?|\/2008\/fbml|\/dialog\/|\/p\/|\/reel\/|\/explore\/|\/accounts\/|intent)/i;
const pick = (html, host) => {
  const re = new RegExp(`https?://(?:www\\.)?${host}/[-A-Za-z0-9_./]+`, 'g');
  const hits = [...new Set((html.match(re) || []).map((u) => u.replace(/\/+$/, '')))].filter((u) => !BAD.test(u));
  return hits.sort((a, b) => a.length - b.length)[0] || null;
};
async function harvest(url) {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(12000), redirect: 'follow' });
    if (!res.ok) return {};
    const html = await res.text();
    return { instagram: pick(html, 'instagram\\.com'), facebook: pick(html, 'facebook\\.com') };
  } catch { return {}; }
}
let checked = 0, ig = 0, fb = 0;
for (const f of fs.readdirSync(dir).filter((f) => /^\d{4}-\d\d-\d\d-.*\.json$/.test(f))) {
  const file = path.join(dir, f);
  const run = JSON.parse(fs.readFileSync(file, 'utf8'));
  let changed = false;
  const todo = (run.rows || []).filter((r) => r.website && /^https?:/.test(r.website) && !/instagram|facebook/.test(r.website) && (!r.instagram || !r.facebook));
  for (let i = 0; i < todo.length; i += 8) {
    await Promise.all(todo.slice(i, i + 8).map(async (r) => {
      checked++;
      const s = await harvest(r.website);
      if (!r.instagram && s.instagram) { r.instagram = s.instagram; r.social_source = 'from their website'; ig++; changed = true; }
      if (!r.facebook && s.facebook) { r.facebook = s.facebook; r.social_source = 'from their website'; fb++; changed = true; }
    }));
  }
  if (changed) fs.writeFileSync(file, JSON.stringify(run, null, 2));
}
console.log(`Checked ${checked} websites: added ${ig} Instagram and ${fb} Facebook links.`);
