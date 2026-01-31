-- Activity Logs table for tracking organization events
-- Gated behind advanced_analytics feature flag (Pro plan)

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  organization_id uuid not null references organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  activity_type text not null,
  title text not null,
  description text,
  metadata jsonb default '{}'::jsonb
);

-- Create indexes for efficient querying
create index idx_activity_logs_org_id on activity_logs(organization_id);
create index idx_activity_logs_created_at on activity_logs(created_at desc);
create index idx_activity_logs_type on activity_logs(activity_type);

-- Enable RLS
alter table activity_logs enable row level security;

-- Policy: Members can view activity logs for organizations they belong to
create policy "Members can view organization activity logs"
on activity_logs for select
to authenticated
using (
  exists (
    select 1 from memberships
    where memberships.organization_id = activity_logs.organization_id
    and memberships.user_id = auth.uid()
  )
);

-- Function to log member joined activity
create or replace function public.log_member_joined()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  member_email text;
begin
  select email into member_email from auth.users where id = new.user_id;

  insert into activity_logs (organization_id, actor_id, actor_email, activity_type, title, description, metadata)
  values (
    new.organization_id,
    new.user_id,
    member_email,
    'member_joined',
    'Member joined',
    member_email || ' joined the organization',
    jsonb_build_object('role', new.role, 'membership_id', new.id)
  );

  return new;
end;
$$;

-- Trigger for member joined
create trigger on_member_joined_log_activity
  after insert on memberships
  for each row execute procedure public.log_member_joined();

-- Function to log invite created activity
create or replace function public.log_invite_created()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  inviter_email text;
begin
  select email into inviter_email from auth.users where id = new.inviter_id;

  insert into activity_logs (organization_id, actor_id, actor_email, activity_type, title, description, metadata)
  values (
    new.organization_id,
    new.inviter_id,
    inviter_email,
    'member_invited',
    'Invitation sent',
    inviter_email || ' invited ' || new.email,
    jsonb_build_object('invited_email', new.email, 'invite_id', new.id)
  );

  return new;
end;
$$;

-- Trigger for invite created
create trigger on_invite_created_log_activity
  after insert on invites
  for each row execute procedure public.log_invite_created();

-- Function to log role changes
create or replace function public.log_role_changed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  member_email text;
begin
  if old.role is distinct from new.role then
    select email into member_email from auth.users where id = new.user_id;

    insert into activity_logs (organization_id, actor_id, actor_email, activity_type, title, description, metadata)
    values (
      new.organization_id,
      new.user_id,
      member_email,
      'role_changed',
      'Role updated',
      member_email || '''s role changed from ' || old.role || ' to ' || new.role,
      jsonb_build_object('old_role', old.role, 'new_role', new.role, 'membership_id', new.id)
    );
  end if;

  return new;
end;
$$;

-- Trigger for role changed
create trigger on_role_changed_log_activity
  after update on memberships
  for each row execute procedure public.log_role_changed();

-- Function to log billing activity (for subscription/plan changes)
create or replace function public.log_billing_activity()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Log when plan changes
  if old.plan is distinct from new.plan then
    insert into activity_logs (organization_id, actor_id, actor_email, activity_type, title, description, metadata)
    values (
      new.id,
      null,
      'System',
      case
        when new.plan = 'pro' then 'subscription_created'
        when new.plan = 'free' and old.plan = 'pro' then 'subscription_canceled'
        else 'subscription_updated'
      end,
      case
        when new.plan = 'pro' then 'Upgraded to Pro'
        when new.plan = 'free' and old.plan = 'pro' then 'Subscription canceled'
        else 'Plan updated'
      end,
      'Plan changed from ' || coalesce(old.plan, 'none') || ' to ' || new.plan,
      jsonb_build_object('old_plan', old.plan, 'new_plan', new.plan, 'status', new.subscription_status)
    );
  end if;

  return new;
end;
$$;

-- Trigger for billing activity
create trigger on_billing_activity_log
  after update on organizations
  for each row execute procedure public.log_billing_activity();

-- Function to get paginated activity logs
create or replace function get_activity_logs(
  org_id uuid,
  page_size int default 20,
  page_offset int default 0
)
returns table (
  id uuid,
  created_at timestamptz,
  actor_email text,
  activity_type text,
  title text,
  description text,
  metadata jsonb
)
language plpgsql
security definer
as $$
begin
  -- Verify the calling user is a member of the organization
  if not exists (
    select 1 from memberships
    where organization_id = org_id
    and user_id = auth.uid()
  ) then
    raise exception 'Not authorized to view activity logs for this organization';
  end if;

  return query
  select
    a.id,
    a.created_at,
    a.actor_email,
    a.activity_type,
    a.title,
    a.description,
    a.metadata
  from activity_logs a
  where a.organization_id = org_id
  order by a.created_at desc
  limit page_size
  offset page_offset;
end;
$$;

-- Function to get total count for pagination
create or replace function get_activity_logs_count(org_id uuid)
returns bigint
language plpgsql
security definer
as $$
begin
  -- Verify the calling user is a member of the organization
  if not exists (
    select 1 from memberships
    where organization_id = org_id
    and user_id = auth.uid()
  ) then
    raise exception 'Not authorized to view activity logs for this organization';
  end if;

  return (select count(*) from activity_logs where organization_id = org_id);
end;
$$;
