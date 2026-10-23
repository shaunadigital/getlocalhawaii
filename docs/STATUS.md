# Status

## What works
- Live (main): coming-soon home plus the older inner pages (airport, delivery, six lei type, Chinatown, graduation, About, Disclosure, Privacy). Listings still come from src/data/site-data.json.
- Direction changed Oct 23: the product is the Oʻahu shop-local directory (DECISIONS.md). STRATEGY.md is the superseded Oct 8 plan.
- Schema for the directory is written: supabase/migrations/20261023000100_directory_schema.sql (organizers, market kinds, market_dates, vendor claims, source and publish fields). All migrations run clean in order on a local Postgres 16.
- Seed research in the Google Sheet "Get Local Hawaii seed data (Oahu)": 155 markets (104 active, 51 uncertain), 304 vendors, 48 organizers, 14 other-island drafts, 23 closed.

## In progress
- Shauna reviewing the seed sheet (review column: approve, fix, remove, unsure).
- Supabase slot: Shauna moving ownership of an outside org so a free project frees up.

## Next 3 steps
1. Create the getlocalhawaii Supabase project, apply all migrations, import approved sheet rows as drafts.
2. Point the site at Supabase and design the directory pages: map, this week, market page, vendor page.
3. Vendor claim flow and the organizer outreach list (Organizers tab, outreach_status).

## Known issues
- People's Open Market rows exist twice for now: 13 in site-data.json (with City coordinates) and 13 in the sheet. Merge on import and keep the coordinates.
- Freshness dates on the old listings are from the Aug 19 checks.
