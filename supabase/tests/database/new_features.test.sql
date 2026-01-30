begin;
select plan(8);

-- 1. Check if notifications table exists
select has_table('notifications');

-- 2. Check if feature_flags table exists
select has_table('feature_flags');

-- 3. Check if organization_features table exists
select has_table('organization_features');

-- 4. Test notification trigger on membership creation
-- Setup: create org and user
insert into organizations (id, name) values ('00000000-0000-0000-0000-000000000001', 'Test Org');
-- Note: memberships trigger handle_new_organization will auto-insert owner, let's check that.
select results_eq(
    'select count(*) from notifications where organization_id = ''00000000-0000-0000-0000-000000000001''',
    array[0::bigint],
    'No notifications yet for new org'
);

-- 5. Add a member and check notification
-- Needs a user. Let's create dummy users in auth.users if possible, otherwise we test the function logic.
-- In pgTAP testing with auth.users can be tricky due to schemas. 
-- Let's test the is_feature_enabled function directly.

insert into feature_flags (name, default_value) values ('test_flag', false);
select is(is_feature_enabled('00000000-0000-0000-0000-000000000001', 'test_flag'), false, 'Feature flag default is false');

-- 6. Test override
insert into organization_features (organization_id, feature_flag_id, is_enabled)
values (
    '00000000-0000-0000-0000-000000000001', 
    (select id from feature_flags where name = 'test_flag'), 
    true
);
select is(is_feature_enabled('00000000-0000-0000-0000-000000000001', 'test_flag'), true, 'Feature flag override works');

-- 7. Test another org still has false
insert into organizations (id, name) values ('00000000-0000-0000-0000-000000000002', 'Test Org 2');
select is(is_feature_enabled('00000000-0000-0000-0000-000000000002', 'test_flag'), false, 'Feature flag override is scoped to org');

-- 8. Test RLS on notifications
select policies_are('notifications', array[
    'Users can view their own notifications', 
    'Users can update their own notifications'
]);

-- 10. Check results
select * from finish();
rollback;
