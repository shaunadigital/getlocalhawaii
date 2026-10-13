# Get Local Hawaii

Content site about lei and lūʻau on Oʻahu for visitors and for people sending a lei to the mainland: airport lei stands, a lūʻau comparison, and a lei shipping comparison. Written anonymously by someone born and raised here; every page shows when it was checked, and "open now" is computed, never hardcoded. The older vendor directory (lei, fish, farmers markets) stays live but is no longer the product.

## Key files

- `docs/STRATEGY.md` - direction, audiences, revenue, site map, design system and outreach. Read this before building anything.
- `docs/designs_100826/` - current page designs, copies of the canvas https://claude.ai/artifact/WDtrJ1ZWb74eENEW5J2fcu (mobile 390px and desktop 1280px per page). Rebuild as components; do not copy markup.
- `docs/BUILD_SPEC.md` - build spec for the original directory: data model and status logic still apply; its page inventory and design tokens are superseded by STRATEGY.md.
- `docs/SEO_TARGETS.md` - keyword targets from Shauna's Keyword Planner data; drives which pages exist.
- `data/lei-vendors-oahu.csv` - real vendor dataset from public sources, each row carries source URLs and a confidence rating.
- `src/data/site-data.json` - all listings (vendors, hours, products, markets, checks), bundled with the build. `src/lib/db.ts` joins it.
- `src/lib/status.ts` - all status, freshness and countdown logic. `src/lib/time.ts` - all Hawaii clock math. `src/lib/queries.ts` - data access, returns objects with status already attached.
- `src/content/` - page prose for the lei type, area, delivery and guide pages. `src/lib/schema.ts` - JSON-LD builders. `src/lib/site.ts` - origin, site name, contact address.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind v4), Vitest for unit tests.
- No database. Listings live in `src/data/site-data.json`; edit it and push to change one. `supabase/migrations/` is kept only as the schema record.
- Repo https://github.com/shaunagits/getlocalhawaii.git, deployed on Vercel from `main`.
- Live at https://getlocalhawaii.com (and www). Vercel temp domain: getlocalhawaii.vercel.app.
- Env: none required. Optional `NEXT_PUBLIC_BUTTONDOWN_USERNAME` turns on the email signup in production.

## Conventions

- Mobile-first, but every page also has a designed desktop board in the canvas. Build both, breakpoint around 768px.
- Never use em dashes in any user-facing copy, commit messages, or docs.
- The site never names or pictures its author; copy speaks as "I", someone born and raised on Oʻahu.
- Do not credit Claude or AI in commits, code comments, or anywhere in the repo.
- Hawaiian diacriticals (ʻokina, kahakō) must be preserved exactly: Oʻahu, Kalihi, Waimānalo, Kaimukī, lūʻau, GET LOCAL HAWAIʻI.
- All status logic (open now, closes 2p, checked today) computed from data in Pacific/Honolulu timezone. Never store a computed status.
- Listings come from public sources. Never claim a listing was called or visited unless it was: source_check renders CHECKED, contact methods render VERIFIED.
- A field the source did not give imports as NULL and renders blank. Never guess hours, addresses or products.
- Pages are `force-dynamic`: a cached "open now" is a wrong answer served fast.
- `day_of_week` is 0=Sunday..6=Saturday everywhere, matching JavaScript `getDay()`.

## Documentation rules

- This file is stable facts only: stack, conventions, key files, commands. Keep it under 60 lines. Edit only when something permanent changes.
- `docs/DECISIONS.md` is append-only. One line per entry: date, decision, one-phrase reason. Record only decisions a future session would otherwise re-litigate or reverse by accident. No narration of work done.
- `docs/STATUS.md` is always overwritten to reflect current state, max 20 lines: what works, what is in progress, next 3 steps, known issues. Rewrite it at the end of every working session. Never append history here; git log is the history.
- Do not create any other docs (no session summaries, changelogs, or READMEs beyond a 10-line README) unless asked.
- Commit messages carry the detail: what changed and why, so the docs can stay short.

## Commands

- `npm run dev` - local dev server
- `npm run build` - production build
- `npm test` - unit tests (Vitest)
- `npx tsc --noEmit && npx eslint src --max-warnings=0` - typecheck and lint
- Deploys happen on push to `main`; no manual deploy step.
