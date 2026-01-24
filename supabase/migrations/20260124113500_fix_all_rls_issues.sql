-- Drop the broken view that causes permission denied errors
drop view if exists "public"."organization_members";

-- Fix RLS Infinite Recursion on memberships table
-- 1. Create a security definer function to safely check membership
create or replace function public.auth_is_member_of_org(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from memberships
    where organization_id = org_id
    and user_id = auth.uid()
  );
$$;

-- 2. Update the policy to use this function
drop policy if exists "Members can view organization memberships" on "public"."memberships";
drop policy if exists "Members can view org memberships via function" on "public"."memberships"; -- drop previous attempt if exists

create policy "Members can view organization memberships"
on "public"."memberships"
for select
to authenticated
using (
  auth.uid() = user_id -- Users can view their own
  or
  public.auth_is_member_of_org(organization_id) -- OR if they are a member of the org
);

-- Fix Permission Denied on auth.users access for Members Page
-- Create a secure RPC function to get members with emails
create or replace function public.get_organization_members(org_id uuid)
returns table (
  id uuid,
  user_id uuid,
  organization_id uuid,
  role text,
  created_at timestamptz,
  email varchar
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Check if the requesting user is a member of the organization
  if not public.auth_is_member_of_org(org_id) then
    raise exception 'Access denied';
  end if;

  return query
  select
    m.id,
    m.user_id,
    m.organization_id,
    m.role,
    m.created_at,
    u.email::varchar
  from
    public.memberships m
  join
    auth.users u on m.user_id = u.id
  where
    m.organization_id = org_id
  order by
    m.created_at asc;
end;
$$;
