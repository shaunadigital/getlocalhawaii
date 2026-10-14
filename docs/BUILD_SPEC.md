# Get Local Hawaii - Build Spec


> Oct 2026: there is no Supabase project any more. The tables in section 6 now live as arrays in `src/data/site-data.json`, joined by `src/lib/db.ts`; the setup steps that mention Supabase are history.

Source of truth for the first build. Derived from the design mockups in `docs/Get Local Hawaii - Home.dc.html` (4 mobile screens at 390px). Goal of the first deploy: all four pages working against Supabase seed data, pushed to GitHub, auto-deployed to a Vercel temp domain.

## 1. Product concept

A trust-first local directory. The differentiator is freshness: every listing carries a verification log (called, visited, organizer confirmed) and the UI leads with computed status chips like "OPEN NOW, CLOSES 2P" and "VERIFIED TODAY 8:10A". Listings not verified in 30 days drop out of "open now" and display as unconfirmed. Users can report changes ("sold out today, reported 1h ago").

## 2. Stack and setup

1. Scaffold: `npx create-next-app@latest` with TypeScript, Tailwind, App Router, src dir.
2. Supabase: project already available via the user's Supabase account. Create schema via migration (section 6), seed with the placeholder data from the mockups (section 7).
3. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` and in Vercel project settings.
4. Deploy: push to https://github.com/shaunagits/getlocalhawaii.git, import repo in Vercel. Every push gets a `*.vercel.app` preview/production URL.
5. Timezone: all open/closed math in `Pacific/Honolulu`. No DST in Hawaii, but still use the IANA zone, not a fixed offset.

## 3. Design tokens

### Colors (from mockups)

| Token | Hex | Use |
|---|---|---|
| kai-900 | #061D21 | darkest teal, footer/deep surfaces |
| kai-800 | #0A2E33 | primary dark teal: header bg, headings, primary text |
| cream | #FBF6E9 | page background |
| sand | #E9E4D7 | subtle card/section background |
| coral | #C2402C | primary accent: links, CTAs, active states |
| coral-dark | #8E2A19 | link hover, pressed |
| coral-light | #FF8A6B | accent on dark backgrounds |
| coral-tint | #FADDD3 | coral chip backgrounds |
| green-700 | #0B5B3E | OPEN status text |
| green-500 | #157A4E | open dot, secondary green |
| mint | #7FD9BE | open accents on dark |
| mint-tint | #D8EFE4 | OPEN chip background |
| gold | #C98A1E | OPENS LATER / in-season accent (ʻilima gold) |
| gold-dark | #8A5B0C | gold text on light bg |
| gold-tint | #FCEBCB | gold chip background |
| slate | #5C716F | muted body text |
| slate-light | #7E8D8B | tertiary text, metadata |

Define these in the Tailwind theme, not ad hoc.

### Typography (Google Fonts, load via next/font)

- Bricolage Grotesque 400/600/800: display, page titles, vendor names.
- IBM Plex Sans 400/500/600/700: body, UI.
- IBM Plex Mono 500/600: all status chips, timestamps, verification labels ("VERIFIED TODAY 8:10A", "OPEN, CLOSES 2P"). Uppercase, small size (10-11px), letter-spaced.

### Status chip system (used everywhere, build as one component)

- OPEN: green dot ●, mint-tint bg, green-700 text. "● OPEN · CLOSES 2P"
- OPENS LATER: gold diamond ◆, gold-tint bg. "◆ OPENS 3P"
- ON NOW (markets): gold diamond with countdown. "◆ ON NOW · 1H 19M LEFT"
- SOLD OUT / reported: coral. "● SOLD OUT TODAY" + "REPORTED 1H AGO"
- Verification chip: mono, muted. "VERIFIED TODAY 8:10A" or "VERIFIED AUG 12"
- Unconfirmed: muted/gray, no dot.

## 4. Pages (first deploy scope: all four)

Every screen has TWO mockups in the design canvas: a 390px phone frame and a 940px desktop browser frame. Build both, responsive at roughly a 768px breakpoint. The mobile layouts are described per page below; the desktop layouts share these rules, taken from the 940px frames:

- Header: wordmark left, nav links (Browse all, Markets calendar, Add a listing) inline top-right in the dark header. The stacked footer nav is mobile-only.
- Home hero: centered, max-width 760px, Bricolage 52px, letter-spacing -1.4px, the query words in coral-light AND underlined with a 3px coral-light border-bottom. Suggestion chips centered beneath.
- Home results: cream rounded panel (18px radius, 24-28px padding) on the dark page background. Panel header row: "9 answers · 4 open now" left, "SORTED BY OPEN, THEN DISTANCE" mono right, hairline under. Cards in a 3-column grid, compact variant: "OPEN NOW" chip without the closes time, which folds into the description line ("1.2 mi · closes 2p").
- Vendor and market detail: two-column hero inside the dark header, 42px Bricolage title and description left (max 58ch), action button stack right (coral-light primary button with dark text, translucent cream secondary buttons). Body below is a two-column grid: main content left, side rail (roughly 320px) right. Market vendors render as a 2-up card grid; "not here today" cards at 70% opacity.
- Category results desktop follows the same two-column body pattern.

### 4.1 Home `/`

Question-led search. Dark teal header with "GET LOCAL HAWAIʻI" wordmark, then a large natural-language prompt line styled as the hero: "I need lei near Kalihi this afternoon." followed by suggestion chips (poi, fish off the boat, mango, Saturday market, maile). Below: results summary ("9 answers · 4 open now"), sort note ("SORTED BY OPEN, THEN DISTANCE"), then result cards. Each card: status chip row, verification chip, name, one-line description, distance/close time/payment note, action buttons (Call, Directions, Text to preorder). Footer nav: Browse all, Markets calendar, In season, Add a listing.

For v1 the search can filter seeded data by category keyword; no geolocation required yet (distances can come from seed data).

### 4.2 Category results `/[island]/[category]` (e.g. `/oahu/lei`)

Header: category title "Lei on Oʻahu", stats line "23 sellers · 9 open now · 14 verified this week". Filter chips (Open now, Maile, Pīkake, Airport-close). Sections grouped by status: "OPEN NOW · 9" then "LATER TODAY · 5", sorted open first then distance. Cards same as home. Below results: "HOW WE KEEP THIS CURRENT" explainer block (30-day rule) with "Add a listing" CTA, then "BY AREA" neighborhood counts (Kalihi & Kapālama 6, Downtown & Chinatown 5, Windward 4, ʻAiea & Pearl City 4, Leeward 3, North Shore 1).

### 4.3 Vendor detail `/lei/[slug]` (e.g. `/lei/napua-lei-stand`)

Answer first, then proof. Top: back link, Share, Save. Hero block: status chip + verification chip, name, category/area/distance, one-line story ("Auntie Nāpua and her daughter, same corner since 1998"), primary actions Call, Directions, Text. Then sections in order: THIS WEEK (hours table, today highlighted), WHAT THEY HAVE (product tags, including notes like "Maile - order 2 days ahead"), GOOD TO KNOW (freeform tips: parking, cash and Venmo, graduation weeks sell out by 9a), VERIFICATION LOG (dated entries: "Aug 18 · called, hours confirmed"), "Something changed? Tell us" link, ALSO NEARBY (2 cards with status).

### 4.4 Market detail `/farmers-markets/[slug]` (e.g. `/farmers-markets/kalakaua-peoples-open-market`)

The listing lives at `/oahu/farmers-markets` and is also the markets calendar; there is no separate calendar page. It groups by day, not by open or closed, because most markets run under an hour a week.

Hero: "◆ ON NOW · 1H 19M LEFT" countdown chip + verification chip, market name, schedule summary, description, actions (Directions, Instagram, Add to calendar). Sections: HERE TODAY with vendor count and per-vendor confirmation ("CONFIRMED 7:02A", stall numbers, "NOT HERE TODAY, usually Wed and Sat"), seasonal chips ("◆ MANGO IN SEASON · THRU SEP"), "See all vendors" link, POP-UPS THIS WEEK (dated one-off events, some UNCONFIRMED), NEXT DATES list, VERIFICATION LOG, GETTING THERE (parking/bus/tips).

## 5. Core business logic

- `getStatus(vendor, now)`: from hours + overrides, returns open | opens_later | closed | sold_out | unconfirmed, plus the display string (closes 2p, opens 3p).
- Freshness: latest verification event drives the chip. Same day: "VERIFIED TODAY 8:10A". Else "VERIFIED AUG 12". If newest event is older than 30 days: status becomes unconfirmed and the listing is excluded from "open now" counts and sections.
- Reports: a user report (sold out, closed early) creates an override for the day and shows "REPORTED 1H AGO".
- Sorting: open first, then distance.
- Market countdown: minutes remaining in today's session.

## 6. Data model (Supabase)

```
islands: id, name, slug
categories: id, name, slug (lei, poi, fish, produce, farmers-markets)
vendors: id, slug, name, category_id, island_id, area, description,
  story, lat, lng, phone, contact_method (call|text), payment_notes,
  good_to_know, is_active
