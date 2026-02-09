-- Disputes: filed on contracts by either party

create table if not exists disputes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  contract_id uuid not null references contracts(id) on delete restrict,
  initiator_org_id uuid not null references organizations(id) on delete restrict,
  reason text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'under_review', 'resolved', 'dismissed')),
  resolution_notes text,
  resolved_at timestamp with time zone
);

create index idx_disputes_contract on disputes(contract_id);
create index idx_disputes_initiator on disputes(initiator_org_id);
create index idx_disputes_status on disputes(status);

alter table disputes enable row level security;

-- Visible to contract parties
create policy "Contract parties can view disputes"
on disputes for select
to authenticated
using (
  exists (
    select 1 from contracts c
    join memberships m on m.organization_id in (c.buyer_org_id, c.seller_org_id)
    where c.id = disputes.contract_id
    and m.user_id = auth.uid()
  )
);

-- Initiator org members can create disputes
create policy "Contract parties can create disputes"
on disputes for insert
to authenticated
with check (
  exists (
    select 1 from memberships
    where memberships.organization_id = disputes.initiator_org_id
    and memberships.user_id = auth.uid()
  )
  and
  exists (
    select 1 from contracts c
    where c.id = disputes.contract_id
    and (c.buyer_org_id = disputes.initiator_org_id or c.seller_org_id = disputes.initiator_org_id)
  )
);

-- Auto-update timestamp
create trigger dispute_updated
  before update on disputes
  for each row execute procedure update_marketplace_profile_timestamp();
