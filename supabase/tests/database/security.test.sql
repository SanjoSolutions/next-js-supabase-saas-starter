begin;
-- We'll run 8 core security tests
select plan(8);

-- 1. Verify RLS is enabled on all tables (Using pg_tables for portability)
select ok(
    (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'organizations'),
    'Organizations table should have RLS enabled'
);
select ok(
    (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'memberships'),
    'Memberships table should have RLS enabled'
);
select ok(
    (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'invites'),
    'Invites table should have RLS enabled'
);

-- 2. Verify Anonymous users cannot list data
set local role anon;
set local "request.jwt.claims" to '{}';

select is(
    (select count(*)::int from public.organizations),
    0,
    'Anonymous user should see 0 organizations'
);

select is(
    (select count(*)::int from public.invites),
    0,
    'Anonymous user should see 0 invites'
);

-- 3. Verify Authenticated users can only see their data
-- Mock a user who is NOT a member of any org
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "00000000-0000-0000-0000-000000000000"}';

select is(
    (select count(*)::int from public.organizations),
    0,
    'Unrelated authenticated user should see 0 organizations'
);

-- 4. Verify the secure function exists and is accessible
set local role anon;
select has_function('public', 'get_invite_details', array['uuid'], 'Secure invitation function should exist');

-- 5. Final schema security check: No "using (true)" for public roles
set local role postgres;
select is(
    count(*)::integer,
    0::integer,
    'There should be no "using (true)" policies for public/anon roles'
)
from pg_policies
where schemaname = 'public'
and (roles::text[] && array['public', 'anon'])
and (qual = '(true)' or qual is null);

select * from finish();
rollback;
