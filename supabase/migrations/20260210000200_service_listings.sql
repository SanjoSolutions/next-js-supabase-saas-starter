-- Service Listings: the order book for delivery requests (bids) and offers (asks)

create table if not exists service_listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  organization_id uuid not null references organizations(id) on delete cascade,
  listing_type text not null check (listing_type in ('request', 'offer')),
  status text not null default 'open' check (status in ('open', 'matched', 'expired', 'cancelled')),
  title text not null,
  description text,
  -- Pickup location
  pickup_street text not null,
  pickup_postal_code text not null,
  pickup_city text not null,
  pickup_country text not null default 'DE',
  -- Delivery location
  delivery_street text not null,
  delivery_postal_code text not null,
  delivery_city text not null,
  delivery_country text not null default 'DE',
  -- Package details
  package_size text not null check (package_size in ('small', 'medium', 'large', 'pallet')),
  package_weight_kg numeric(8,2),
  package_description text,
  -- Pricing in EUR cents
  price_cents integer not null check (price_cents > 0),
  -- Scheduling
  delivery_date date not null,
  delivery_time_start time,
  delivery_time_end time,
  expires_at timestamp with time zone not null
);

create index idx_service_listings_org_id on service_listings(organization_id);
create index idx_service_listings_type on service_listings(listing_type);
create index idx_service_listings_status on service_listings(status);
create index idx_service_listings_pickup_postal on service_listings(pickup_postal_code);
create index idx_service_listings_delivery_postal on service_listings(delivery_postal_code);
create index idx_service_listings_delivery_date on service_listings(delivery_date);
create index idx_service_listings_expires_at on service_listings(expires_at);
create index idx_service_listings_price on service_listings(price_cents);

alter table service_listings enable row level security;

-- Open listings visible to all authenticated users
create policy "Authenticated users can view open listings"
on service_listings for select
to authenticated
using (
  status = 'open'
  or
  exists (
    select 1 from memberships
    where memberships.organization_id = service_listings.organization_id
    and memberships.user_id = auth.uid()
  )
);

-- Insert: user must be member of the org and org must have a marketplace profile
create policy "Org members with marketplace profile can create listings"
on service_listings for insert
to authenticated
with check (
  exists (
    select 1 from memberships
    where memberships.organization_id = service_listings.organization_id
    and memberships.user_id = auth.uid()
  )
  and
  exists (
    select 1 from marketplace_profiles
    where marketplace_profiles.organization_id = service_listings.organization_id
    and marketplace_profiles.is_active = true
  )
);

-- Update: only org members can update their own listings
create policy "Org members can update own listings"
on service_listings for update
to authenticated
using (
  exists (
    select 1 from memberships
    where memberships.organization_id = service_listings.organization_id
    and memberships.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from memberships
    where memberships.organization_id = service_listings.organization_id
    and memberships.user_id = auth.uid()
  )
);

-- Auto-update timestamp
create trigger service_listing_updated
  before update on service_listings
  for each row execute procedure update_marketplace_profile_timestamp();

-- Helper: check if current user's org owns a listing
create or replace function auth_org_owns_listing(p_listing_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from service_listings sl
    join memberships m on m.organization_id = sl.organization_id
    where sl.id = p_listing_id
    and m.user_id = auth.uid()
  );
end;
$$;

-- Expire old listings
create or replace function expire_old_listings()
returns integer
language plpgsql
security definer
as $$
declare
  expired_count integer;
begin
  update service_listings
  set status = 'expired', updated_at = timezone('utc'::text, now())
  where status = 'open'
  and expires_at < now();

  get diagnostics expired_count = row_count;
  return expired_count;
end;
$$;
