-- Holiday fair and special-event dates, so pages can show them as dates
-- instead of schedule text. Only dates a source states for 2026 or 2027 are
-- stored; a date without posted hours is stored at local midnight with
-- time_posted = false, and the page shows the date with "hours not posted".
-- Second-Saturday dates for MKT-080 follow its posted "2nd Saturdays" rule.
-- Also adds Windward Mall Farmers Market's weekly sessions.
-- Rows match markets by seed_id. Publishing is a separate step.

alter table market_dates add column time_posted boolean not null default true;
grant select on market_dates to anon, authenticated;

insert into market_dates (market_id, starts_at, ends_at, time_posted, note)
select m.id, v.starts_at, v.ends_at, v.time_posted, v.note
from (values
  ('MKT-003', timestamptz '2026-11-05 00:00:00 Pacific/Honolulu', null, false, 'In-person marketplace'),
  ('MKT-076', timestamptz '2026-11-07 09:30:00 Pacific/Honolulu', timestamptz '2026-11-07 14:30:00 Pacific/Honolulu', true, null),
  ('MKT-062', timestamptz '2026-11-07 09:00:00 Pacific/Honolulu', timestamptz '2026-11-07 14:00:00 Pacific/Honolulu', true, null),
  ('MKT-062', timestamptz '2026-12-05 09:00:00 Pacific/Honolulu', timestamptz '2026-12-05 14:00:00 Pacific/Honolulu', true, null),
  ('MKT-032', timestamptz '2026-11-14 00:00:00 Pacific/Honolulu', null, false, '2025 hours were 9a to 2p'),
  ('MKT-080', timestamptz '2026-11-14 10:00:00 Pacific/Honolulu', timestamptz '2026-11-14 14:30:00 Pacific/Honolulu', true, '2nd Saturday, per the posted schedule'),
  ('MKT-080', timestamptz '2026-12-12 10:00:00 Pacific/Honolulu', timestamptz '2026-12-12 14:30:00 Pacific/Honolulu', true, '2nd Saturday, per the posted schedule'),
  ('MKT-080', timestamptz '2026-12-05 00:00:00 Pacific/Honolulu', null, false, 'Kāneʻohe Christmas Parade fair'),
  ('MKT-123', timestamptz '2026-11-21 00:00:00 Pacific/Honolulu', null, false, 'ʻEwa Town Center Holiday Craft Fair'),
  ('MKT-022', timestamptz '2026-11-27 10:00:00 Pacific/Honolulu', timestamptz '2026-11-27 15:00:00 Pacific/Honolulu', true, null),
  ('MKT-027', timestamptz '2026-11-27 00:00:00 Pacific/Honolulu', null, false, '2025 hours were Fri 4p to 8p'),
  ('MKT-027', timestamptz '2026-11-28 00:00:00 Pacific/Honolulu', null, false, '2025 hours were Sat 9a to 7p'),
  ('MKT-027', timestamptz '2026-11-29 00:00:00 Pacific/Honolulu', null, false, '2025 hours were Sun 9a to 5p'),
  ('MKT-025', timestamptz '2026-11-28 08:30:00 Pacific/Honolulu', timestamptz '2026-11-28 15:00:00 Pacific/Honolulu', true, null),
  ('MKT-029', timestamptz '2026-11-28 10:00:00 Pacific/Honolulu', timestamptz '2026-11-28 19:00:00 Pacific/Honolulu', true, null),
  ('MKT-086', timestamptz '2026-11-29 00:00:00 Pacific/Honolulu', null, false, null),
  ('MKT-086', timestamptz '2026-12-06 00:00:00 Pacific/Honolulu', null, false, null),
  ('MKT-086', timestamptz '2026-12-13 00:00:00 Pacific/Honolulu', null, false, null),
  ('MKT-086', timestamptz '2026-12-20 00:00:00 Pacific/Honolulu', null, false, null),
  ('MKT-021', timestamptz '2026-12-05 08:00:00 Pacific/Honolulu', timestamptz '2026-12-05 14:00:00 Pacific/Honolulu', true, null),
  ('MKT-125', timestamptz '2026-12-05 16:00:00 Pacific/Honolulu', timestamptz '2026-12-05 21:00:00 Pacific/Honolulu', true, null),
  ('MKT-031', timestamptz '2026-12-12 09:00:00 Pacific/Honolulu', timestamptz '2026-12-12 19:00:00 Pacific/Honolulu', true, null),
  ('MKT-031', timestamptz '2026-12-13 09:00:00 Pacific/Honolulu', timestamptz '2026-12-13 17:00:00 Pacific/Honolulu', true, null),
  ('MKT-024', timestamptz '2026-10-30 00:00:00 Pacific/Honolulu', null, false, '2025 hours were Fri 12p to 7p'),
  ('MKT-024', timestamptz '2026-10-31 00:00:00 Pacific/Honolulu', null, false, '2025 hours were Sat 10a to 6p'),
  ('MKT-024', timestamptz '2026-11-01 00:00:00 Pacific/Honolulu', null, false, '2025 hours were Sun 10a to 5p'),
  ('MKT-024', timestamptz '2026-12-18 00:00:00 Pacific/Honolulu', null, false, '2025 hours were Fri 12p to 7p'),
  ('MKT-024', timestamptz '2026-12-19 00:00:00 Pacific/Honolulu', null, false, '2025 hours were Sat 10a to 6p'),
  ('MKT-024', timestamptz '2026-12-20 00:00:00 Pacific/Honolulu', null, false, '2025 hours were Sun 10a to 5p'),
  ('MKT-046', timestamptz '2027-03-05 00:00:00 Pacific/Honolulu', null, false, '31st Honolulu Festival'),
  ('MKT-046', timestamptz '2027-03-06 00:00:00 Pacific/Honolulu', null, false, '31st Honolulu Festival'),
  ('MKT-046', timestamptz '2027-03-07 00:00:00 Pacific/Honolulu', null, false, '31st Honolulu Festival')
) as v(seed_id, starts_at, ends_at, time_posted, note)
join markets m on m.seed_id = v.seed_id;

insert into market_sessions (market_id, day_of_week, starts, ends)
select m.id, v.dow, v.starts, v.ends
from (values (3, time '14:00', time '18:00'), (0, time '10:00', time '14:00')) as v(dow, starts, ends)
join markets m on m.seed_id = 'MKT-071'
where not exists (select 1 from market_sessions s where s.market_id = m.id);
