# Get Local Hawaii: Strategy and Site Plan

Written 2026-10-08. The working plan after the October restart. Update in place as decisions change; one-line decisions also go in DECISIONS.md.

## Direction

A small, low-upkeep content site about lei and lūʻau on Oʻahu, written by someone who lives here and keeps it current. Not a local "open now" directory and not a marketplace.

Audiences, in order of value:
1. Visitors planning a trip (lūʻau, lei on arrival, lei classes, Lei Day).
2. Visitors and locals at the airport now (where to buy a lei, which stands are open).
3. Mainland buyers sending a lei (graduations, memorials, weddings).

Locals searching for a lei shop are the lowest-value audience: they already know their stand, and Google Maps answers "near me".

## How it makes money

- Lūʻau and activity affiliate links: Viator 8%, GetYourGuide about 8%, Polynesian Cultural Center 5% via Impact. A lūʻau for two earns roughly $24 to $36.
- Lei greeting affiliate links: $3 to $12 per booking. Small.
- Shop referral codes on the shipping comparison: negotiate about 10%, roughly $8 to $15 per order. No shop advertises a program; ask directly.
- Later, once traffic exists: clearly labeled paid placements for lei stands or lūʻau.
- Not now: display ads (pennies at current traffic), paid search ads ("ship lei to mainland" bids reach $7.87 a click), self-fulfilled shipping (see Research).

Phases:
- Phase 0, Oct to Dec 2026: design and build the first pages, set up tracking, apply to affiliate programs once the lūʻau guide is live. $0.
- Phase 1, Jan to Jun 2027: winter visitor season tests lūʻau and airport pages; Apr to May tests the shipping comparison and email reminder. Tens to low hundreds of dollars a month.
- Phase 2, mid 2027: double down on what earned. Target $100 to $500 a month.
- Checkpoint, end of June 2027, a loose check rather than a hard cutoff: is the lūʻau guide in the top 10 for 3 or more long-tail searches, are about 8% of its visitors clicking out to book, and are booked commissions (paid or pending) near $50? Commissions pay after the tour date and new pages take 3 to 9 months to rank, so judge the trend, not one month.

Approval for affiliate programs comes from useful content, not sales: build pages with plain links to operators first, apply, then swap in affiliate links. Route every outbound link through one central partner list so the swap is one change.

## Site map

```
/                          Home: plain site, three photo doors (luau, airport, send a lei)   new, designed
/oahu/airport-lei          Honolulu airport lei stands                                      new, designed
/oahu/luau                 Oʻahu lūʻau guide, 2026                                          new, designed
/send-a-lei                Shipping comparison + arrival checker + April reminder signup   new, designed
/guides/taking-a-lei-home  TSA, agriculture inspection, flowers that can't leave Hawaiʻi    new, not designed
/oahu/lei                  Lei hub                                                          exists
/oahu/lei/[type]           Pikake, maile, etc. Add "buy on Oʻahu" and "ship one"            exists
/lei/[slug]                Lei shop pages, feed the airport page                            exists
/guides/...                Graduation (exists), etiquette                                   partly
/about                     Who writes this and how pages are checked                        new
/disclosure, /privacy      Affiliate disclosure, privacy policy (GA4 cookies, email)        new
```

Navigation: Lūʻau guide, Airport lei, Send a lei, Lei guide.

Home is a plain website, not an app or quiz: most visitors land on inner pages from search, the doors ask "what do you need?" in one tap, and Google needs plain links and text.

Out of the navigation, pages stay live: fish (/oahu/fish) and farmers markets (/oahu/farmers-markets, /farmers-markets/[slug]). Blue Seafood brought 2 of the first 7 search clicks. Fix their expired UNCONFIRMED labels. Possible later return as visitor guides: "best poke near Waikīkī", "farmers markets worth a visit" (KCC Saturday).

