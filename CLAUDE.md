# Get Local Hawaii

Shop-local directory for Oʻahu: farmers markets, makers and night markets, food trucks, farm stands, lei stands and the vendors who sell at them, plus where each vendor will be. Residents first, visitors second. Vendors claim and update their own listings; organizers post vendor applications. Written anonymously; every listing shows when it was checked, and "open now" is computed, never hardcoded. Other islands are collected as drafts and launch later.

## Key files

- `docs/BRAND_VOICE.md` - voice, honesty rules, vocabulary and visual quick reference. Read before writing any page, label, email or asset.
- `docs/STRATEGY.md` - the Oct 8 content-site plan, superseded on Oct 23 by the directory direction (DECISIONS.md). Its design system and lei page notes still apply.
- Seed data: Google Sheet "Get Local Hawaii seed data (Oahu)". Approved rows are imported (migration 20261023000400, generated from the sheet); rows without 2025-2026 evidence sit in its Archived tabs. Check those before re-adding anything; rows match the database by `seed_id`.
- Current page designs: the canvas https://claude.ai/artifact/WDtrJ1ZWb74eENEW5J2fcu, page "Directory (current)" (mobile 390px and desktop 1280px). "Old designs" holds superseded boards; docs/designs_100826/ is an old export. Rebuild as components; do not copy markup.
- `docs/BUILD_SPEC.md` - build spec for the original directory: data model and status logic still apply; its page inventory and design tokens are superseded by STRATEGY.md.
- `docs/SEO_TARGETS.md` - keyword targets from Shauna's Keyword Planner data; drives which pages exist.
- `data/lei-vendors-oahu.csv` - real vendor dataset from public sources, each row carries source URLs and a confidence rating.
- `src/lib/directory/` - the directory's data layer: reads published rows from Supabase (REST, anon key) or from `GL_SNAPSHOT`, joins them and computes status. New pages use it. `src/data/site-data.json` and `src/lib/db.ts` still feed the older /oahu/lei and guide pages.
- `src/lib/status.ts` - all status, freshness and countdown logic. `src/lib/time.ts` - all Hawaii clock math. `src/lib/queries.ts` - data access, returns objects with status already attached.
- `src/content/` - page prose for the lei type, area, delivery and guide pages. `src/lib/schema.ts` - JSON-LD builders. `src/lib/site.ts` - origin, site name, contact address.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind v4), Vitest for unit tests.
- Supabase (project ref clckgomykxqrziefyfyn, its own account; the old aqizthcpjohxsepbemjm project is retired) is the source of truth for listings. The site reads it with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; a Vercel build without them fails on purpose. `supabase/migrations/` is the schema in plain Postgres; every migration must run clean in order. The Supabase connector applies migrations; destructive statements wait for an approval prompt in the app. `research_notes`, `organizer_name`, `markets_seen_at` and organizer `notes` are internal and never render.
- Repo https://github.com/shaunadigital/getlocalhawaii.git, deployed on Vercel from `main`.
- Live at https://getlocalhawaii.com (and www). Vercel temp domain: getlocalhawaii.vercel.app.
- Env: the two Supabase vars above. Locally, `GL_SNAPSHOT=.local/snapshot.json` reads a snapshot file instead (rebuild it by running every migration in a local Postgres). `SIGNUP_SHEET_URL` plus `SIGNUP_SHEET_SECRET` (Vercel only) turn on the coming-soon email box, which posts to /api/signup and the signups Google Sheet. `NEXT_PUBLIC_BUTTONDOWN_USERNAME` still drives the older SignupForm component.

## Conventions

- Mobile-first, but every page also has a designed desktop board in the canvas. Build both, breakpoint around 768px.
- Never use em dashes in any user-facing copy, commit messages, or docs.
- The site never names or pictures its author; copy speaks as "I". No byline or "born and raised" lines on any page.
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

- URLs: `/`, `/markets/[slug]`, `/holiday-fairs`, `/[category]/[vendor]`, `/search?q=`; `/farmers-markets/[slug]` redirects to `/markets/[slug]`.

- `npm run dev` - local dev server
- `npm run build` - production build
- `npm test` - unit tests (Vitest)
- `npx tsc --noEmit && npx eslint src --max-warnings=0` - typecheck and lint
- Deploys happen on push to `main`; no manual deploy step.

## Commits

Commit as Shauna Arnold <8376913+shaunagits@users.noreply.github.com>, never as Claude, and never add Co-Authored-By or "Generated with" lines. Before every push, check `git log -1 --format='%an'`. `.claude/settings.json` sets this automatically.
