# Status

## What works
- Live (main): Home is a coming-soon page (since Oct 17); About, Disclosure, Privacy; airport, delivery, six lei type, Chinatown and graduation pages. Old shop pages 307 to their new page; fish and markets 404. Search Console set up. No byline or "born and raised" lines since Oct 16.
- Data: no database. Listings are src/data/site-data.json (export of Oct 11), read by src/lib/db.ts; open now still computed per request. No env vars needed, so preview builds work.
- 61 tests pass, typecheck, lint and build clean.
- Designs: canvas https://claude.ai/artifact/WDtrJ1ZWb74eENEW5J2fcu, copies in docs/designs_100826/. Vendor tracker docs/vendor-tracker.xlsx.

## In progress
- Plan decided Oct 14: B plus D (STRATEGY.md, "Project review"). Stop rule, lūʻau scope, first-hand guide and cookie-free analytics decided Oct 16. Lūʻau guide live and affiliate applications in by mid-December; case study drafted now, finished in April.
- Hero still uses the glass panel; concept A (centered stand sign) chosen, not built.

## Next 3 steps
1. Research every operating Oʻahu lūʻau (Waikīkī hotels included) from operator sites; Shauna adds first-hand notes.
2. Build: stand sign hero, cookie-free analytics with click tracking, lūʻau guide at /oahu/luau, lūʻau door on Home.
3. Shauna: Buttondown account (then set NEXT_PUBLIC_BUTTONDOWN_USERNAME in Vercel), Cloudflare email alias.

## Known issues
- Canvas boards still use LINE Seed JP, so their macrons render on the wrong letter.
- Freshness dates are from the Aug 19 source checks; they read as older over time until listings are rechecked.
