-- Run in Supabase SQL editor.
-- Adds a contracts table for the Contract Farming Marketplace.
-- A business posts an open contract; a farmer accepts it and grows the crop.
-- Buyer funds inputs upfront (recorded, not enforced); on harvest, buyer marks completed.

create table if not exists public.contracts (
  id bigserial primary key,
  created_at timestamptz not null default now(),

  -- Buyer / business who posted the contract
  buyer_business_name text not null,
  buyer_name text not null,
  buyer_phone text not null,

  -- Crop details
  produce_name text not null,
  quantity_kg numeric not null,
  price_per_kg numeric not null,
  funding_amount numeric not null,
  deadline date not null,
  location text,
  notes text,

  -- Lifecycle
  status text not null default 'open'
    check (status in ('open','accepted','harvested','completed','cancelled')),

  -- Farmer who accepted (null while status = open)
  farmer_name text,
  farmer_phone text,
  accepted_at timestamptz,
  harvested_at timestamptz,
  completed_at timestamptz
);

create index if not exists contracts_status_idx on public.contracts(status);
create index if not exists contracts_buyer_phone_idx on public.contracts(buyer_phone);
create index if not exists contracts_farmer_phone_idx on public.contracts(farmer_phone);

-- RLS is off for this hackathon; if you later enable it, add anon insert/select/update policies.
