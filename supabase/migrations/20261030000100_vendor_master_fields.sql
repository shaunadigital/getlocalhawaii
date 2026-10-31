-- Vendor master fields, from the Oct 30 field list (vendor page, search, home).
-- Adds only; nothing is dropped or rewritten. Retired columns (distance_mi,
-- is_active, payment_notes, accepts_snap, ships_mainland) stay until the site
-- stops reading them.
-- Depends on 20261028000100_lock_internal_columns: vendors and markets are
-- column-granted, so each new public column is granted below and owner_email
-- stays internal.

-- Vendors ---------------------------------------------------------------------
alter table vendors
  add column side text check (side in ('north_shore', 'windward', 'central', 'leeward_ewa', 'town', 'east')),
  add column neighborhood text,
  add column made_where text,
  add column icon_override text,
  add column hours_note text,
  add column schedule_source_url text,
  add column order_url text,
  add column source_label text,
  add column payment_methods text[] check (payment_methods <@ array['cash', 'card', 'venmo', 'snap', 'da_bux', 'other']::text[]),
  add column tags text[],
  add column photo_url text,
  add column photo_credit text,
  add column photo_taken_at date,
  add column photo_permission text check (photo_permission in ('own_photo', 'owner_supplied', 'permission_granted')),
  add column owner_email text;

grant select (
  side, neighborhood, made_where, icon_override, hours_note, schedule_source_url,
  order_url, source_label, payment_methods, tags, photo_url, photo_credit,
  photo_taken_at
) on vendors to anon, authenticated;

grant update (
  made_where, hours_note, schedule_source_url, order_url, payment_methods,
  photo_url, photo_credit, photo_taken_at
) on vendors to authenticated;

-- Markets ---------------------------------------------------------------------
alter table markets
  add column side text check (side in ('north_shore', 'windward', 'central', 'leeward_ewa', 'town', 'east')),
  add column neighborhood text;

grant select (side, neighborhood) on markets to anon, authenticated;

-- Vendor to market links: where the link came from and when it was last seen.
alter table market_vendors
  add column source_url text,
  add column seen_at date;

-- Products: an owner-supplied price line.
alter table vendor_products
  add column price_note text;

-- Other ways to buy: shipping, online orders, pickups, CSF shares, catering,
-- and stores that carry the vendor. Replaces ships_mainland over time.
create table vendor_channels (
  id         uuid primary key default gen_random_uuid(),
  vendor_id  uuid not null references vendors (id) on delete cascade,
  kind       text not null check (kind in ('ships', 'online_order', 'pickup', 'csf', 'delivery', 'catering', 'stockist')),
  label      text not null,
  url        text,
  note       text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index vendor_channels_vendor_id on vendor_channels (vendor_id);

alter table vendor_channels enable row level security;
create policy "public read published" on vendor_channels for select
  using (exists (select 1 from vendors v where v.id = vendor_id));

revoke insert, update, delete, truncate, references, trigger
  on vendor_channels from anon, authenticated;
