-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Create a default test user
-- Email: test@example.com
-- Password: password123

DO $$
DECLARE
  user_id UUID := 'd7395460-1555-46aa-9d5f-22a48858f969';
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    user_id,
    '00000000-0000-0000-0000-000000000000',
    'test@example.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Existing User"}',
    now(),
    now(),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    user_id,
    user_id,
    format('{"sub":"%s","email":"%s"}', user_id, 'test@example.com')::jsonb,
    'email',
    user_id,
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;
END $$;
