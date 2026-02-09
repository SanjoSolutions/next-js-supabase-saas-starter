-- Add marketplace_access feature flag (default: true)

insert into feature_flags (name, description, default_value)
values ('marketplace_access', 'Access to the B2B delivery marketplace', true)
on conflict (name) do nothing;
