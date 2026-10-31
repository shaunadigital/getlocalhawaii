-- Publish the holiday fairs and special-event markets that have a confirmed
-- 2026 or 2027 date in market_dates (stored in 20261030000300), so the
-- holiday fairs page and side pages can show them. Shauna approved Oct 30.
update markets m
set publish_status = 'published'
where m.publish_status = 'draft'
  and m.status = 'active'
  and exists (select 1 from market_dates d where d.market_id = m.id and d.starts_at >= timestamptz '2026-10-30 00:00:00 Pacific/Honolulu');
