# Status

## What works
- Live (main): coming-soon home with a working email signup (Apps Script to the signups sheet, tested Oct 23) plus the older inner pages. Listings on the site still come from src/data/site-data.json. 61 tests pass; typecheck, lint clean (Oct 23).
- Direction (Oct 23): the product is the Oʻahu shop-local directory; lei stands are a vendor category. STRATEGY.md is the superseded Oct 8 plan.
- Supabase project getlocalhawaii (ref oejcxjqbipsojbmjpjwb): every migration in supabase/migrations applied (the connector split some into parts; the files are the record). Security advisor clean.
- Database: 133 markets (17 published from August, 116 draft), 288 vendors (37 published lei and fish, 251 draft), 48 organizers, 32 weekly sessions, 171 vendor-market links. Import checksums match the migration file.
- Seed sheet: every row reviewed; rows with no 2025-2026 evidence moved to the Archived markets and Archived vendors tabs with a reason (README tab explains).

## In progress
- Nothing reads the database yet; the site still serves site-data.json.

## Next 3 steps
1. Point src/lib/db.ts at Supabase; replace the Aug 19 NEXT_PUBLIC_SUPABASE_* vars in Vercel (they point at the deleted project).
2. Design the directory pages: map, this week, market page, vendor page.
3. Vendor claim flow, then organizer outreach from the organizers table.

## Known issues
- research_notes (markets, vendors), notes (organizers) and organizer_name are internal but readable through the public API on any published or organizer row; revoke column access or move them before the site reads the database.
- Likely duplicates kept as drafts: VND-276 Maguro Brothers vs maguro-brothers-chinatown; VND-206 Kissy Hawaii vs VND-241 Kissy; VND-170 vs VND-290 Tango empanadas.
- The vendors "owner update" policy lets an owner change publish_status; restrict the editable columns before the claim flow ships.
- site-data.json still holds the mockup called/visited checks; do not carry them over.
