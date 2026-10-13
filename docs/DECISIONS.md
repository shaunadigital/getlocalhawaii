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
