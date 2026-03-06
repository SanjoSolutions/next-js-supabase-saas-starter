-- Order Matches: proposed matches between a request and an offer listing

create table if not exists order_matches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  request_listing_id uuid not null references service_listings(id) on delete cascade,
  offer_listing_id uuid not null references service_listings(id) on delete cascade,
  agreed_price_cents integer not null check (agreed_price_cents > 0),
  status text not null default 'proposed' check (
    status in ('proposed', 'buyer_confirmed', 'seller_confirmed', 'confirmed', 'rejected')
  ),
  buyer_confirmed_at timestamp with time zone,
  seller_confirmed_at timestamp with time zone,
  rejected_at timestamp with time zone,
  rejected_by_org_id uuid references organizations(id),
  unique(request_listing_id, offer_listing_id)
);

create index idx_order_matches_request on order_matches(request_listing_id);
create index idx_order_matches_offer on order_matches(offer_listing_id);
create index idx_order_matches_status on order_matches(status);

alter table order_matches enable row level security;

-- Visible to parties whose listings are in the match
create policy "Match parties can view matches"
on order_matches for select
to authenticated
using (
  auth_org_owns_listing(request_listing_id)
  or
  auth_org_owns_listing(offer_listing_id)
);

-- Update: only match parties can update
create policy "Match parties can update matches"
on order_matches for update
to authenticated
using (
  auth_org_owns_listing(request_listing_id)
  or
  auth_org_owns_listing(offer_listing_id)
)
with check (
  auth_org_owns_listing(request_listing_id)
  or
  auth_org_owns_listing(offer_listing_id)
);

-- Insert: system only (via security definer functions or admin client)
-- No direct insert policy for users — matches created by matching engine

-- Core matching query: find compatible counterpart listings
create or replace function find_matching_listings(p_listing_id uuid)
returns table (
  match_listing_id uuid,
  match_org_id uuid,
  match_org_name text,
  match_price_cents integer,
  price_gap integer,
  agreed_price integer
)
language plpgsql
security definer
as $$
declare
  v_listing service_listings;
begin
  select * into v_listing from service_listings where id = p_listing_id;

  if v_listing is null then
    raise exception 'Listing not found';
  end if;

  return query
  select
    sl.id as match_listing_id,
    sl.organization_id as match_org_id,
    o.name as match_org_name,
    sl.price_cents as match_price_cents,
    abs(v_listing.price_cents - sl.price_cents) as price_gap,
    ((v_listing.price_cents + sl.price_cents) / 2)::integer as agreed_price
  from service_listings sl
  join organizations o on o.id = sl.organization_id
  where sl.status = 'open'
    -- Opposite type
    and sl.listing_type != v_listing.listing_type
    -- Same pickup postal code
    and sl.pickup_postal_code = v_listing.pickup_postal_code
    -- Same delivery postal code
    and sl.delivery_postal_code = v_listing.delivery_postal_code
    -- Same package size
    and sl.package_size = v_listing.package_size
    -- Same delivery date
    and sl.delivery_date = v_listing.delivery_date
    -- Price compatibility: request price >= offer price
    and (
      (v_listing.listing_type = 'request' and v_listing.price_cents >= sl.price_cents)
      or
      (v_listing.listing_type = 'offer' and sl.price_cents >= v_listing.price_cents)
    )
    -- Not already matched together
    and not exists (
      select 1 from order_matches om
      where (om.request_listing_id = v_listing.id and om.offer_listing_id = sl.id)
        or (om.request_listing_id = sl.id and om.offer_listing_id = v_listing.id)
    )
    -- Not expired
    and sl.expires_at > now()
    -- Not same organization
    and sl.organization_id != v_listing.organization_id
  order by abs(v_listing.price_cents - sl.price_cents) asc;
end;
$$;

-- Confirmation state machine
create or replace function confirm_match(p_match_id uuid, p_confirming_org_id uuid)
returns order_matches
language plpgsql
security definer
as $$
declare
  v_match order_matches;
  v_request_org_id uuid;
  v_offer_org_id uuid;
  v_is_buyer boolean;
  v_is_seller boolean;
begin
  select * into v_match from order_matches where id = p_match_id;

  if v_match is null then
    raise exception 'Match not found';
  end if;

  if v_match.status in ('confirmed', 'rejected') then
    raise exception 'Match already finalized';
  end if;

  -- Determine which org is buyer (request) and which is seller (offer)
  select organization_id into v_request_org_id
  from service_listings where id = v_match.request_listing_id;

  select organization_id into v_offer_org_id
  from service_listings where id = v_match.offer_listing_id;

  v_is_buyer := (p_confirming_org_id = v_request_org_id);
  v_is_seller := (p_confirming_org_id = v_offer_org_id);

  if not v_is_buyer and not v_is_seller then
    raise exception 'Organization is not a party in this match';
  end if;

  -- Apply state transition
  if v_is_buyer then
    if v_match.status = 'seller_confirmed' then
      -- Both confirmed → confirmed
      update order_matches
      set status = 'confirmed',
          buyer_confirmed_at = now(),
          updated_at = now()
      where id = p_match_id
      returning * into v_match;

      -- Update both listings to matched
      update service_listings set status = 'matched', updated_at = now()
      where id in (v_match.request_listing_id, v_match.offer_listing_id);
    else
      update order_matches
      set status = 'buyer_confirmed',
          buyer_confirmed_at = now(),
          updated_at = now()
      where id = p_match_id
      returning * into v_match;
    end if;
  elsif v_is_seller then
    if v_match.status = 'buyer_confirmed' then
      -- Both confirmed → confirmed
      update order_matches
      set status = 'confirmed',
          seller_confirmed_at = now(),
          updated_at = now()
      where id = p_match_id
      returning * into v_match;

      -- Update both listings to matched
      update service_listings set status = 'matched', updated_at = now()
      where id in (v_match.request_listing_id, v_match.offer_listing_id);
    else
      update order_matches
      set status = 'seller_confirmed',
          seller_confirmed_at = now(),
          updated_at = now()
      where id = p_match_id
      returning * into v_match;
    end if;
  end if;

  return v_match;
end;
$$;
