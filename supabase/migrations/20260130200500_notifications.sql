-- Create notifications table
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  type text not null,
  title text not null,
  content text not null,
  link text,
  is_read boolean not null default false
);

-- Enable RLS
alter table notifications enable row level security;

-- Policies
create policy "Users can view their own notifications"
on notifications for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update their own notifications"
on notifications for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Function to notify on member joined
create or replace function public.notify_member_joined()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  member_email text;
  org_name text;
begin
  -- Get the joining member's email
  select email into member_email from auth.users where id = new.user_id;
  -- Get the organization name
  select name into org_name from organizations where id = new.organization_id;

  -- Notify all other members of the organization
  insert into notifications (user_id, organization_id, type, title, content, link)
  select user_id, new.organization_id, 'member_joined', 'New member joined', 
         member_email || ' has joined ' || org_name,
         '/organizations/' || new.organization_id || '/members'
  from memberships
  where organization_id = new.organization_id
  and user_id != new.user_id;

  return new;
end;
$$;

-- Trigger for member joined
create trigger on_member_joined
  after insert on memberships
  for each row execute procedure public.notify_member_joined();

-- Function to notify when invited (if user exists)
create or replace function public.notify_on_invite()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_user_id uuid;
  org_name text;
begin
  -- Check if a user with this email already exists
  select id into target_user_id from auth.users where email = new.email;
  -- Get the organization name
  select name into org_name from organizations where id = new.organization_id;

  if target_user_id is not null then
    insert into notifications (user_id, organization_id, type, title, content, link)
    values (target_user_id, new.organization_id, 'org_invite', 'You were invited', 
            'You have been invited to join ' || org_name,
            '/invites/' || new.token);
  end if;

  return new;
end;
$$;

-- Trigger for invite created
create trigger on_invite_created
  after insert on invites
  for each row execute procedure public.notify_on_invite();
