-- Run in Supabase SQL editor AFTER the negotiation-and-views migration.
-- Seeds realistic listing_views + a mix of negotiating and counter_offered orders
-- so the analytics dashboard and negotiation flow have visible data on demo.
-- Safe to re-run: it appends more views/orders each time.

-- 1. Listing views — spread each listing 8-25 views across last 21 days,
--    varying hour-of-day so the "views by day" chart has structure.
insert into public.listing_views (listing_id, created_at, viewer_phone)
select
  l.id,
  now()
    - (floor(random() * 21)::int || ' days')::interval
    - (floor(random() * 20)::int || ' hours')::interval
    - (floor(random() * 60)::int || ' minutes')::interval,
  case when random() < 0.4
    then (array['9876543210','9123456780','9988776655','9012345678','9765432180'])[floor(random()*5+1)]
    else null
  end
from public.listings l
cross join generate_series(1, (8 + floor(random() * 18))::int);

-- 2. Negotiating orders (buyer's offer awaiting farmer response).
--    Picks ~6 random listings and inserts a negotiating order for each.
insert into public.orders
  (farmer_phone, buyer_name, buyer_phone, listing_id, produce_name,
   quantity_kg, price_per_kg, status, note, offered_price, counter_price, created_at)
select
  l.farmer_phone,
  buyers.name,
  buyers.phone,
  l.id,
  l.produce_name,
  round((1 + random() * 8)::numeric, 1),  -- 1-9 kg
  l.price_per_kg,
  'negotiating',
  'Can you do a slightly better price?',
  round((l.price_per_kg * (0.75 + random() * 0.15))::numeric, 1),  -- 75-90% of listed
  null,
  now() - (floor(random() * 5)::int || ' hours')::interval
from (
  select * from public.listings order by random() limit 6
) l
cross join lateral (
  select * from (values
    ('Priya Sharma','9876543210'),
    ('Arjun Reddy','9123456780'),
    ('Meera Iyer','9988776655'),
    ('Kavya Menon','9012345678'),
    ('Rohan Patel','9765432180'),
    ('Divya Nair','9876501234')
  ) as v(name, phone)
  order by random() limit 1
) buyers;

-- 3. Counter-offered orders (farmer countered, awaiting buyer).
insert into public.orders
  (farmer_phone, buyer_name, buyer_phone, listing_id, produce_name,
   quantity_kg, price_per_kg, status, note, offered_price, counter_price, created_at)
select
  l.farmer_phone,
  buyers.name,
  buyers.phone,
  l.id,
  l.produce_name,
  round((2 + random() * 8)::numeric, 1),
  l.price_per_kg,
  'counter_offered',
  null,
  round((l.price_per_kg * (0.70 + random() * 0.10))::numeric, 1),  -- buyer offered 70-80%
  round((l.price_per_kg * (0.88 + random() * 0.08))::numeric, 1),  -- farmer countered 88-96%
  now() - (floor(random() * 3)::int || ' hours')::interval
from (
  select * from public.listings order by random() limit 4
) l
cross join lateral (
  select * from (values
    ('Priya Sharma','9876543210'),
    ('Arjun Reddy','9123456780'),
    ('Meera Iyer','9988776655'),
    ('Kavya Menon','9012345678')
  ) as v(name, phone)
  order by random() limit 1
) buyers;

-- Verify
select status, count(*) from public.orders group by status order by status;
select count(*) as total_views from public.listing_views;
