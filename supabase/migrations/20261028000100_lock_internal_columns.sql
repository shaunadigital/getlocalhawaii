-- Lock the public API down before the site reads the database.
--
-- 1. Internal columns never leave the database through the public API.
--    anon and authenticated lose table-wide SELECT and get it back column by
--    column, minus research_notes, markets_seen_at, organizer_name, organizer
--    notes, markets_run, outreach_status, seed_id and claimed_by. A column
--    added later is hidden until a migration grants it.
-- 2. Hours, products, vendor links, sessions and dates only show for
--    published vendors and markets, so drafts do not leak through child rows.
-- 3. A vendor who claimed a row can edit their own listing details only; they
--    cannot publish, unpublish, re-rate, rename or reassign it.
-- 4. anon and authenticated keep no write grants except that owner update.
--    The service role (imports, admin) is unaffected.

-- Writes: none for the public roles, except the owner update below.
revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public from anon, authenticated;

-- Vendors ---------------------------------------------------------------------
revoke select on vendors from anon, authenticated;
grant select (
  id, slug, name, category_id, island_id, area, description, story, lat, lng,
  distance_mi, phone, contact_method, payment_notes, good_to_know, is_active,
  created_at, address, website, ships_mainland, source_url, fixed_or_roaming,
  instagram, facebook, accepts_snap, claimed_at, status, confidence,
  publish_status
) on vendors to anon, authenticated;

grant update (
  description, story, phone, contact_method, payment_notes, good_to_know,
  address, website, instagram, facebook, accepts_snap, ships_mainland,
  fixed_or_roaming
) on vendors to authenticated;

-- Markets ---------------------------------------------------------------------
revoke select on markets from anon, authenticated;
grant select (
  id, slug, name, island_id, area, description, location_notes, instagram,
  getting_there, distance_mi, is_active, created_at, lat, lng, operator,
  ebt_tokens, source_url, kind, organizer_id, venue_name, address, frequency,
  schedule_text, website, facebook, admission, parking_notes, vendor_count_est,
  vendor_application_url, booth_fee, accepts_snap, da_bux, dog_friendly,
  status, confidence, source_date, publish_status
) on markets to anon, authenticated;

-- Organizers ------------------------------------------------------------------
revoke select on organizers from anon, authenticated;
grant select (
  id, slug, name, website, vendor_application_url, public_contact,
  booth_fee_info, source_url, created_at
) on organizers to anon, authenticated;

-- Child rows follow their parent's publish state. The subqueries run under
-- the caller's RLS, so a draft parent is simply not found.
drop policy "public read" on vendor_hours;
create policy "public read published" on vendor_hours for select
  using (exists (select 1 from vendors v where v.id = vendor_id));

drop policy "public read" on vendor_products;
create policy "public read published" on vendor_products for select
  using (exists (select 1 from vendors v where v.id = vendor_id));

drop policy "public read" on market_vendors;
create policy "public read published" on market_vendors for select
  using (exists (select 1 from vendors v where v.id = vendor_id)
     and exists (select 1 from markets m where m.id = market_id));

drop policy "public read" on market_sessions;
create policy "public read published" on market_sessions for select
  using (exists (select 1 from markets m where m.id = market_id));

drop policy "public read" on market_dates;
create policy "public read published" on market_dates for select
  using (exists (select 1 from markets m where m.id = market_id));

-- Owner update: the policy stays; the column grant above limits what changes.
drop policy "owner update" on vendors;
create policy "owner update" on vendors for update to authenticated
  using (claimed_by = (select auth.uid()))
  with check (claimed_by = (select auth.uid()));
