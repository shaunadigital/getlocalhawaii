# Status

## What works
- Live (main): the lightweight site at https://getlocalhawaii.com. New Home, About, Disclosure, Privacy; airport, delivery, six lei type, Chinatown and graduation pages. Old shop pages 307 to their new page; fish and markets 404. Search Console set up.
- Data: no database. Listings are src/data/site-data.json (export of Oct 11), read by src/lib/db.ts; open now still computed per request. No env vars needed, so preview builds work.
- 61 tests pass, typecheck, lint and build clean.
- Designs: canvas https://claude.ai/artifact/WDtrJ1ZWb74eENEW5J2fcu, copies in docs/designs_100826/. Vendor tracker docs/vendor-tracker.xlsx.

## In progress
- PROJECT UNDER REVIEW (Oct 9): options A to D and the B plus D checklist are in STRATEGY.md, "Project review". The lightweight site is live either way (that was option A's first step).
- Hero still uses the glass panel; concept A (centered stand sign) chosen, not built.

## Next 3 steps
1. Pick A, B, C or D; if B plus D, answer its six "Decide" items first.
2. If go: build the stand sign hero; then the lūʻau guide.
3. Shauna: Buttondown account (then set NEXT_PUBLIC_BUTTONDOWN_USERNAME in Vercel), Cloudflare email alias.

## Known issues
- Canvas boards still use LINE Seed JP, so their macrons render on the wrong letter.
- Freshness dates are from the Aug 19 source checks; they will read as older over time until listings are rechecked.
