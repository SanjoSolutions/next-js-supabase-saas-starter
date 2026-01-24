-- Allow anon users to view organization names so they can see what they are invited to
create policy "Allow guests to view organizations"
on organizations for select
to anon
using (true);
