-- DAC7 Seller Data: annual seller income aggregation for tax reporting
-- Admin-only table — no RLS for normal users

create table if not exists dac7_seller_data (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  seller_org_id uuid not null references organizations(id) on delete cascade,
  reporting_year integer not null,
  total_transactions integer not null default 0,
  total_gross_cents bigint not null default 0,
  total_fees_cents bigint not null default 0,
  total_net_cents bigint not null default 0,
  unique(seller_org_id, reporting_year)
);

create index idx_dac7_seller_org on dac7_seller_data(seller_org_id);
create index idx_dac7_year on dac7_seller_data(reporting_year);

alter table dac7_seller_data enable row level security;
-- No user-facing RLS policies — admin client only

-- Content Reports: DSA notice-and-action mechanism
create table if not exists content_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid references service_listings(id) on delete set null,
  report_type text not null check (report_type in ('illegal_content', 'fraud', 'misleading', 'other')),
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'action_taken', 'dismissed')),
  resolution_notes text,
  resolved_at timestamp with time zone
);

create index idx_content_reports_reporter on content_reports(reporter_user_id);
create index idx_content_reports_listing on content_reports(listing_id);
create index idx_content_reports_status on content_reports(status);

alter table content_reports enable row level security;

-- Creator can view own reports
create policy "Users can view own content reports"
on content_reports for select
to authenticated
using (reporter_user_id = auth.uid());

-- Any authenticated user can create a report
create policy "Authenticated users can create content reports"
on content_reports for insert
to authenticated
with check (reporter_user_id = auth.uid());

-- P2B Complaints: business user complaints about platform decisions
create table if not exists p2b_complaints (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  organization_id uuid not null references organizations(id) on delete cascade,
  complainant_user_id uuid not null references auth.users(id) on delete cascade,
  complaint_type text not null check (
    complaint_type in ('listing_removed', 'account_restricted', 'ranking', 'other')
  ),
  subject text not null,
  description text not null,
  status text not null default 'received' check (status in ('received', 'under_review', 'resolved', 'dismissed')),
  resolution_notes text,
  resolved_at timestamp with time zone
);

create index idx_p2b_org on p2b_complaints(organization_id);
create index idx_p2b_status on p2b_complaints(status);

alter table p2b_complaints enable row level security;

-- Org members can view their own complaints
create policy "Org members can view own P2B complaints"
on p2b_complaints for select
to authenticated
using (
  exists (
    select 1 from memberships
    where memberships.organization_id = p2b_complaints.organization_id
    and memberships.user_id = auth.uid()
  )
);

-- Org members can create complaints
create policy "Org members can create P2B complaints"
on p2b_complaints for insert
to authenticated
with check (
  complainant_user_id = auth.uid()
  and
  exists (
    select 1 from memberships
    where memberships.organization_id = p2b_complaints.organization_id
    and memberships.user_id = auth.uid()
  )
);

-- Auto-update timestamps
create trigger p2b_complaint_updated
  before update on p2b_complaints
  for each row execute procedure update_marketplace_profile_timestamp();
