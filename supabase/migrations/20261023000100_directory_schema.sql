-- Directory schema: the site is a shop-local directory again (DECISIONS.md,
-- 2026-10-23). This extends the August tables instead of replacing them, so
-- the lei, fish and farmers market rows already imported keep their ids,
-- hours, products and verification history.
--
-- What it adds:
--   organizers        who runs a market, and how a vendor applies to it
--   markets           every recurring place vendors gather, not only farmers
--                     markets: makers and night markets, truck lots and
--                     rallies, farm stands, swap meets, annual fairs
--   vendors           any seller (lei stand, truck, maker, farm, producer),
--                     with a claim flow so vendors keep their own rows current
--   market_dates      one-off and seasonal dates that a weekly session row
--                     cannot express ("2nd Saturday", "Nov 28, 2026")
--   source fields     every row says where it came from, how sure we are, and
--                     whether it is live; drafts never render
--
-- Values the source did not give stay NULL and render blank (CLAUDE.md).

-- Organizers ----------------------------------------------------------------

create table organizers (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  name                   text not null,
  website                text,
  vendor_application_url text,
  -- Business contact as published by the organizer. Never a private person.
  public_contact         text,
  -- Free text: fees come as ranges, tiers and deposits that do not fit a number.
  booth_fee_info         text,
  notes                  text,
  outreach_status        text check (outreach_status in ('contacted', 'replied', 'partner', 'declined')),
  source_url             text,
  created_at             timestamptz not null default now()
);

-- Markets -------------------------------------------------------------------

alter table markets
  add column kind text not null default 'farmers_market' check (kind in (
    'farmers_market', 'farm_stand', 'u_pick', 'makers_market', 'night_market',
    'popup_series', 'holiday_fair', 'craft_fair_annual', 'swap_meet',
    'food_truck_park', 'food_truck_rally', 'brewery_truck_night')),
  add column organizer_id           uuid references organizers (id) on delete set null,
  add column venue_name             text,
  add column address                text,
  add column frequency              text check (frequency in (
    'daily', 'weekly', 'biweekly', 'monthly', 'seasonal', 'annual', 'varies')),
  -- The schedule as the source wrote it. Sessions and market_dates are the
  -- structured version; this is what a person reads when those are partial.
  add column schedule_text          text,
  add column website                text,
  add column facebook               text,
  add column admission              text,
  add column parking_notes          text,
  add column vendor_count_est       text,
  add column vendor_application_url text,
  add column booth_fee              text,
  add column accepts_snap           boolean,
  add column da_bux                 boolean,
  add column dog_friendly           boolean;

-- area held a seeded neighborhood name; research rows carry a region instead
-- and some have neither.
alter table markets alter column area drop not null;

create index markets_kind_island_idx on markets (kind, island_id);

-- Vendors -------------------------------------------------------------------

alter table vendors
  add column fixed_or_roaming text check (fixed_or_roaming in ('fixed', 'roaming')),
  add column instagram        text,
  add column facebook         text,
  add column accepts_snap     boolean,
  -- Claim flow: a vendor proves ownership, then edits their own row and posts
  -- where they will be. claimed_by is the Supabase auth user.
  add column claimed_by       uuid,
  add column claimed_at       timestamptz;

alter table vendors alter column area drop not null;

-- Categories used by the research import. Existing lei and fish rows keep
-- their slugs.
insert into categories (name, slug) values
  ('Food trucks',      'food-trucks'),
  ('Prepared food',    'prepared-food'),
  ('Local food makers','food-producers'),
  ('Farms',            'farms'),
  ('Makers',           'makers'),
  ('Flowers',          'flowers'),
  ('Other',            'other')
on conflict (slug) do nothing;

-- Dates that a weekly session cannot hold ------------------------------------

create table market_dates (
  id        uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at   timestamptz,
  note      text
);

create index market_dates_market_starts_idx on market_dates (market_id, starts_at);

-- Source, confidence and publish state on every listed thing ------------------

alter table markets
  add column status         text not null default 'active' check (status in ('active', 'uncertain', 'closed')),
  add column confidence     text check (confidence in ('high', 'medium', 'low')),
  add column source_date    text,
  add column publish_status text not null default 'draft' check (publish_status in ('draft', 'published'));

alter table vendors
  add column status         text not null default 'active' check (status in ('active', 'uncertain', 'closed')),
  add column confidence     text check (confidence in ('high', 'medium', 'low')),
  add column publish_status text not null default 'draft' check (publish_status in ('draft', 'published'));

-- Rows already on the live site stay live.
update markets set publish_status = 'published' where is_active;
update vendors set publish_status = 'published' where is_active;

-- Row level security ----------------------------------------------------------

alter table organizers   enable row level security;
alter table market_dates enable row level security;

create policy "public read" on organizers   for select using (true);
create policy "public read" on market_dates for select using (true);

-- Drafts are readable by the service role only.
drop policy "public read" on markets;
drop policy "public read" on vendors;
create policy "public read published" on markets for select using (publish_status = 'published');
create policy "public read published" on vendors for select using (publish_status = 'published');

-- A vendor who has claimed a row can update it. Insert and delete stay
-- service-role only.
create policy "owner update" on vendors for update
  using (claimed_by = auth.uid())
  with check (claimed_by = auth.uid());
