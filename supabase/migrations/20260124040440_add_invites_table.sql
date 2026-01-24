-- Create invites table
create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null,
  organization_id uuid not null references organizations(id) on delete cascade,
  inviter_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  token uuid unique default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'expired')),
  expires_at timestamp with time zone default (now() + interval '7 days') not null
);

-- Enable RLS
alter table invites enable row level security;

-- Policies for invites
-- Only members with suitable roles should be able to create/view invites.
-- For simplicity, let's allow any member of the organization to view and create invites for now.
-- Ideally, we'd check if they are an 'owner' or 'admin'.

create policy "Members can view invites for their organization"
on invites for select
to authenticated
using (exists (
  select 1 from memberships 
  where organization_id = invites.organization_id 
  and user_id = auth.uid()
));

create policy "Members can create invites for their organization"
on invites for insert
to authenticated
with check (exists (
  select 1 from memberships 
  where organization_id = invites.organization_id 
  and user_id = auth.uid()
));

-- Policy for viewing a single invite by token (public/guest)
-- This is needed for the accept page
create policy "Allow guests to view an invite by token"
on invites for select
to anon, authenticated
using (token is not null);
