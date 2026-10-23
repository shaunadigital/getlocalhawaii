# Status

## What works
- Live (main): coming-soon home plus the older inner pages (airport, delivery, six lei type, Chinatown, graduation, About, Disclosure, Privacy). Listings still come from src/data/site-data.json. 61 tests pass; typecheck, lint clean (Oct 23).
- Direction (Oct 23): the product is the Oʻahu shop-local directory; lei stands are a vendor category. STRATEGY.md is the superseded Oct 8 plan.
- Schema: supabase/migrations/20261023000100_directory_schema.sql adds organizers, market kinds, market_dates, vendor claims, status/confidence/publish_status. All migrations run clean in order on local Postgres 16. Not applied anywhere yet.
- Seed data: Google Sheet "Get Local Hawaii seed data (Oahu)", 155 markets, 304 vendors, 48 organizers, 14 other-island drafts, 23 closed. Every row sourced; all draft.

## In progress
- Shauna reviewing the sheet (review column). Bulk-approving high-confidence rows is enough for the first import.
- Database choice: Neon via Vercel Marketplace (recommended: 100 free projects, no pausing, Better Auth included) or Supabase (Shauna changed ownership in the outside orgs Oct 23, so a free slot may be open).

## Next 3 steps
1. Shauna picks Neon or Supabase. Create the database, apply all migrations, import approved sheet rows as drafts.
2. Point src/lib/db.ts at the database and design the directory pages: map, this week, market page, vendor page.
3. Vendor claim flow, then organizer outreach from the Organizers tab (outreach_status).

## Known issues
- Import duplicates: People's Open Market sites are in both site-data.json (keep its City coordinates) and the sheet; sheet rows MKT-018 and MKT-040 are the same Honolulu Night Market.
- The vendors "owner update" policy uses Supabase auth.uid(); on Neon it must be rewritten for its auth. It also lets an owner change publish_status; restrict the editable columns before the claim flow ships.
