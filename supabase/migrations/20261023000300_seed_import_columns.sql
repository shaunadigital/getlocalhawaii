-- Columns for the 2026-10-23 seed import from the "Get Local Hawaii seed data
-- (Oahu)" sheet. seed_id is the sheet's row id (MKT-001, VND-001, ORG-001), so
-- later research passes can match rows instead of re-adding them.
-- research_notes, organizer_name, markets_seen_at and markets_run hold the
-- researcher's text as written; they are internal and never render.

alter table markets
  add column seed_id        text unique,
  add column organizer_name text,
  add column research_notes text;

alter table vendors
  add column seed_id         text unique,
  add column markets_seen_at text,
  add column research_notes  text;

alter table organizers
  add column seed_id     text unique,
  add column markets_run text;

-- The sheet also lists the 17 markets already imported in August. Those rows
-- keep their August data (and the City's coordinates); they only gain the
-- sheet id. MKT-018 duplicates MKT-040 (Honolulu Night Market) and is not
-- imported.
update markets m set seed_id = s.seed_id
from (values
  ('MKT-012', 'kalakaua-peoples-open-market'),
  ('MKT-050', 'kapiolani-peoples-open-market'),
  ('MKT-068', 'kailua-peoples-open-market'),
  ('MKT-069', 'kaneohe-peoples-open-market'),
  ('MKT-112', 'waipahu-peoples-open-market'),
  ('MKT-113', 'wahiawa-peoples-open-market'),
  ('MKT-114', 'halawa-peoples-open-market'),
  ('MKT-115', 'mililani-peoples-open-market'),
  ('MKT-116', 'royal-kunia-peoples-open-market'),
  ('MKT-117', 'waiau-peoples-open-market'),
  ('MKT-118', 'waikele-peoples-open-market'),
  ('MKT-146', 'ewa-beach-peoples-open-market'),
  ('MKT-147', 'kapolei-peoples-open-market'),
  ('MKT-008', 'honolulu-farmers-market'),
  ('MKT-057', 'kcc-farmers-market'),
  ('MKT-110', 'mililani-farmers-market'),
  ('MKT-065', 'kailua-town-farmers-market')
) as s(seed_id, slug)
where m.slug = s.slug;
