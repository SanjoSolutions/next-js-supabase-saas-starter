begin;
select plan(12);

-- 1. Verify activity_logs table exists
select has_table('activity_logs', 'activity_logs table should exist');

-- 2. Verify RLS is enabled
select ok(
    (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'activity_logs'),
    'activity_logs table should have RLS enabled'
);

-- 3. Verify indexes exist
select has_index('activity_logs', 'idx_activity_logs_org_id', 'Index on organization_id should exist');
select has_index('activity_logs', 'idx_activity_logs_created_at', 'Index on created_at should exist');
select has_index('activity_logs', 'idx_activity_logs_type', 'Index on activity_type should exist');

-- 4. Verify triggers exist
select trigger_is(
    'memberships',
    'on_member_joined_log_activity',
    'log_member_joined',
    'Member joined trigger should call log_member_joined function'
);
select trigger_is(
    'invites',
    'on_invite_created_log_activity',
    'log_invite_created',
    'Invite created trigger should call log_invite_created function'
);
select trigger_is(
    'memberships',
    'on_role_changed_log_activity',
    'log_role_changed',
    'Role changed trigger should call log_role_changed function'
);
select trigger_is(
    'organizations',
    'on_billing_activity_log',
    'log_billing_activity',
    'Billing activity trigger should call log_billing_activity function'
);

-- 5. Verify RPC functions exist
select has_function('public', 'get_activity_logs', array['uuid', 'int', 'int'], 'get_activity_logs function should exist');
select has_function('public', 'get_activity_logs_count', array['uuid'], 'get_activity_logs_count function should exist');

-- 6. Verify anonymous users cannot see activity logs
set local role anon;
set local "request.jwt.claims" to '{}';

select is(
    (select count(*)::int from public.activity_logs),
    0,
    'Anonymous user should see 0 activity logs'
);

select * from finish();
rollback;
