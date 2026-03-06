-- Marketplace Profiles: extends organizations with marketplace-specific data
-- Each org can have one marketplace profile to participate in the delivery marketplace

create table if not exists marketplace_profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  organization_id uuid not null references organizations(id) on delete cascade unique,
  marketplace_role text not null check (marketplace_role in ('buyer', 'seller', 'both')),
  business_type text not null check (business_type in ('company', 'sole_proprietor')),
  company_name text not null,
  tax_id text,
  vat_id text,
  street_address text not null,
  postal_code text not null,
  city text not null,
  country text not null default 'DE',
  contact_email text not null,
  contact_phone text,
  stripe_connect_account_id text,
  stripe_connect_onboarded boolean not null default false,
  dsa_verified boolean not null default false,
  dsa_verified_at timestamp with time zone,
  is_active boolean not null default true
);

create index idx_marketplace_profiles_org_id on marketplace_profiles(organization_id);
create index idx_marketplace_profiles_role on marketplace_profiles(marketplace_role);
create index idx_marketplace_profiles_stripe on marketplace_profiles(stripe_connect_account_id);

alter table marketplace_profiles enable row level security;

-- Verified active profiles visible to all authenticated users
create policy "Authenticated users can view active marketplace profiles"
on marketplace_profiles for select
to authenticated
using (
  is_active = true
  or
  exists (
    select 1 from memberships
    where memberships.organization_id = marketplace_profiles.organization_id
    and memberships.user_id = auth.uid()
  )
);

-- Only owner/admin of the org can create a profile
create policy "Org owners/admins can create marketplace profile"
on marketplace_profiles for insert
to authenticated
with check (
  exists (
    select 1 from memberships
    where memberships.organization_id = marketplace_profiles.organization_id
    and memberships.user_id = auth.uid()
    and memberships.role in ('owner', 'admin')
  )
);

-- Only owner/admin of the org can update their profile
create policy "Org owners/admins can update marketplace profile"
on marketplace_profiles for update
to authenticated
using (
  exists (
    select 1 from memberships
    where memberships.organization_id = marketplace_profiles.organization_id
    and memberships.user_id = auth.uid()
    and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1 from memberships
    where memberships.organization_id = marketplace_profiles.organization_id
    and memberships.user_id = auth.uid()
    and memberships.role in ('owner', 'admin')
  )
);

-- Helper function to get marketplace profile for an org
create or replace function get_marketplace_profile(p_org_id uuid)
returns marketplace_profiles
language plpgsql
security definer
as $$
declare
  profile marketplace_profiles;
begin
  select * into profile
  from marketplace_profiles
  where organization_id = p_org_id;

  return profile;
end;
$$;

-- Auto-update updated_at timestamp
create or replace function update_marketplace_profile_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger marketplace_profile_updated
  before update on marketplace_profiles
  for each row execute procedure update_marketplace_profile_timestamp();
