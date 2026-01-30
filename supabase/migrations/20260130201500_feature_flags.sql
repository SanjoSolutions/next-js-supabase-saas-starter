-- Create feature_flags table
create table if not exists feature_flags (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text unique not null,
  description text,
  default_value boolean not null default false
);

-- Create organization_features table (overrides)
create table if not exists organization_features (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  feature_flag_id uuid not null references feature_flags(id) on delete cascade,
  is_enabled boolean not null,
  unique(organization_id, feature_flag_id)
);

-- Enable RLS
alter table feature_flags enable row level security;
alter table organization_features enable row level security;

-- Policies
create policy "Anyone can view feature flags"
on feature_flags for select
to authenticated
using (true);

create policy "Members can view their organization features"
on organization_features for select
to authenticated
using (exists (
  select 1 from memberships 
  where organization_id = organization_features.organization_id 
  and user_id = auth.uid()
));

-- Insert some default feature flags
insert into feature_flags (name, description, default_value) values
('beta_access', 'Access to beta features', false),
('advanced_analytics', 'Access to advanced analytics dashboard', false),
('unlimited_members', 'Allow unlimited organization members', true);

-- Function to check if feature is enabled for an organization
create or replace function is_feature_enabled(org_id uuid, feature_name text)
returns boolean
language plpgsql
security definer
as $$
declare
  is_enabled boolean;
  feat_id uuid;
  def_val boolean;
begin
  -- Get feature info
  select id, default_value into feat_id, def_val 
  from feature_flags 
  where name = feature_name;

  if feat_id is null then
    return false;
  end if;

  -- Check for override
  select organization_features.is_enabled into is_enabled
  from organization_features
  where organization_id = org_id and feature_flag_id = feat_id;

  if is_enabled is not null then
    return is_enabled;
  end if;

  return def_val;
end;
$$;
