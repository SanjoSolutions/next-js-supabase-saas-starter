-- Create memberships table
create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  role text not null default 'member',
  unique(user_id, organization_id)
);

-- Enable RLS
alter table memberships enable row level security;

-- Policies for memberships
create policy "Users can view their own memberships"
on memberships for select
to authenticated
using (auth.uid() = user_id);

-- Function to handle auto-membership on organization creation
-- Note: auth.uid() will be the user who performed the insert
create or replace function public.handle_new_organization()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null then
    insert into public.memberships (user_id, organization_id, role)
    values (auth.uid(), new.id, 'owner');
  end if;
  return new;
end;
$$;

-- Trigger to call the function after organization creation
create trigger on_organization_created
  after insert on organizations
  for each row execute procedure public.handle_new_organization();

-- Update organizations select policy to be membership-based OR creator-based
drop policy if exists "Allow authenticated users to view organizations" on organizations;
drop policy if exists "Users can view organizations they are members of" on organizations;
create policy "Users can view organizations they are members of or created"
on organizations for select
to authenticated
using (
  created_by = auth.uid() 
  or 
  exists (
    select 1 from memberships 
    where organization_id = organizations.id 
    and user_id = auth.uid()
  )
);
