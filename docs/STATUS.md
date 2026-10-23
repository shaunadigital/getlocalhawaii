# Status

## What works
- Live (main): coming-soon home plus the older inner pages. Listings still come from src/data/site-data.json. 61 tests pass; typecheck, lint clean (Oct 23).
- Direction (Oct 23): the product is the Oʻahu shop-local directory; lei stands are a vendor category. STRATEGY.md is the superseded Oct 8 plan.
- Coming-soon signups: Apps Script web app "Get Local Hawaii signups" (bound to the signups sheet) deployed Oct 23; SIGNUP_SHEET_URL and SIGNUP_SHEET_SECRET set in Vercel Production. Live after the next production deploy.
- Supabase project getlocalhawaii (ref oejcxjqbipsojbmjpjwb) created Oct 23. Applied: init_schema, seed_data (as part1 and part2).

## In progress
- Migrations: still to apply, in order: the seed cleanup (drop gl_seed_ts, gl_seed_next_dow), 20260819170000 lei vendors, 20260819180000 Lins, 20260826090000 fish, 20260827090000 farmers markets, 20261023000100 directory schema. The Supabase connector times out on any destructive statement (its approval prompt never appears), so these run in the dashboard SQL Editor.
- Until 20260819170000 runs, the database holds the fictional mockup vendors (555 numbers, fake called/visited checks). Nothing reads the database yet.
- Seed sheet review (Shauna). High confidence: 63 of 155 markets, 41 of 304 vendors.

## Next 3 steps
1. Finish the migrations; check no placeholder rows remain.
2. Import approved sheet rows as drafts; point src/lib/db.ts at Supabase and replace the Aug 19 NEXT_PUBLIC_SUPABASE_* vars in Vercel (they point at the deleted project).
3. Design the directory pages: map, this week, market page, vendor page.

## Known issues
- Import duplicates: People's Open Market sites are in both site-data.json (keep its City coordinates) and the sheet; sheet rows MKT-018 and MKT-040 are the same Honolulu Night Market.
- The vendors "owner update" policy lets an owner change publish_status; restrict the editable columns before the claim flow ships.