Shelved: the Lei Finder request flow and the For Lei Shops pilot page (Sep 12 design).

Keep existing indexed URLs; redirect anything that moves. Store the new comparisons as content files, not database tables.

Spelling: Hawaiian spellings in page copy; plain spellings (Hawaii, Oahu, luau) in titles and URLs, plus once naturally in the intro.

## Pages, in build order

### 1. Honolulu airport lei stands (/oahu/airport-lei)
Answers: where are the stands, which are open, what does a lei cost, buy your own or book a greeting.
Sections: hero, where to find them (drawn map + 3 steps + cell phone lots), the stands (card per stand with its own hours and open now), what a lei costs (photo per lei type + price), buy or book a greeting (affiliate later), flying home with a lei (TSA, USDA rules), Since 1945 (history, Maile Lee quote, HPR 2023).
Needs a site visit: which stands operate in 2026 (8 names found: Maile's, Gladys', Sophia's, Pua Melia #12, Harriet's #1, Dorothy's, Martha's, Rachel's), each stand's hours, payment, phone, stall number, prices by lei type, walking route from baggage claim, photos.
Sourced facts already in the design: stands on the left of the entry road before Terminal 1, generally 6a to 10p (HDOT); parking first 15 min free, $1 to 30 min, $3 to 1 hr from Jul 1 2026 (HDOT); free cell phone lots on Aolele St near Lagoon Dr and Service Road A by the airport post office; greetings $30 to $50 per person, about 48 hours notice, meet at baggage claim (not past security); USDA: lei allowed after agriculture inspection, jade vine, Mauna Loa and citrus family prohibited.

### 2. Oʻahu lūʻau guide, 2026 (/oahu/luau)
Comparison table of every Oʻahu lūʻau: price, location and drive time, food, show, transport, who it suits, checked date. "What changed in 2026": Paradise Cove closed Dec 31 2025, Kaula Lūʻau opened Feb 27 2026, many ranking guides are stale. Attending a few makes it first-hand. Biggest money page; "luau oahu" is 10K to 100K US searches a month.

### 3. Send a lei to the mainland (/send-a-lei)
Independent comparison of 6 to 8 Hawaiʻi shops that ship: lei price, real shipping cost, order deadline, overnight vs 2-day by region, delay and refund policy, Hawaiʻi-grown vs imported. "Will it arrive in time" checker. April graduation reminder signup (one email around early April). Neutral ranking: shops that pay referral fees are not ranked higher, and the page says so.

### 4. Home, About, Disclosure, Privacy
### 5. Lei type page updates, then supporting guides

## Project review, Oct 9 2026 (decided Oct 14: B plus D)

Shauna questioned whether the site is worth the time. Decided Oct 14: B plus D. The "Decide" items were answered Oct 16 and 17. All money and hour figures are estimates.

### Money and time
- Earnings per action: lūʻau booking for two about $24 to $36; shop referral about $8 to $15 (if any shop agrees); lei greeting $3 to $12.
- $100 a month needs about 3 to 4 lūʻau bookings, roughly 500 to 4,000 lūʻau-page visits a month. Today: about 4 search clicks a month (Search Console, Aug 18 to Oct 6).
- "luau oahu" is held by booking sites and big blogs, and AI answers are taking clicks from guide sites. The real openings are narrow: the 2026 lūʻau changes (Paradise Cove closed, Kaula opened) and the airport stands.
- Realistic range: $0 to $50 a month by June 2027; maybe $100 to $300 a month in 2028 if it ranks.
- Full plan cost: about 80 to 120 hours through June 2027, then 2 to 4 hours a month, plus $300 to $1,000 if several lūʻau are attended at full price. Year one likely works out under $5 an hour.
- Not money: the design system, brand and code are already built; the public repo is part of Shauna's portfolio; the work is a real case study in AI-assisted product building.

### Options
- A. Stop (1 to 2 h): merge the finished lightweight branch so the public site is clean and needs no upkeep, then stop.
- B. One bet (about 30 to 40 h): ship the lightweight site, build only the lūʻau guide by mid-December for winter season, apply to affiliates, then watch. Stop if the guide misses the stop rule by March 31.
- C. Full plan (100+ h): everything above in this file.
- D. Portfolio piece (about 5 to 10 h): A plus a written case study; earnings are a bonus.
- Chosen: B plus D. Park the airport site visit, shipping comparison, outreach rounds, Pinterest and the full airport page until the lūʻau guide shows a signal.

### If B plus D: what is left
Decided Oct 16 (Shauna):
1. Stop rule: at March 31, under about 100 lūʻau-guide visits a month, or no top-20 Google ranking for any target search, means the site goes static and work stops.
3. Lūʻau list: research every lūʻau operating on Oʻahu now, Waikīkī hotel lūʻau included, before the page claims "every lūʻau". The design's six are a starting point.
   Researched Oct 17 from operator sites (prices not stored here; recheck at build). Open to the public (12): Kaula (Ko Olina, opened Feb 27 2026), Germaine's (Kapolei), Chief's (Wet 'n' Wild, Kapolei), Toa (Waimea Valley), Polynesian Cultural Center Aliʻi Lūʻau and Gateway (Lāʻie), Aloha Kai (Sea Life Park, renamed 2023), Ka Moana (moved to Aloha Tower, Honolulu), Pāʻina Waikīkī (Waikīkī Beach Marriott), Nā Lei Aloha (Hyatt Regency Waikīkī), Waikiki Starlight (Hilton Hawaiian Village), ʻAhaʻaina (Royal Hawaiian), Mauka Warriors (Coral Crater, Kapolei; BYOB for now). Resort or uncertain access: KA WAʻA (Aulani), Fia Fia (Marriott's Ko Olina Beach Club, Tuesdays). Restricted: Hale Koa (military only). Closed: Paradise Cove (Dec 31 2025). None found: Four Seasons Oʻahu, Turtle Bay, Sheraton, Outrigger, Moana Surfrider.
4. First-hand: Shauna has attended the lūʻau. The guide is written first-hand; gaps and current prices come from the operators or dated research.
5. Analytics: cookie-free (Vercel Web Analytics), matching the privacy page. Replaces GA4.

6. Hero: the stand sign ships with no "Find your lei" button; the photo doors below it do that job. Figtree and the footer email signup were decided Oct 9.

The case study (item 2) is Shauna's to manage and is not tracked here.

Design (mostly done):
- Lūʻau guide boards exist; update to the plain title "Oʻahu lūʻau" and Figtree; drop the island map for v1 and use drive times from Waikīkī.
- A line near the top of the lūʻau page saying some links earn a commission (the disclosure page promises it).
- Favicon done Oct 17: orchid square, white Playwrite "G" (src/app/favicon.ico, icon.png, apple-icon.png). Share image still to do.
- Skip updating canvas boards to Figtree; real site screenshots serve the case study better.

Build (Claude, about 15 to 20 h):
- Stand sign hero, plus button if wanted (2 to 3 h).
- Done Oct 13: lightweight site merged to main and live; Supabase replaced by a bundled data file.
- Connect Buttondown (30 min once the account exists).
- Cookie-free analytics and outbound click tracking (1 to 2 h).
- Lūʻau guide at /oahu/luau as a content file: cards, filter chips, dated checks, JSON-LD, sitemap (8 to 12 h), with one central partner link list so affiliate links are a one-file swap.
- Replace Home's "Coming next" box with a lūʻau door (30 min).

Research and write (about 10 to 15 h): per lūʻau, from the operator's own site, price tiers, location and drive time, food, show, transport, who it suits, each with a checked date; the 2026 changes section; how to choose. Claude drafts from public sources, Shauna fact-checks and adds first-hand notes.

Admin (Shauna): Buttondown account; Cloudflare email alias; after the guide is live, Viator, GetYourGuide and Polynesian Cultural Center (Impact) applications with W-9 and bank details; $20 Hawaiʻi GET license before any commission (confirm with a tax preparer); permission for any operator press photos.

Case study (about 5 to 8 h): draft now (pivot from local directory to visitor site, brand and design system, the font bug, AI-assisted workflow); finish in April with real results, whatever they are.

Timeline: lightweight site live (done Oct 13); lūʻau guide live and affiliate applications in by mid-December; January to March watch only, about 30 minutes a month in Search Console; March 31 go or stop; April case study finished. Total about 35 to 45 hours, most before mid-December.

## Getting traffic

1. Google search (main source, 3 to 9 months to rank). Quickest wins: airport stands (no good page exists; Search Console already shows "airport lei stand" searches), 2026 lūʻau update.
2. Pinterest (lūʻau, graduation lei, lei types; works within weeks).
3. Reddit and forums (r/VisitingHawaii, r/Oahu, Tripadvisor Oʻahu, Cruise Critic). Link the page, never an affiliate link.
4. Local press: data stories ("what 8 lei shops really charge to ship", "where to get a lei at the airport now"), Lei Day May 1 each year. Featured shops may link to the comparison.
5. Email: April graduation reminder.
6. Short video (Reels, TikTok, Shorts) as time allows.

Seasons: Oct to Dec build; Dec to Mar visitor high season; Mar to May graduation; June checkpoint.

## Setup checklist

- [ ] Cookie-free analytics (Vercel Web Analytics) with outbound click tracking; no cookie notice needed
- [x] aloha@getlocalhawaii.com forwards to hello@shauna.digital (confirmed Oct 17)
- [ ] Privacy policy and affiliate disclosure pages
- [ ] Pinterest business account, claim the domain (DNS on Cloudflare)
- [ ] After the lūʻau guide is live: Viator, GetYourGuide, Polynesian Cultural Center (Impact); W-9 and bank details for each
- [ ] Ask Cindy's, Hawaii Lei Stand, Buy Hawaiian Lei for referral codes once the shipping page draft exists
- [ ] Buttondown account (chosen over Kit for simplicity), with DNS records; the footer signup is in every design
- [ ] Cloudflare email alias for outreach, which is signed "Get Local Hawaiʻi" with no personal name
- [ ] Hawaiʻi GET license ($20) for commission income; confirm with a tax preparer
- [ ] Delete the keyword plan "Plan from Oct 8, 2026, 5 PM" in Google Ads (Shauna, optional)
- [ ] Fix or hide the expired UNCONFIRMED labels on the live directory before applying to affiliate programs

## Design (in progress)

Canvas: https://claude.ai/artifact/WDtrJ1ZWb74eENEW5J2fcu (copies in docs/designs_100826/). Mobile and desktop boards for airport, home, lūʻau, send a lei.
- Fonts: Figtree for body and all headings, headlines at 800; Playwrite NG Modern only for the logo and small human touches. Two fonts only. LINE Seed JP was dropped on Oct 9: its macrons land on the following letter (Pīkake renders as "Pik̄ake"), and it has no ō.
- Colors: one accent, red-violet orchid #8A3F9E (white on it 6.4:1). Charcoal #15181B and white as neutrals, warm sand #F5F0E8 as the one light fill. Light orchid #E6D6F5 for accent text on glass, #D9C2F0 only on solid charcoal. Green #4ADE80 only for the "open" light, on dark, never next to purple. White text and icons on purple. Pages declare color-scheme light.
- Logo: "Get Local Hawaiʻi" in white Playwrite on an orchid #8A3F9E hanging sign with white cords and a thin white edge, orchid and white only. Title tags and schema keep "Get Local Hawaii". Profile picture and tab icon: orchid square, white lettering.
- Hero: full-bleed photo with text on a smoked glass panel (charcoal 70% with blur, so text passes over pale lei photos). Mobile panel slides up over the bottom of the photo. Hero status line: glowing green dot + "[N] stands open now" once per-stand hours exist.
- Names: one plain name per page, the same on the Home door, the page headline and the menu: Oʻahu lūʻau, Honolulu airport lei, Send a lei to the mainland. Title tags carry the longer search version in plain spelling (e.g. "Oahu Luau 2026: Every Luau Compared", "Honolulu Airport Lei Stands: Where They Are, Hours and Prices").
- Home (after the Oct 9 agency review): doors in order lūʻau, airport, send a lei, each with a "Checked [date]" line; "Lei by flower and style" strip as a sign heading; no byline (removed Oct 16); one voice ("I") site-wide; footer has the reminder signup, Disclosure and Privacy links.
- Lightweight home (live since Oct 13): replaces the live home until the new pages exist. Hero "Get the lei of the land" on the stand sign (concept A on the Hero Concepts boards), two photo doors to live pages (Honolulu airport lei, Send a lei to the mainland), a "Coming next: lūʻau guide" email signup, lei by flower (the six live type pages), graduation guide link, footer. Doors are added as each new page goes live; never "coming soon" tiles. Inner pages stay live so their search rankings are kept.
- Coming-soon home (live since Oct 17): replaces the lightweight home while the full site is designed. Sand ground, centered logo with charcoal cords, "Find your lūʻau. Send some aloha.", one body line, a "Coming soon" line, the lei rows arch photo with the plumeria circle, footer with the contact address and Privacy. The Buttondown signup appears under "Coming soon" once the username is set.
- Editorial direction (Oct 17 boards, front runner, not decided): oversized Figtree 800 headlines, hairline-ruled numbered indexes instead of photo doors, arch-shaped photos, plain large section headings instead of sign headings, sand or charcoal ground. "Lei by type" replaces "Lei by flower" (maile is a leaf).
- Wayfinding signs: section headings drawn as signs (purple arrow box + charcoal bar + white fact tag such as "The stands | 8 stands"). A tag must carry a real fact or it is left off.
- Arrow: bold solid wayfinding arrow. Direction has meaning everywhere: down = this page, right = another page on the site, up-right = leaves the site (bookings, shops).
- One way to jump per page: long pages get an "On this page" directory under the hero; short pages get one hero sign button. Never both.
- Airport page (v2, chosen): route line with icons (car, parking, walking, cell phone lot), dark "arrivals board" stand list (open light, name, stall and hours, phone icon; no per-stand directions), stand-row photo strip (several photos, one wide photo, or hidden; Instagram handles as tags, feeds only with each stand's permission), lei price circles, buy-or-book split card, 3-milestone history timeline, Maile Lee quote. Flying-home rules moved to the taking-a-lei-home guide.
- Lūʻau page: 2026 changes note, filter chips (Families, Couples, Budget, Big show, North Shore day; "good for" tags to confirm), one card per lūʻau with "Check dates" up-right link, island map, how to choose.
- Send a lei page: arrival checker (event date + west or east of the Rockies gives an order-by date; estimate only), neutral A to Z shipper list (table on desktop), which lei travel well, before you order, April reminder signup.
- Images, ideal hero per page: home, a lei being placed over someone's shoulders; airport, the stand row at golden hour; lūʻau, dancers or fire knife at sunset (operator press kit or own visit); send a lei, a lei coiled in its open shipping box. No stock or AI images at launch; recognizable people need releases. Test photos on the canvas are placeholders.
- Before visits: missing details are hidden, never shown as brackets; public info shows its source and date; the live open count waits for per-stand hours.

## Vendors and outreach

Tracker: docs/vendor-tracker.xlsx (status dropdown, action column, summary tab, how-to tab).
- Listing depends on verification (own visit, or a vendor's own published info, dated), not on replies. Outreach is for photos, Instagram permission, referral deals and corrections.
- Round 1 launch list (17): 8 airport stands to confirm in person; Germaine's, Toa, Ka Moana, Polynesian Cultural Center, Chief's; Cindy's, Flower Leis, Buy Hawaiian Lei, Hawaii Flower Lei.
- Round 2 (6): Kaula Lūʻau, Hawaii Lei Stand, Shaka Lei, The Hawaiian Lei Company, Aloha Island Lei, Greeters of Hawaii.
- Monthly check day: process replies, add verified, remove anything flagged, update dates.
- Removal rule: closed, or no confirmation after two attempts or 30 days.
- Never show pending vendors publicly.

## Research summary (Oct 2026)

Demand, US-wide Keyword Planner, Sep 2025 to Aug 2026 (ranges because no active campaign):
- 10K to 100K: luau oahu; graduation leis (includes ribbon, candy, money lei); hawaiian lei
- 1K to 10K: best luau oahu; polynesian cultural center luau; lei day; fresh flower lei; fresh flower leis for graduation; maile, pikake, plumeria, puakenikeni, orchid, haku lei
- 100 to 1K: ship lei to mainland (highest bids, up to $7.87); four lei greeting variants; funeral lei; tuberose lei; real hawaiian lei; lei making class oahu
- 10 to 100: order lei online; fresh lei delivery; hawaiian lei delivery; lei delivery california
- Too small to report: lei delivery utah, lei delivery las vegas, airport lei stand variants
The August 2026 exports in ~/Desktop/claudecode/research/search were geo-targeted to Hawaiʻi, so they measure local demand only. Flower-name searches look mostly local.

Search Console, Aug 18 to Oct 6 2026: 289 impressions, 7 clicks, average position 12.6. Top queries: blue seafood company, gladys lei stand, airport lei stand(s).

Competition:
- Gifting: about 8 Hawaiʻi shippers own the buying searches (Hawaii Flower Lei dominates flower names; also Hawaii Lei Stand, Buy Hawaiian Lei, Cindy's, Flower Leis, Aloha Island Lei, Shaka Lei, The Hawaiian Lei Company). Not real rivals: Leilani's Leis (mainland maker, Las Vegas and San Diego), FiftyFlowers (Thai bulk), Party City and Walmart (silk), mainland florists. Only independent comparison is a short 2022 Hawaii Magazine piece. Gaps: real shipping cost, cutoffs, delay policy, Hawaiʻi-grown vs imported.
- Visitors: greetings and "best luau" are hard (OTAs, to-hawaii.com, Shaka Guide, hawaii-guide.com, big blogs). Easy to moderate: airport stands vendor by vendor, buying your own lei, current lei class calendar.

Self-fulfilled shipping, rejected for now: UPS Next Day Air from Hawaiʻi is $84 to $119 retail for a small box; Cindy's charges $55 for 1 to 2 lei, which only works with negotiated rates. A single orchid lei loses about $11 per order at retail freight. Every box needs USDA inspection (or a compliance agreement). Peak season is extreme. Revisit only for bundles and premium lei, after negotiated freight under about $45 a box.

Sources: Cindy's shipping page; UPS AK/HI retail rates 2026; USDA APHIS shipping from Hawaiʻi; Viator partner resources; polynesia.com/affiliates; Shaka Guide lūʻau guide; Hawaii News Now on Paradise Cove (Oct 28 2025); HDOT HNL lei greeting page; HDOT parking release Jun 9 2025; HDOT Pua Melia permit Jul 2 2026; Hawaiʻi Public Radio Apr 28 2023; Hawaii Business Oct 5 2020; Civil Beat Jan 6 2015; Beat of Hawaii Sep 2 2025 and May 21 2025; hawaiitravelwithkids.com; thehawaiivacationguide.com; hawaii-guide.com; Hawaii Magazine shipping guide.
