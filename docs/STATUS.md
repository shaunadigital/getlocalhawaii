# Status

## What works
- Live (main): still the old directory at https://getlocalhawaii.com, unchanged. Search Console set up.
- Branch lightweight-home (pushed, not merged, not deployed): new Home, About, Disclosure, Privacy; airport, delivery, lei type, Chinatown and graduation pages restyled; old shop pages 307 to their new page, fish and markets 404. 61 tests pass, typecheck, lint and build clean.
- Designs: canvas https://claude.ai/artifact/WDtrJ1ZWb74eENEW5J2fcu, copies in docs/designs_100826/ (incl. Hero Concepts, Lightweight Home). Vendor tracker docs/vendor-tracker.xlsx.

## In progress
- PROJECT UNDER REVIEW (Oct 9): worth the time? Options A to D, the money and time estimates, and the B plus D checklist are in STRATEGY.md, "Project review". Nothing ships until decided.
- Branch hero still uses the glass panel; concept A (centered stand sign) is chosen but not built. Open: add a "Find your lei" button on the sign, and whether email signup is the main action until the lūʻau guide exists.

## Next 3 steps
1. Discuss the project review (STRATEGY.md) and pick A, B, C or D; if B plus D, answer its six "Decide" items first.
2. If go: build the stand sign hero, add the Supabase keys to Vercel's Preview environment, review the preview, merge to main.
3. Shauna: Buttondown account, Cloudflare email alias; then GA4, airport site visit, round 1 outreach.

## Known issues
- Vercel preview builds fail: NEXT_PUBLIC_SUPABASE_URL and _ANON_KEY are set for Production only.
- Canvas boards still use LINE Seed JP, so their macrons render on the wrong letter; update to Figtree if the project continues.
- Live site: expired UNCONFIRMED labels, fish in lei results (fixed on the branch, not live).
