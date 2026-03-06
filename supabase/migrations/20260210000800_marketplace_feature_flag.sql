-- Add marketplace_access feature flag (default: false)

insert into feature_flags (name, description, default_value)
values ('marketplace_access', 'Access to the B2B delivery marketplace', false)
on conflict (name) do nothing;
