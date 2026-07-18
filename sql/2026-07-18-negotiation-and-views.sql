-- Run in Supabase SQL editor.
-- Adds price-negotiation columns to orders and a listing_views table
-- for per-listing analytics.

-- 1. Negotiation columns on orders
alter table public.orders
  add column if not exists offered_price numeric,
  add column if not exists counter_price numeric;

-- Drop the old status check constraint if it exists, then re-add with new values.
do $$
declare
  cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'public.orders'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%';
  if cname is not null then
    execute format('alter table public.orders drop constraint %I', cname);
  end if;
end $$;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending','completed','cancelled','negotiating','counter_offered'));

-- 2. Listing views for analytics (one row per impression)
create table if not exists public.listing_views (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  listing_id bigint not null references public.listings(id) on delete cascade,
  viewer_phone text
);

create index if not exists listing_views_listing_id_idx on public.listing_views(listing_id);
create index if not exists listing_views_created_at_idx on public.listing_views(created_at);

-- RLS is off for this hackathon; if you later enable it, add anon insert + select policies here.
