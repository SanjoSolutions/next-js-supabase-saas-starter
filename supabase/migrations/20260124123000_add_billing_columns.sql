alter table "organizations" 
add column if not exists "stripe_customer_id" text,
add column if not exists "stripe_subscription_id" text,
add column if not exists "plan" text default 'free',
add column if not exists "subscription_status" text;

-- Add index for customer lookup
create index if not exists "organizations_stripe_customer_id_idx" on "organizations" ("stripe_customer_id");
