-- Other names and brand grouping, from the Oct 30 Search Console review.
-- aliases: other spellings people search ("Blue Sea Food", "Maguro Bros",
-- マグロブラザーズ). Used for search matching and schema alternateName.
-- brand: a shared slug for multi-location businesses (tamuras, fresh-catch,
-- maguro-brothers) so each location page can list the others.
alter table vendors
  add column aliases text[],
  add column brand text;

create index vendors_brand on vendors (brand) where brand is not null;

grant select (aliases, brand) on vendors to anon, authenticated;
