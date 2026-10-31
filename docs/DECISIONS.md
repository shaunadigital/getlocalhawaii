# Decisions

Append-only. One line per entry: date, decision, one-phrase reason.

2026-08-19: Docs limited to CLAUDE.md, DECISIONS.md, STATUS.md, and a short README - commit messages carry the detail.
2026-08-19: Seed data ships as a numbered migration, not a separate seed script - one ordered history, rollback is just a down migration.
2026-08-19: Reports are the override; no separate overrides table - a same-day report is what makes a vendor read as sold out.
2026-08-19: subject_type on verification_events and reports includes 'popup' as well as vendor and market - keeps all freshness in one table.
2026-08-19: Status columns use text plus check constraints, not Postgres enums - new values need no type migration.
2026-08-19: vendors.distance_mi and markets.distance_mi are seeded placeholders - real distances wait for geolocation, but cards need to sort now.
2026-08-19: day_of_week is 0=Sunday..6=Saturday to match JavaScript getDay() - avoids an off-by-one at every read.
2026-08-19: An unverified listing reads as unconfirmed even when a same-day report exists - we will not claim sold out for a stand we have not checked in 30 days.
2026-08-19: Hours whose closing time is not after the opening time are read as running past midnight - lets late sessions stay open without a spans_midnight column.
2026-08-19: StatusChip derives colour and marker from the status kind, never from a caller prop - the same state cannot look different on two pages.
2026-08-19: Supabase project aqizthcpjohxsepbemjm in us-west-1, $10/mo - closest region to Hawaii, both migrations applied clean.
2026-08-19: Reversed the unconfirmed-vs-report call: a same-day report drives the status chip, verification chip shows unconfirmed - Shauna's pick, freshest data wins while staleness stays visible.
2026-08-19: Spec correction: the design canvas includes 940px desktop layouts for all four screens, not mobile-only - the centered-column desktop convention was a spec extraction error, desktop rules now in BUILD_SPEC section 4.
2026-08-19: Real data comes from public sources, no vendor calls in this phase - Shauna's call; calls become a later enrichment layer.
2026-08-19: Trust copy must reframe before real vendors ship: default state unconfirmed, chips show source-based freshness, drop "every listing gets a call or a visit" - cannot claim verification that did not happen.
2026-08-19: Never import Google Maps or Yelp content; vendors' own sites, official pages, and directories only - platform ToS prohibit republication.
2026-08-19: Slugs and meta titles use ASCII (pikake, puakenikeni), page copy keeps diacriticals - matches how people search without breaking the diacriticals convention.
2026-08-19: /oahu/lei and /lei/napua-lei-stand share one [one]/[two] route that dispatches on whether the first segment is an island or a category - Next allows only one dynamic segment name per level and both URL shapes are in the spec.
2026-08-19: Pages are force-dynamic - "open now" and the market countdown are wrong the moment they are cached.
2026-08-19: Env var stays NEXT_PUBLIC_SUPABASE_ANON_KEY holding the legacy anon key, per the spec and the Vercel step; the modern sb_publishable_ key is the upgrade path.
2026-08-19: Detail heroes live inside the dark header at both widths, with the action row rendered twice for the dark hero and the cream mobile shelf - both frames put the hero on teal, and one render cannot carry both palettes.
2026-08-19: Home answers use AnswerCard, category uses VendorCard - the home chip states only the status and folds the timing into the meta line, which is a different card, not a variant.
2026-08-19: getlocalhawaii.com keeps its DNS at Cloudflare with an A record to Vercel, rather than moving nameservers to vercel-dns - nameserver migration would take every other record on the domain with it.
2026-08-19: On a lapsed listing with a same-day report the chip row shows the report as the status and UNCONFIRMED as the verification, not the report age - both facts have to stay on screen, and the report age is the one already implied by "today".
2026-08-19: Freshness chip verb follows the method: source_check renders CHECKED, contact methods render VERIFIED - reading a posted page is not the same as reaching a person.
2026-08-19: A vendor with no posted hours gets status LISTED, not CLOSED - absent hours are unknown hours, and the empty week must never be read as shut.
2026-08-19: Result sorting breaks distance ties on name - real listings have no distance yet, so without it the order follows whatever Postgres returned.
2026-08-19: vendors gains address and website columns - LocalBusiness schema needs a postal address and a URL, and neither was in the original data model.
2026-08-19: Airport stands carry the state airports page's general 6a-10p hours, with the caveat printed in good_to_know - it is sourced and official, but it describes the row of stands, not each stand's own posting.
2026-08-19: Harriet's Yelp-listed hours were not imported, only the airports.hawaii.gov range - the no-Yelp rule covers hours as much as reviews.
2026-08-19: Capture pages share one /[island]/[category]/[slug] route resolving to a lei type, the delivery page, or an area - they are the same shape, prose plus a filtered list, and three routes would be three copies of it.
2026-08-19: Only Chinatown gets an area page; Airport and Kalihi resolve to 404 until someone writes prose for them - a page with a list and no writing is the thin content this whole exercise is meant to avoid.
2026-08-19: A type page with no matching vendors still ships, saying no source names that flower yet - the puakenikeni term is worth capturing and the honest empty state is better than omitting the page.
2026-08-19: Vendor pages emit schema.org Florist rather than bare LocalBusiness - it is a valid subtype and says what kind of shop it is; fields are omitted entirely when the data is missing.
2026-08-19: loadVendor and loadCategory are React cache() wrappers that own their own `now` - generateMetadata and the page body would otherwise query twice and read two different clocks.
2026-08-19: A vendor earns a sitemap entry and an indexable page by having source_url - the placeholder market vendors have none, so the rule is data-driven rather than a hardcoded slug list.
2026-08-19: A vendor with no posted hours shows a sentence saying so instead of the week table - the table renders every empty day as "closed", which is a claim we have no basis for.
2026-08-19: The related-listings block is titled "More lei shops", not "Also nearby", and prefers the same area - imported vendors have no distance, so proximity cannot be claimed.
2026-08-19: Airport now has an area page, written; the rule from the earlier entry stands, an area becomes a page only once it has prose, and Kalihi still 404s on one vendor and nothing written.
2026-08-19: Lin's website column cleared, source_url points at hiChinatown - linsleishop.com and linsleishophawaii.com both return HTTP 500, and linking customers to a dead site helps nobody.
2026-08-19: Content read from a web archive is imported with the event dated to the snapshot, not to today - the log then shows how old that claim really is, and the freshness chip still follows the newest source.
2026-08-19: Lin's founding year is not recorded; "since 1987" appears only on scraped aggregator sites and their own archived site says "over 20 years" undated - no permitted source states a year.
2026-08-19: An unmatched search returns nothing with a named reason, not the whole directory - the old fallback was invisible until there was a box to type in, at which point it reads as a search that ignores you.
2026-08-19: Home search answers only from listings with a source_url - the placeholder vendors are noindexed, and they should not be the answer to something a person typed either.
2026-08-19: The hero's third term is now open-now rather than the mockup's "this afternoon" - a live control in a sentence of live controls, and open-now is the only time filter the data supports.
2026-08-19: "near" is area equality, not proximity, and is kept anyway on Shauna's call - no vendor has coordinates, so near Kalihi returns Kalihi only.
2026-08-19: Nav drops the markets calendar and the produce listing - they pointed at a noindexed placeholder and at four unsourced vendors, which is a third of the chrome spent on suppressed content.
2026-08-26: Fish is the second real category, importing fish markets and poke-by-the-pound counters together under 'fish' - Shauna's call; a split into product labels can come later.
2026-08-26: Tamashiro Market is not listed; it closed permanently 2026-04-30 per Hawaii News Now - never list a business known to be closed.
2026-08-26: Conflicting or stale third-party hours import as no hours with a call-ahead note in good_to_know (Blue Seafood, Kahuku Superette, Ono Seafood, K.Bay Bros) - a wrong open-now is worse than a blank.
2026-08-26: Honolulu Fish Company imports with ships_mainland true and no hours - its posted range reads as operating hours and walk-in retail is unconfirmed.
2026-08-26: Multi-location vendors get one row per location (Fresh Catch, Maguro Brothers, Tamura's) - hours and open-now are per location.
2026-08-27: Cards lead with the status chip, detail pages lead with the name - the updated canvas put the name first everywhere, but descriptions wrap to one or two lines, so a chip after them loses the scannable status column down a grid.
2026-08-27: Markets move to /oahu/farmers-markets and /farmers-markets/[slug], retiring /markets/[slug] - the generic slug is worthless as a URL and markets now follow the same shape as lei and fish.
2026-08-27: The farmers markets category page is the markets calendar; there is no separate calendar page - Shauna's call, two surfaces listing the same seventeen markets is duplicate content.
2026-08-27: The markets listing groups by day, not by open or closed - thirteen of seventeen run under an hour a week, so an open-now grouping renders an empty page for most of the week.
2026-08-27: Only today's market cards get a live status chip; later days show the window - "opens 10a" is meaningless for a market three days out.
2026-08-27: Market pages carry Event schema with eventSchedule, not LocalBusiness - a People's Open Market stop is vendors in a park for an hour a week, not a business keeping opening hours.
2026-08-27: Query resolution matches categories before market phrases - "kalihi fish market" is a fish keyword target, and a market-first test sent it to the wrong page.
2026-08-27: People's Open Market coordinates come from the City's own Google Maps pins, linked off its schedule page - not a geocode of the park name, which lands in the wrong corner of a large park.
2026-08-27: Hawaii Farm Bureau markets import with null coordinates and null addresses - their page names the venue and the parking and publishes neither.
2026-08-27: The City's shared shopping rules and pricing sit once in the listing sidebar, not on each of the thirteen market pages - identical text thirteen times is what thin content means.
2026-09-12: The Lei Finder pilot is Oʻahu-only; no island selector, no other-island examples in the design - every listing we hold is Oʻahu, and a multi-island design promises coverage we cannot launch.
2026-09-12: The homepage hero asks only occasion, date, and Oʻahu town or ZIP; quantity, fulfillment, flowers, budget and note move to one request-details screen - the first design asked every question twice.
2026-09-12: Matching results appear before any personal information is requested, and contact plus consent is a modal opened by "Send my request" - people should see who they are sharing details with before sharing them.
2026-09-12: Pilot shops are labeled "Participating" with a "Listed" month, never "Verified" - Verified is reserved for a shop we actually reached, per the freshness-chip rule.
2026-09-12: The design carries no shop counts, prices, notice times, response-time promises, distances, or availability claims until participating shops supply them - same rule as the directory: never state what no source gave us.
2026-09-12: Consent text names the channels ("by text, call, or email") and drops "I can opt out at any time" - text consent is held to a stricter standard and the opt-out line read as marketing consent.
2026-09-12: Structural design changes are made in the Claude Design project and re-exported, not by hand-editing the .dc.html in docs/ - the export references support files that are not in the repo and hand edits fall out of sync with the design history.
2026-09-12: "Airport greeting, met at the gate" becomes "Arrival lei greeting" - "at the gate" implies access past airport security that greeters do not have.
2026-10-08: The site pivots to a visitor and mainland-gifting content site (airport lei, lūʻau, sending a lei); the local open-now directory stops being the product - locals already know their stand and Google Maps owns "near me".
2026-10-08: Revenue comes from activity affiliates (Viator, GetYourGuide, Polynesian Cultural Center) and shop referral codes; no paid search or display ads - ad clicks cost more than a referral earns.
2026-10-08: No self-fulfilled lei shipping for now - overnight freight from Hawaiʻi costs more than most orders earn; revisit only for bundles with negotiated freight under about $45 a box.
2026-10-08: The Honolulu airport lei stands page is built first - weakest competition and Search Console already shows those searches.
2026-10-08: The Lei Finder request flow and the For Lei Shops pilot are shelved - they serve the local audience the site is moving away from.
2026-10-08: Fish and farmers markets leave the navigation but their pages stay live - they still earn search clicks.
2026-10-08: Page copy keeps Hawaiian spellings; titles and URLs use plain spellings - that is how people search.
2026-10-08: Two fonts only, LINE Seed JP and Playwrite NG Modern - a third font added nothing the bold weights could not do.
2026-10-08: Hero text sits on a smoked glass panel over a full-bleed photo - a dark fade muddied the lei colors.
2026-10-08: The hero shows a live "N of M stands open now" instead of fact tiles - a single hours range misleads on a page about many stands with their own hours.
2026-10-08: No stock or AI-generated images at launch - the page's value is that someone local checked it.
2026-10-08: The August keyword exports were Hawaiʻi-only and measure local demand; US-wide volumes come from the Oct 8 Keyword Planner run in STRATEGY.md.
2026-10-08: The accent is orchid purple #8E4FB8 with white text on it - the orchid lei is the most recognized lei and no Hawaiʻi travel site uses purple; yellow and gold read as generic.
2026-10-08: The airport page uses the v2 layout (route line, arrivals-board stand list, icon rows) - boxes only for content that earns one, everything else as icons and wayfinding.
2026-10-08: Section headings are wayfinding signs carrying one real fact; arrow direction means down = this page, right = another page, up-right = leaves the site - visitors learn it once and can predict every click.
2026-10-08: Each page gets one way to jump, a directory on long pages or a single hero sign on short ones, never both - they did the same job twice.
2026-10-08: Home is a plain website with three photo doors, not an app or quiz - most traffic lands on inner pages and Google needs plain links.
2026-10-08: Flying-home lei rules move to a "taking a lei home" guide - the airport page is about arriving.
2026-10-08: Vendors are listed on verification (own visit or their own published info, dated), not on replying to outreach; removal rule is closed or no confirmation after two attempts or 30 days.
2026-10-08: Missing details are hidden rather than shown as placeholders, so the site looks complete while outreach is in progress.
2026-10-08: Instagram feeds only with each stand's permission and setup; otherwise own photos with a link to their account - Instagram requires the account owner to connect a feed.
2026-10-08: README expanded past the 10-line cap (about 25 lines, screenshot in .github/) at Shauna's request, because the public GitHub repo page is now part of her portfolio presence.
2026-10-09: Page names are plain and identical on the Home door, the page headline and the menu: Oʻahu lūʻau, Honolulu airport lei, Send a lei to the mainland - plain names read faster and match searches; freshness goes in a "Checked" date line, not the title.
2026-10-09: Home doors run lūʻau, airport, send a lei - airport visitors land on the airport page from search, while Home visitors are mostly planning, and lūʻau is the money page.
2026-10-09: Headlines are LINE Seed JP 800; Playwrite NG Modern is kept for the logo, the byline greeting and small human touches - script headlines were harder to read and made the signature font a template look.
2026-10-09: The logo reads "Get Local Hawaiʻi"; title tags, URLs and the schema site name stay "Get Local Hawaii" - search reads the title and site name, so the logo can follow the spelling rule.
2026-10-09: Accent is red-violet #8A3F9E, replacing #8E4FB8 - it reads as an orchid lei rather than an app, and white on it reaches 6.4:1.
2026-10-09: Smoked glass is charcoal at 70% and glass kicker text is #E6D6F5 - 55% and #D9C2F0 fail contrast over pale lei photos.
2026-10-09: One warm sand neutral #F5F0E8 replaces #F2F2EE and #E9E9E4; pages declare color-scheme light - the cool and yellow greys clashed, and phone dark modes inverted the photos and the logo sign.
2026-10-09: The site speaks as "I": Shauna, born and raised on Oʻahu (never implying Native Hawaiian ancestry); copy never claims more in-person checking than happened - one voice builds trust, and overclaiming risks Google and affiliate approval.
2026-10-09: An email signup ("Lei Day and graduation reminders") sits in every page footer except Send a lei, which has its own - an owned audience is the hedge against search and AI answers, so it starts now, not in February.
2026-10-09: The site stays anonymous: no name or photo in the byline or About page, only "someone born and raised on Oʻahu"; this replaces the named byline from earlier today - the author does not want to be identified, and the dated checks carry the trust instead.
2026-10-09: The June 2027 checkpoint is a loose trend check (rankings, click-outs, booked commissions), not a hard maintenance-mode cutoff - affiliate pay lags the tour date and pages take months to rank.
2026-10-09: The airport hero line reads "[N] stands open now", without "of [M]" - the total adds nothing a visitor acts on.
2026-10-09: The logo is an orchid sign with white lettering, white cords and a white edge, no charcoal - chosen from three options; it reads as the brand on photos and on its own.
2026-10-09: A lightweight home replaces the live home first, rather than a coming-soon page; inner pages stay live with expired labels hidden - a coming-soon page would drop the pages that already rank.
2026-10-09: "Open now" counts never show a total and are hidden at zero - the total adds nothing a visitor acts on, and a zero reads as broken.
2026-10-09: Buttondown is the email tool - simpler than Kit for a few emails a year.
2026-10-09: Outreach is signed "Get Local Hawaiʻi" from a Cloudflare email alias, with no personal name - the site stays anonymous.
2026-10-09: The Home headline is "Get the lei of the land" - it extends the "Get" of the sign above it and puts lei in the headline.
2026-10-09: Figtree replaces LINE Seed JP for all reading text - LINE Seed draws its macrons over the next letter, which breaks Hawaiian spelling, and it has no ō.
2026-10-09: While the new site is built, old lei shop pages and /oahu/lei redirect temporarily (307) to the page that now lists them; fish and farmers market pages return 404 - lei pages come back in the new design, fish and markets are not part of it.
2026-10-09: The airport and delivery pages are titled "Honolulu airport lei" and "Send a lei to the mainland", matching their Home doors; shop pages are restyled before the full airport and send-a-lei designs are built.
2026-10-09: Email signup forms render on previews but stay off production until the Buttondown username is set - a form that posts nowhere is worse than none.
2026-10-09: The Home hero is concept A, the stand sign: the headline on a white sign hung on its own, centered in the photo and clear of the logo - chosen over big type, an arrivals board and a curved headline; it echoes the airport stand row without crowding the logo.
2026-10-13: Listings ship as a JSON file in the repo instead of a Supabase database - the database was deleted, the data is a few hundred hand-edited read-only rows, and a file has no keys, cost or outage to manage.
2026-10-14: The project goes ahead as option B plus D: the lūʻau guide live by mid-December plus a case study; airport visit, shipping comparison, outreach rounds, Pinterest and the full airport page are parked until the guide shows a signal - one bounded bet of about 35 to 45 hours, judged on March 31.
2026-10-16: No byline anywhere: the "Aloha from Oʻahu / born and raised / how pages are checked" block and every "born and raised" line are gone from all pages and the meta description - Shauna asked for them removed site-wide.
2026-10-16: Stop rule adopted: at March 31, under about 100 lūʻau-guide visits a month or no top-20 ranking for any target search, the site goes static - a bounded bet needs a written exit.
2026-10-16: The lūʻau guide covers every lūʻau operating on Oʻahu, Waikīkī hotel lūʻau included, researched before launch - the page cannot claim "every lūʻau" on six.
2026-10-16: The lūʻau guide is first-hand; Shauna has attended them, and current prices and details come from operators or dated research - visits carry the trust, dates keep prices honest.
2026-10-16: Analytics are cookie-free (Vercel Web Analytics), replacing GA4 - matches the privacy page and needs no cookie notice.
2026-10-17: The stand sign hero has no "Find your lei" button - the photo doors directly below it already answer "what do you need".
2026-10-17: Home is a coming-soon page ("Find your lūʻau. Send some aloha.") while the full site is designed; inner pages stay live at their URLs - Shauna wants more time on the real designs, and keeping inner pages live protects what already ranks.
2026-10-17: The coming-soon button opens an email to the contact address until Buttondown is set up, then becomes the signup form - a form that posts nowhere is worse than none.
2026-10-17: On a light ground the logo's cords and top pins are charcoal; the sign itself is unchanged - white cords disappear on sand.
2026-10-17: "Lei guide" leaves the menu while Home is the coming-soon page - it pointed at a Home section that no longer exists.
2026-10-17: The coming-soon home asks for nothing until Buttondown is set up: the email-link button is gone and a "Coming soon" line takes its place - Shauna's call; the page should read clearly as coming soon, and the signup returns on its own once the username is set.
2026-10-17: The Home lei section is titled "Lei by type", not "Lei by flower" - maile is a leaf, and styles such as haku are a separate axis to add later.
2026-10-17: Coming-soon signups go to the "Get Local Hawaii signups" Google Sheet through /api/signup and an Apps Script web app, not Buttondown - Shauna wants a list, not a newsletter service, until there is something to send; export to an email tool later.
2026-10-17: The Apps Script URL and its shared secret live only in Vercel env vars (SIGNUP_SHEET_URL, SIGNUP_SHEET_SECRET); the email box renders only when both are set - the sheet cannot be written to from the page, and the page never shows a form that goes nowhere.
2026-10-23: The site is a shop-local directory again and replaces the lei and lūʻau content plan as the product - Google Maps does not say where a vendor will be on Saturday, and organizers and vendors have a reason to pay that affiliate links never had.
2026-10-23: Scope is every Oʻahu place vendors gather (farmers, makers and night markets, truck lots and rallies, farm stands, swap meets, annual fairs) and every vendor type, lei stands included - one vendor table, categories for the rest.
2026-10-23: Revenue order: organizer tools (vendor applications and booth payments), then vendor subscriptions, then a weekly email with local sponsors; ads last - the people who need to be found pay, not readers.
2026-10-23: Other islands are researched and stored as drafts, published once an island has enough listings to be useful - Oʻahu first.
2026-10-23: Supabase returns as the database once a free project slot opens; the data file stays until then - vendor claims and organizer updates need writes a file cannot take.
2026-10-23: Every listed row carries status (active, uncertain, closed), confidence and publish_status; only published rows are publicly readable - research lands as drafts and is reviewed before it shows.
2026-10-23: hawaiidogmap.com stays its own site and shares data with the directory (dog-friendly filter here, nearby markets there) - it has its own search presence and audience.
2026-10-23: Supabase is the database (project getlocalhawaii), not Neon - a free project slot opened and the migrations and owner policy are already written for it.
2026-10-23: Seed rows are kept only with a source dated 2025 or later or the organizer's or business's own current page; the rest move to the sheet's Archived tabs with a reason - so later research passes can see what was already ruled out instead of re-adding it.
2026-10-23: Imported markets get market_sessions only when weekly with stated days and times; every other schedule stays as schedule_text - a monthly or annual market stored as weekly sessions would show "open now" on the wrong days.
2026-10-23: The seed import SQL is generated from the sheet itself, never retyped, and checked against the database by checksum - 400-plus rows copied by hand would carry errors no one would catch.
2026-10-30: Design direction is roadside stand signs (arrow boards, price tags, hanging logo) in the canvas "Directory (current)" page; earlier boards move to "Old designs" - the earlier boards read as a generic generated site.
2026-10-30: Bungee joins Figtree and Playwrite NG Modern as the display face, reversing the Oct 8 two-font rule - it is built for signage and its character map has the ʻokina and every kahakō, which most brush faces lack.
2026-10-30: Palette is Direction A, dusty plum: ground #4A3354, cream boards #FBF7F0, ink #221A26, marigold #F2C14E on at most two items per screen, open status green #2E6248; replaces the Oct 9 accent and sand neutral - a color review found saturated orchid against lemon too loud.
2026-10-30: Status chips differ by fill and line, not hue: open is solid green, upcoming is light with a solid border and ring, hours not posted is an empty dashed outline - upcoming and not-posted looked identical.
2026-10-30: Generated illustration (the island map, the icon set) and generated stand-in photography are allowed, reversing the Oct 8 no-AI-images rule; generated photos are never captioned as a named real market, and vendor photos come only from owners or our own visits - the art carries the brand while real photos are gathered.
2026-10-30: The painted island map is the side filter on the home page; the six sides (north_shore, windward, central, leeward_ewa, town, east) are the official side values - locals think in sides, not ZIP codes.
2026-10-30: Vendor pages lead with location: one stack of place boards for every vendor (shop, market stands, other ways to buy), with whatever is open now on top - search data shows people arrive asking where and when.
2026-10-30: Search shows suggestions while typing; product searches list vendors first with their next appearance, place and kind searches list markets first - "honey" asks who, "Kailua" asks where.
2026-10-30: Applied the Oct 28 internal-column lock and added the vendor master fields (side, neighborhood, schedule_source_url, payment_methods, tags, hours_note, source_label, photo fields, owner_email, vendor_channels); retired columns stay until the site stops reading them - research had to collect the new fields, and research_notes were readable through the public API.
2026-10-30: New vendors come from a repo research script run by hand with Shauna's API key, writing a review CSV that is approved into the seed sheet before import; it never publishes - repeatable research without skipping review.
2026-10-30: The home hero is one headline every day, WHAT'S OPEN ON OʻAHU, with "See if it's open before you go. Each listing shows the day I last checked its source." and no "shop local" line - the logo already says Get Local, and visitors arrive asking whether something is open.
2026-10-30: docs/BRAND_VOICE.md is the voice and copy rulebook (honesty rules, chip wording, vocabulary, visual quick reference), from a copywriter review - the first copy pass read as generic AI writing.
2026-10-30: Airport stands keep showing the airports page's 6a to 10p row hours on each stand with the caveat printed, as decided Aug 19; the stricter "row hours once, hours not posted per stand" option is parked - Shauna's call for now.
2026-10-30: vendors gain aliases (other spellings, including Japanese) and brand (a slug shared by multi-location businesses) - Search Console shows "Maguro Bros", "Blue Sea Food" and Tamura's Maui stores.

## 2026-10-31: Research round 2 (social links, markets, new listing types)
- Social links: web search rarely surfaces Instagram, so enrichment finds websites with the API and `npm run research:socials` reads each website for the Instagram and Facebook links it publishes (free). Links found that way are marked "from their website".
- Enrichment runs use batches of 15 vendors (14 searches per run). Batches of 30 left most vendors unsearched.
- New listing types researched with `--events`: festivals, plant and orchid sales, roadside and farm stands, CSAs and farm boxes, flea markets and swap meets. CSAs are a way to buy from a farm, so they import as a `csa` channel on the farm's listing, not as a market.
- `npm run research:merge` now writes three review files: review-vendors, review-enrichment and review-events. Nothing imports until rows are approved.
- Spend for the round: about $36 of the promo credit.
- Cleaning: `npm run research:clean` turns the review files into data/research/clean/*.json with a tier per row (Ready, Needs a look, Low confidence, May be closed). A website that does not load is a flag to check, never a reason to mark a business closed; only a source saying it closed does that.
- Second look: `--verify vendors|events|existing:OFFSET:COUNT` re-checks rows queued by the cleaner. Its answers replace the first pass instead of only filling blanks.
- Approvals happen on the Research Review page (an artifact with a saved decisions store), not in CSVs. Ready rows count as approved unless skipped.
- Total research spend Oct 30 to 31: about $41 of the $58.25 promo credit.
