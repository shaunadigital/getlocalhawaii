# Status

## What works
- New site (built Oct 31, not yet deployed): home with island map side filter and this-weekend list, /markets/[slug], /holiday-fairs, /[category]/[vendor], /search with suggestions, new 404. Reads Supabase via src/lib/directory. Old /oahu/lei and guide pages unchanged.
- Data: 37 published vendors (lei, fish), 33 published markets (17 weekly, 16 dated fairs). No vendor is linked to a market yet.
- Research: about 545 cleaned rows waiting on the Research Review artifact (https://claude.ai/artifact/JZVe1CzsetDMSJ4BiMsjKp).

## In progress
- Deploy: needs the Supabase env vars in Vercel and a push of main.
- Second pass pages: categories, sides, airport lei and send-a-lei in the new design, claim and list-your-market forms.

## Next 3 steps
1. Run migration 20261031000300 (sides) in Supabase, confirm Vercel env vars, push.
2. Import approved rows from the Research Review page (vendors, links, events, market links).
3. Build the second pass pages.

## Known issues
- Some market names and areas are ASCII (Malama Hawaii, Kaimuki); the ʻokina cleanup is still open.
- Some vendor notes describe sourcing ("their website is offline, so..."); review against the no-process-narration rule.
