-- Sides (and a clearer area) for the published markets and vendors, from their
-- stored address, venue or area. The home map filters on side, and every
-- published row had none. Draft rows get sides when they are approved.
update markets m set side = v.side, area = coalesce(v.area, m.area)
from (values
  ('808-craft-and-gift-fair-special-events-waimalu-plaza-ewa-town-center-holiday', 'leeward_ewa', 'Waimalu and ʻEwa'),
  ('808-craft-and-gift-fair-windward-city-shopping-center', 'windward', 'Kāneʻohe'),
  ('aliiolani-craft-fair', 'town', 'Kaimukī'),
  ('aloha-home-market-kailua', 'windward', 'Kailua'),
  ('black-friday-makers-market-ala-moana-hotel', 'town', 'Ala Moana'),
  ('ewa-beach-peoples-open-market', 'leeward_ewa', null),
  ('halawa-peoples-open-market', 'leeward_ewa', null),
  ('hawaii-holiday-craft-and-gift-fair', 'town', 'Kakaʻako'),
  ('hawaiian-mission-houses-annual-holiday-craft-fair', 'town', 'Downtown'),
  ('honolulu-farmers-market', 'town', null),
  ('honolulu-festival-craft-fair', 'town', 'Ala Moana'),
  ('islandwide-crafts-and-food-expo', 'town', 'Kakaʻako'),
  ('kailua-peoples-open-market', 'windward', null),
  ('kailua-town-farmers-market', 'windward', null),
  ('kalakaua-peoples-open-market', 'town', null),
  ('kalama-beach-club-holiday-artisan-fair', 'windward', 'Kailua'),
  ('kaneohe-peoples-open-market', 'windward', null),
  ('kapiolani-peoples-open-market', 'town', null),
  ('kapolei-peoples-open-market', 'leeward_ewa', null),
  ('kcc-farmers-market', 'town', null),
  ('keep-it-kaimuki-saturday-makers-mart', 'town', 'Kaimukī'),
  ('malama-hawaii-makers-market-hawaii-kai', 'east', 'Hawaiʻi Kai'),
  ('mana-up-showcase-marketplace', 'town', 'Ala Moana'),
  ('mele-kalikimaka-marketplace', 'town', 'Kakaʻako'),
  ('mililani-farmers-market', 'central', null),
  ('mililani-peoples-open-market', 'central', null),
  ('mililani-town-association-holiday-craft-fair', 'central', 'Mililani'),
  ('noelani-craft-and-childrens-fair', 'town', 'Mānoa'),
  ('royal-kunia-peoples-open-market', 'leeward_ewa', null),
  ('wahiawa-peoples-open-market', 'central', null),
  ('waiau-peoples-open-market', 'leeward_ewa', null),
  ('waikele-peoples-open-market', 'leeward_ewa', null),
  ('waipahu-peoples-open-market', 'leeward_ewa', null)
) as v(slug, side, area)
where m.slug = v.slug;

update markets set name = 'Aliʻiolani Craft Fair' where slug = 'aliiolani-craft-fair';

update vendors set side = 'town'
 where publish_status = 'published' and area in ('Chinatown', 'Kalihi', 'Airport', 'Kapahulu', 'Pier 38', 'Kaimukī', 'Waikīkī', 'Mānoa', 'Mōʻiliʻili');
update vendors set side = 'windward'
 where publish_status = 'published' and area in ('Kāneʻohe', 'Kailua');
update vendors set side = 'north_shore'
 where publish_status = 'published' and area = 'Kahuku';
update vendors set side = 'leeward_ewa'
 where publish_status = 'published' and area in ('Aiea', 'Waipahu', 'Waiʻanae');