vendor_hours: id, vendor_id, day_of_week, opens, closes
vendor_products: id, vendor_id, label, note (e.g. "order 2 days ahead"),
  in_season_until (nullable)
markets: id, slug, name, island_id, area, description, location_notes,
  operator, ebt_tokens, lat, lng, source_url,
  instagram, getting_there
market_sessions: id, market_id, day_of_week, starts, ends
market_vendors: market_id, vendor_id, stall, usual_days, confirmed_at
popups: id, name, vendor_id, market_id (nullable), starts_at, ends_at,
  location_note, status (verified|unconfirmed)
verification_events: id, subject_type (vendor|market), subject_id,
  verified_at, method (called|visited|organizer_confirmed|no_answer), note
reports: id, subject_type, subject_id, kind (sold_out|closed|changed),
  note, reported_at
```

RLS: public read on all tables; writes only via service role for now (reports can become an anon-insert table later).

## 7. Seed data

Seed exactly the placeholder records from the mockups so the deployed site matches the design review:

- Vendors (lei, Oʻahu): Nāpua Lei Stand (Kalihi, 1.2 mi, open 7a-2p Mon-Fri, Sat 6a-12p, Sun closed, cash + Venmo, pīkake/tuberose/crown/ti leaf/ribbon, maile 2 days ahead, verification log Aug 18 called, Aug 11 visited, Aug 2 no answer, Jul 26 visited); Leilani's Flower Shop (Kalihi, 2.8 mi, closes 6p, graduation orders); Waimānalo Maile & Ti (Waimānalo, 12 mi, maile by order 2 days notice, text contact, verified Aug 17); Aunty D's Lei Table (ʻAiea, 8.2 mi, opens 3p, outside swap meet gate, cash only, verified Aug 12); Kalihi Lei & Flowers (Kalihi, 3.4 mi, sold out today report, back tomorrow 7a, preorder by text).
- Market: Kaimukī Neighborhood Market (Mon/Wed/Sat mornings, Koko Head Ave behind community center, 14 vendors, small lot, Route 9 one block makai). Market vendors: Hoʻokipa Kalo Farm (poi/kalo/lūʻau leaf, stall 4, cash only), Kahuku Mango Bros (mango/lychee/papaya, stall 9, mango in season thru Sep), Nalo Greens (stall 12), Windward Fish Guy (not here today, usually Wed and Sat, ʻahi/aku).
- Pop-ups: Kalo & Poi pop-up (Tue 4-7p, verified), Kakaʻako fish drop (Sat 6a, Waiʻanae Fish Co-op, sells out by 8a, verified), Aunty D's lei table Sun (unconfirmed).

Seed verification timestamps relative to the current date so "VERIFIED TODAY" logic actually renders on the deployed site.

## 8. Build order

1. Scaffold Next.js, Tailwind theme with tokens, fonts.
2. Supabase schema migration + seed script.
3. Shared components: StatusChip, VerificationChip, VendorCard, ActionButtons, SectionHeader, SiteHeader/Footer.
4. Status/freshness logic in `lib/status.ts` with unit tests (open now, 30-day dropout, countdown).
5. Four pages wired to Supabase.
6. Push to GitHub, connect Vercel, verify the temp domain build.

## 9. Out of scope for first deploy

Search that actually parses natural language, geolocation and real distances, map view, add-a-listing and report flows (render the buttons, link to a mailto or stub), auth, in-season calendar page, island switcher.
