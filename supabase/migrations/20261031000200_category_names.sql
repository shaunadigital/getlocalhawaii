-- Category names approved Oct 30. Slugs that exist keep their slug so links do not change.
-- "Other" stays as an internal holding category; the site does not give it a public page.
update categories set name = 'Snacks and pantry' where slug = 'food-producers';

insert into categories (name, slug) values
  ('Plants',               'plants'),
  ('Clothing and jewelry', 'clothing-jewelry'),
  ('Bath and body',        'bath-body'),
  ('Pets',                 'pets')
on conflict (slug) do update set name = excluded.name;

-- Move the listed "other" vendors whose own description says what they sell.
-- The rest stay in "other" until a source says what they are.
update vendors set category_id = (select id from categories where slug = 'plants')
 where slug in ('808-plant-designs', 'growing-creations');
update vendors set category_id = (select id from categories where slug = 'pets')
 where slug = 'bow-wow-kaukau';
update vendors set category_id = (select id from categories where slug = 'bath-body')
 where slug = 'incoco';
update vendors set category_id = (select id from categories where slug = 'clothing-jewelry')
 where slug in ('its-about-time', 'kissy', 'pukoa-imports', 'silverspring');
