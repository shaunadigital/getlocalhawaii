-- New listing types, Oct 30: festivals with vendor booths, plant and orchid
-- sales, flea markets, and farm boxes. Roadside fruit stands use the existing
-- farm_stand kind. CSA shares join the existing CSF channel kind as 'csa'.
alter table markets drop constraint markets_kind_check;
alter table markets add constraint markets_kind_check check (kind in (
  'farmers_market', 'farm_stand', 'u_pick', 'makers_market', 'night_market', 'popup_series',
  'holiday_fair', 'craft_fair_annual', 'swap_meet', 'food_truck_park', 'food_truck_rally',
  'brewery_truck_night', 'festival', 'plant_sale', 'flea_market'));

alter table vendor_channels drop constraint vendor_channels_kind_check;
alter table vendor_channels add constraint vendor_channels_kind_check check (kind in (
  'ships', 'online_order', 'pickup', 'csf', 'csa', 'delivery', 'catering', 'stockist'));
