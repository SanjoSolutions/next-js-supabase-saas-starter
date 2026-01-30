-- Add secure function for accepting invites
-- This bypasses RLS to allow a user to accept an invite that they can't normally see

-- Drop if exists to allow recreation
drop function if exists public.accept_invite(uuid);

create function public.accept_invite(invite_token uuid)
returns table (
  org_id uuid,
  org_role text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite_id uuid;
  v_organization_id uuid;
  v_role text;
begin
  -- Fetch the invite
  select i.id, i.organization_id, i.role
  into v_invite_id, v_organization_id, v_role
  from invites i
  where i.token = invite_token
  and i.status = 'pending';
  
  if v_invite_id is null then
    raise exception 'Invite not found or expired';
  end if;
  
  -- Create membership (ignore if already exists)
  insert into memberships (user_id, organization_id, role)
  values (auth.uid(), v_organization_id, v_role)
  on conflict (user_id, organization_id) do nothing;
  
  -- Update invite status
  update invites set status = 'accepted' where id = v_invite_id;
  
  -- Return the result
  org_id := v_organization_id;
  org_role := v_role;
  return next;
end;
$$;

grant execute on function public.accept_invite(uuid) to authenticated;
