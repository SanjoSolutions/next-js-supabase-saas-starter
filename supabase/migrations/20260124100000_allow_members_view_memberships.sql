-- Allow members of an organization to view other memberships in the same organization
-- This permits UI pages (members list) to select membership rows for org members
create policy "Members can view organization memberships" on memberships for
select
  to authenticated using (
    exists (
      select
        1
      from
        memberships as m
      where
        m.organization_id = memberships.organization_id
        and m.user_id = auth.uid ()
    )
  );

-- (Optional) Keep existing "Users can view their own memberships" policy as a fallback.
