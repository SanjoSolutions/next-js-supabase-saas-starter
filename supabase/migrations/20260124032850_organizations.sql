-- Create organizations table
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  created_by uuid references auth.users(id) default auth.uid()
);

-- Enable RLS
alter table organizations enable row level security;

-- Allow authenticated users to create organizations
create policy "Allow authenticated users to create organizations"
on organizations
for insert
to authenticated
with check (true);

-- Allow authenticated users to view all organizations
create policy "Allow authenticated users to view organizations"
on organizations
for select
to authenticated
using (true);
