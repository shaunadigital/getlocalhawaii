# Status

## What works
- New site live on getlocalhawaii.com since Oct 31: home with island map side filter and this-weekend list, /markets/[slug], /holiday-fairs, /[category]/[vendor], /search with suggestions, new 404. Reads Supabase project clckgomykxqrziefyfyn via src/lib/directory. Old /oahu/lei and guide pages unchanged.
- Home hero is HAPPENING ON OʻAHU / "See if it's open before you go." Titles say Happening on Oʻahu. Footer and meta descriptions carry no process lines (Nov 2).
- Data: 37 published vendors (lei, fish), 33 published markets (17 weekly, 16 dated fairs). No vendor is linked to a market yet.
- Design canvas renamed "Get Local Hawaiʻi: Directory" (https://claude.ai/artifact/WDtrJ1ZWb74eENEW5J2fcu).
- Research: about 545 cleaned rows waiting on the Research Review artifact (https://claude.ai/artifact/JZVe1CzsetDMSJ4BiMsjKp).

## In progress
- Second pass pages (Shauna building now): categories, sides, airport lei and send-a-lei in the new design, claim and list-your-market forms, menu open, About.
- Vercel Preview has no Supabase env vars yet, so preview builds stop at the env check.

## Next session agenda
1. Find vendor notes that describe sourcing ("their website is offline, so...") and propose rewrites for Shauna to approve.
2. Add the Supabase env vars to Vercel Preview.
3. Import approved rows from the Research Review page (vendors, links, events, market links).

## Known issues
- Some market names and areas are ASCII (Malama Hawaii, Kaimuki); the ʻokina cleanup is still open.
