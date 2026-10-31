# Status

## What works
- Live (main): coming-soon home with email signup plus the older inner pages. The site still reads src/data/site-data.json, not the database.
- Supabase: internal-column lock and vendor master fields applied Oct 30 (migrations 20261028000100, 20261030000100). Public API no longer reads research_notes or owner_email.
- Designs (canvas, "Directory (current)" page): roadside sign direction in dusty plum. Home with painted island map filter, vendor pages (Local Iʻa, Cindy's), search (suggest, results, no results), KCC market page, airport lei place page.
## In progress
- Remaining screens: category, side, holiday fairs, vendor desktop, sparse vendor, menu, claim, list your market, about, 404.
- Research script (scripts/, review CSV in data/research/); needs ANTHROPIC_API_KEY in .env.local.

## Next 3 steps
1. Split area into side and neighborhood for vendors and markets; add the new columns to the seed sheet.
2. Build and test-run the research script on one market.
3. Store holiday fair dates in market_dates and publish the weekend markets before Nov 5.

## Known issues
- Uncommitted: both migrations, the art (public/art, src/data/oahu-sides.json), these docs.
- Market names use straight apostrophes instead of ʻokina; category names still undecided.
- Likely duplicates kept as drafts: VND-276 vs maguro-brothers-chinatown; VND-206 vs VND-241; VND-170 vs VND-290.
- Map art is a recolor of the yellow original until the plum repaint comes back.
