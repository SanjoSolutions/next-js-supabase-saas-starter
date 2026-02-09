-- Contracts: confirmed delivery jobs with full price breakdown and status tracking

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  match_id uuid not null references order_matches(id) on delete restrict unique,
  buyer_org_id uuid not null references organizations(id) on delete restrict,
  seller_org_id uuid not null references organizations(id) on delete restrict,
  -- Price breakdown in EUR cents
  net_price_cents integer not null check (net_price_cents > 0),
  vat_rate numeric(5,2) not null default 19.00,
  vat_cents integer not null check (vat_cents >= 0),
  gross_price_cents integer not null check (gross_price_cents > 0),
  platform_fee_cents integer not null check (platform_fee_cents >= 0),
  seller_payout_cents integer not null check (seller_payout_cents > 0),
  -- Invoice & tracking
  invoice_number text unique,
  tracking_code text unique,
  -- Status
  status text not null default 'pending_payment' check (
    status in (
      'pending_payment', 'paid', 'in_progress', 'pickup_confirmed',
      'delivered', 'completed', 'disputed', 'resolved', 'refunded', 'cancelled'
    )
  ),
  -- Stripe refs
  stripe_payment_intent_id text,
  stripe_transfer_id text,
  -- Timeline
  paid_at timestamp with time zone,
  started_at timestamp with time zone,
  pickup_at timestamp with time zone,
  delivered_at timestamp with time zone,
  completed_at timestamp with time zone,
  cancelled_at timestamp with time zone
);

create index idx_contracts_match_id on contracts(match_id);
create index idx_contracts_buyer_org on contracts(buyer_org_id);
create index idx_contracts_seller_org on contracts(seller_org_id);
create index idx_contracts_status on contracts(status);
create index idx_contracts_invoice on contracts(invoice_number);
create index idx_contracts_tracking on contracts(tracking_code);

alter table contracts enable row level security;

-- Visible to buyer or seller org members
create policy "Contract parties can view contracts"
on contracts for select
to authenticated
using (
  exists (
    select 1 from memberships
    where memberships.user_id = auth.uid()
    and memberships.organization_id in (contracts.buyer_org_id, contracts.seller_org_id)
  )
);

-- Update: only contract parties
create policy "Contract parties can update contracts"
on contracts for update
to authenticated
using (
  exists (
    select 1 from memberships
    where memberships.user_id = auth.uid()
    and memberships.organization_id in (contracts.buyer_org_id, contracts.seller_org_id)
  )
)
with check (
  exists (
    select 1 from memberships
    where memberships.user_id = auth.uid()
    and memberships.organization_id in (contracts.buyer_org_id, contracts.seller_org_id)
  )
);

-- Insert: system only (from confirmed match), but allow authenticated for server action use
create policy "Authenticated users can create contracts for their matches"
on contracts for insert
to authenticated
with check (
  exists (
    select 1 from memberships
    where memberships.user_id = auth.uid()
    and memberships.organization_id in (contracts.buyer_org_id, contracts.seller_org_id)
  )
);

-- Auto-generate invoice number: INV-YYYY-NNNNNN
create sequence if not exists invoice_number_seq;

create or replace function generate_invoice_number()
returns trigger
language plpgsql
security definer
as $$
begin
  new.invoice_number := 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 6, '0');
  return new;
end;
$$;

create trigger contract_generate_invoice
  before insert on contracts
  for each row execute procedure generate_invoice_number();

-- Auto-generate tracking code: DLV-XXXXXXXX
create or replace function generate_tracking_code()
returns trigger
language plpgsql
security definer
as $$
begin
  new.tracking_code := 'DLV-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
  return new;
end;
$$;

create trigger contract_generate_tracking
  before insert on contracts
  for each row execute procedure generate_tracking_code();

-- Auto-update timestamp
create trigger contract_updated
  before update on contracts
  for each row execute procedure update_marketplace_profile_timestamp();

-- Get paginated contracts for an org with counterparty name
create or replace function get_org_contracts(
  p_org_id uuid,
  p_page_size int default 20,
  p_page_offset int default 0
)
returns table (
  id uuid,
  created_at timestamptz,
  status text,
  invoice_number text,
  tracking_code text,
  gross_price_cents integer,
  net_price_cents integer,
  counterparty_name text,
  is_buyer boolean
)
language plpgsql
security definer
as $$
begin
  -- Verify membership
  if not exists (
    select 1 from memberships
    where organization_id = p_org_id
    and user_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  return query
  select
    c.id,
    c.created_at,
    c.status,
    c.invoice_number,
    c.tracking_code,
    c.gross_price_cents,
    c.net_price_cents,
    case
      when c.buyer_org_id = p_org_id then seller_o.name
      else buyer_o.name
    end as counterparty_name,
    (c.buyer_org_id = p_org_id) as is_buyer
  from contracts c
  join organizations buyer_o on buyer_o.id = c.buyer_org_id
  join organizations seller_o on seller_o.id = c.seller_org_id
  where c.buyer_org_id = p_org_id or c.seller_org_id = p_org_id
  order by c.created_at desc
  limit p_page_size
  offset p_page_offset;
end;
$$;
