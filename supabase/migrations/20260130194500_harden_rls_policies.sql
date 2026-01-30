-- Hardening Database Security
-- This migration tightens RLS policies to prevent data leakage.

-- 1. Organizations table hardening
drop policy if exists "Allow guests to view organizations" on organizations;
drop policy if exists "Users can view organizations they are members of or created" on organizations;
drop policy if exists "Allow authenticated users to view organizations" on organizations;

-- Authenticated users can only see organizations they are members of
create policy "Users can view organizations they are members of"
on organizations for select
to authenticated
using (
  exists (
    select 1 from memberships 
    where organization_id = organizations.id 
    and user_id = auth.uid()
  )
);

-- Creator can also see it (redundant if auto-member, but safe)
create policy "Creators can view their own organizations"
on organizations for select
to authenticated
using (created_by = auth.uid());

-- 2. Invites table hardening
drop policy if exists "Allow guests to view an invite by token" on invites;
drop policy if exists "Members can view invites for their organization" on invites;

-- Members can view invites for their organization
create policy "Members can view organization invites"
on invites for select
to authenticated
using (
  exists (
    select 1 from memberships 
    where organization_id = invites.organization_id 
    and user_id = auth.uid()
  )
);

-- Note: We removed the "anon" select policies to pass the security audit.
-- To support the "Accept Invite" page without leaking all data, we will use a secure function.

-- 3. Secure function for the Accept Invite page
create or replace function public.get_invite_details(invite_token uuid)
returns table (
  id uuid,
  email text,
  role text,
  organization_name text,
  inviter_name text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    i.id,
    i.email,
    i.role,
    o.name as organization_name,
    coalesce(u.raw_user_meta_data->>'first_name', u.email)::text as inviter_name
  from invites i
  join organizations o on i.organization_id = o.id
  left join auth.users u on i.inviter_id = u.id
  where i.token = invite_token
  and i.status = 'pending';
end;
$$;

grant execute on function public.get_invite_details(uuid) to anon, authenticated;
