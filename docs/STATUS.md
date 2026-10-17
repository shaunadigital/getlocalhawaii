# Status

## What works
- Live (main): Home is a coming-soon page since Oct 17 ("Find your lūʻau. Send some aloha.", sand editorial style, no signup until Buttondown exists). Inner pages stay live: airport, delivery, six lei type, Chinatown, graduation, About, Disclosure, Privacy. Old shop pages 307 to their area page; fish and markets 404.
- Data: no database. Listings are src/data/site-data.json, read by src/lib/db.ts; open now computed per request. No env vars needed.
- 61 tests pass; typecheck, lint and build clean. aloha@getlocalhawaii.com forwards to Shauna.
- Designs: canvas https://claude.ai/artifact/WDtrJ1ZWb74eENEW5J2fcu. New Oct 17 boards: editorial hero (dark and sand), editorial home on sand (full page), coming-soon home. docs/designs_100826/ predates these.

## In progress
- Plan B plus D: lūʻau guide live and affiliate applications in by mid-December; stop rule checked March 31.
- Full-site direction: the sand editorial style is the front runner, not yet decided (STRATEGY.md, Design).

## Next 3 steps
1. Shauna: Buttondown account (signed up with aloha@), then set NEXT_PUBLIC_BUTTONDOWN_USERNAME in Vercel; the coming-soon signup appears on its own.
2. Decide the full-site direction (dark or sand, sign headings or plain), then design the lūʻau guide in it.
3. Build the lūʻau guide at /oahu/luau from the Oct 17 lūʻau list in STRATEGY.md, plus cookie-free analytics with click tracking.

## Known issues
- The six lei type pages have no internal links while Home is the coming-soon page; they are reachable from search and the sitemap only.
- Freshness dates are from the Aug 19 source checks and read older over time until listings are rechecked.
