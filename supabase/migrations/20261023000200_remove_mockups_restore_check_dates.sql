-- Two leftovers from the August migrations, found when they were first run
-- against a hosted database on 2026-10-23.
--
-- 1. The design-mockup rows from 20260819000200 that no later import replaced:
--    four invented vendors, the invented Kaimukī market, two invented pop-ups,
--    and their invented called/visited/organizer_confirmed checks. The
--    directory schema then marked them published. Nobody called or visited
--    anything (CLAUDE.md), so they go.
--
-- 2. The August imports stamp their source_check events with the day the
--    migration runs. Run today, every listing would read "checked" today. These
--    restore the dates the sources were actually read, matching
--    src/data/site-data.json. Only stamps later than the last import day move.

-- Mockups -------------------------------------------------------------------

delete from verification_events
 where (subject_type = 'vendor' and subject_id in (select id from vendors where slug in (
          'hookipa-kalo-farm', 'kahuku-mango-bros', 'nalo-greens', 'windward-fish-guy')))
    or (subject_type = 'market' and subject_id in (select id from markets where slug = 'kaimuki-neighborhood'))
    or (subject_type = 'popup'  and subject_id in (select id from popups where name in (
          $t$Kalo & Poi pop-up$t$, $t$Kakaʻako fish drop$t$)));

delete from reports
 where (subject_type = 'vendor' and subject_id in (select id from vendors where slug in (
          'hookipa-kalo-farm', 'kahuku-mango-bros', 'nalo-greens', 'windward-fish-guy')))
    or (subject_type = 'market' and subject_id in (select id from markets where slug = 'kaimuki-neighborhood'));

delete from popups where name in ($t$Kalo & Poi pop-up$t$, $t$Kakaʻako fish drop$t$);

-- vendor_hours, vendor_products, market_sessions and market_vendors cascade.
delete from vendors where slug in ('hookipa-kalo-farm', 'kahuku-mango-bros', 'nalo-greens', 'windward-fish-guy');
delete from markets where slug = 'kaimuki-neighborhood';

-- Check dates ----------------------------------------------------------------

update verification_events set verified_at = timestamptz '2026-08-19 17:00:00-10'
 where method = 'source_check' and subject_type = 'vendor'
   and note = $t$checked their hiChinatown listing for hours and address$t$
   and verified_at > timestamptz '2026-08-28 00:00:00-10';

update verification_events set verified_at = timestamptz '2026-08-19 09:00:00-10'
 where method = 'source_check' and subject_type = 'vendor'
   and subject_id in (select v.id from vendors v join categories c on c.id = v.category_id where c.slug = 'lei')
   and verified_at > timestamptz '2026-08-28 00:00:00-10';

update verification_events set verified_at = timestamptz '2026-08-26 09:00:00-10'
 where method = 'source_check' and subject_type = 'vendor'
   and subject_id in (select v.id from vendors v join categories c on c.id = v.category_id where c.slug = 'fish')
   and verified_at > timestamptz '2026-08-28 00:00:00-10';

update verification_events set verified_at = timestamptz '2026-08-27 09:00:00-10'
 where method = 'source_check' and subject_type = 'market'
   and verified_at > timestamptz '2026-08-28 00:00:00-10';
