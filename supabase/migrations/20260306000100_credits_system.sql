-- Credits system: per-organization usage-based credit balance and transaction audit trail

-- Credits table: one row per organization tracking current balance
create table if not exists credits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade unique,
  balance integer not null default 0 check (balance >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Credit transactions table: immutable audit trail of all balance changes
create table if not exists credit_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  amount integer not null,
  balance_after integer not null,
  type text not null check (type in ('purchase', 'usage', 'refund', 'bonus', 'adjustment')),
  description text,
  reference_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_credit_transactions_org_created
  on credit_transactions(organization_id, created_at desc);

-- Enable RLS
alter table credits enable row level security;
alter table credit_transactions enable row level security;

-- Policies: org members can view their own org's credits
create policy "Org members can view their credits"
on credits for select
to authenticated
using (
  exists (
    select 1 from memberships
    where memberships.organization_id = credits.organization_id
    and memberships.user_id = auth.uid()
  )
);

-- Policies: org members can view their own org's transactions
create policy "Org members can view their credit transactions"
on credit_transactions for select
to authenticated
using (
  exists (
    select 1 from memberships
    where memberships.organization_id = credit_transactions.organization_id
    and memberships.user_id = auth.uid()
  )
);

-- Atomic credit deduction function
-- Returns new balance, or -1 if insufficient credits
create or replace function deduct_credits(org_id uuid, amount integer, description text)
returns integer
language plpgsql
security definer
as $$
declare
  current_balance integer;
  new_balance integer;
begin
  -- Lock the credits row for this org to prevent concurrent modifications
  select balance into current_balance
  from credits
  where organization_id = org_id
  for update;

  if current_balance is null then
    return -1;
  end if;

  if current_balance < amount then
    return -1;
  end if;

  new_balance := current_balance - amount;

  update credits
  set balance = new_balance,
      updated_at = timezone('utc'::text, now())
  where organization_id = org_id;

  insert into credit_transactions (organization_id, amount, balance_after, type, description)
  values (org_id, -amount, new_balance, 'usage', description);

  return new_balance;
end;
$$;

-- Atomic credit addition function
-- Returns new balance
create or replace function add_credits(org_id uuid, amount integer, description text, ref_id text default null)
returns integer
language plpgsql
security definer
as $$
declare
  current_balance integer;
  new_balance integer;
  tx_type text;
begin
  -- Lock the credits row for this org to prevent concurrent modifications
  select balance into current_balance
  from credits
  where organization_id = org_id
  for update;

  -- If no credits row exists yet, create one
  if current_balance is null then
    insert into credits (organization_id, balance)
    values (org_id, 0);
    current_balance := 0;
  end if;

  new_balance := current_balance + amount;

  update credits
  set balance = new_balance,
      updated_at = timezone('utc'::text, now())
  where organization_id = org_id;

  -- Determine transaction type based on whether a reference_id is provided
  if ref_id is not null then
    tx_type := 'purchase';
  else
    tx_type := 'bonus';
  end if;

  insert into credit_transactions (organization_id, amount, balance_after, type, description, reference_id)
  values (org_id, amount, new_balance, tx_type, description, ref_id);

  return new_balance;
end;
$$;

-- Auto-update updated_at timestamp on credits
create or replace function update_credits_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger credits_updated
  before update on credits
  for each row execute procedure update_credits_timestamp();

-- Auto-create credits row when a new organization is created
create or replace function public.create_org_credits()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into credits (organization_id, balance)
  values (new.id, 0);
  return new;
end;
$$;

create trigger on_organization_created_credits
  after insert on organizations
  for each row execute procedure public.create_org_credits();

-- Seed credits rows for any existing organizations that don't have one yet
insert into credits (organization_id, balance)
select id, 0
from organizations
where id not in (select organization_id from credits);
