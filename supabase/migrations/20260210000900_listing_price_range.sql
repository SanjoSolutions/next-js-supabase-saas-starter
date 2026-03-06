-- Add price range columns to service_listings

alter table service_listings
  add column price_min_cents integer,
  add column price_max_cents integer;

-- Backfill existing rows: use price_cents for both min and max
update service_listings
set price_min_cents = price_cents,
    price_max_cents = price_cents;

-- Now make them NOT NULL
alter table service_listings
  alter column price_min_cents set not null,
  alter column price_max_cents set not null;

-- Add constraints
alter table service_listings
  add constraint chk_price_min_positive check (price_min_cents > 0),
  add constraint chk_price_max_positive check (price_max_cents > 0),
  add constraint chk_price_range check (price_min_cents <= price_max_cents);

-- Index for range queries
create index idx_service_listings_price_min on service_listings(price_min_cents);
create index idx_service_listings_price_max on service_listings(price_max_cents);

-- Replace find_matching_listings to use overlapping price ranges
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
    -- Agreed price = midpoint of the overlapping range
    ((greatest(
        case when v_listing.listing_type = 'request' then sl.price_min_cents else v_listing.price_min_cents end,
        case when v_listing.listing_type = 'request' then v_listing.price_min_cents else sl.price_min_cents end
      ) + least(
        case when v_listing.listing_type = 'request' then sl.price_max_cents else v_listing.price_max_cents end,
        case when v_listing.listing_type = 'request' then v_listing.price_max_cents else sl.price_max_cents end
      )) / 2)::integer as agreed_price
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
    -- Price range overlap: request_max >= offer_min AND offer_max >= request_min
    and (
      (v_listing.listing_type = 'request'
        and v_listing.price_max_cents >= sl.price_min_cents
        and sl.price_max_cents >= v_listing.price_min_cents)
      or
      (v_listing.listing_type = 'offer'
        and sl.price_max_cents >= v_listing.price_min_cents
        and v_listing.price_max_cents >= sl.price_min_cents)
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
