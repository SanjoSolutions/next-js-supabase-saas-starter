# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Next.js dev server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm test         # Run Vitest unit tests
pnpm test:e2e     # Run Playwright E2E tests
```

Database commands (requires Supabase CLI):

```bash
supabase start    # Start local Supabase
supabase db push  # Apply migrations
```

## Architecture

This is a **Next.js + Supabase SaaS Starter** with multi-tenant organizations, Stripe billing, and role-based access.

### Key Patterns

**Authentication Flow:**

- `lib/auth.ts` exports `requireUser()` and `requireOrgMember(orgId)` for protecting pages
- Cookie-based auth via `@supabase/ssr` - use `createClient()` from `lib/supabase/server.ts` in Server Components/Actions
- `lib/supabase/admin.ts` bypasses RLS - only use in webhooks

**Multi-Tenancy:**

- All data scoped by `organization_id` with Row-Level Security (RLS)
- Users have memberships with roles: `owner`, `admin`, `member`
- Active org stored in cookie (`active_org_id`)

**Server Actions:**

- Located in `actions/` and page-level `actions.ts` files
- Use `"use server"` directive at file top

**Billing:**

- `actions/stripe.ts` has `createCheckoutSession()` and `createCustomerPortalSession()`
- Webhook at `app/api/webhooks/stripe/route.ts` updates org plan
- Organizations have `plan` (free/pro) and `subscription_status` fields

**Feature Flags:**

- `lib/feature-flags.ts` exports `isFeatureEnabled(name, orgId)`
- Gates Pro-only features like Activity Dashboard

### Route Structure

- `app/(authenticated)/` - Protected routes (requires login)
- `app/auth/` - Login, signup, password reset
- `app/api/webhooks/` - Stripe webhook handlers

### Database

Migrations in `supabase/migrations/`. Key tables:

- `organizations` - Org data, Stripe IDs, plan
- `memberships` - User-org relationships with roles
- `invites` - Token-based email invitations
- `activity_logs` - Audit trail (auto-populated by triggers)
- `feature_flags` - Per-org feature toggles
- `notifications` - In-app notifications

### Testing

- Unit tests: Vitest with jsdom, co-located with components (e.g., `component.test.tsx`)
- E2E tests: Playwright in `e2e/`, uses `.env.local` for test credentials
- Database security tests: pgTAP in `supabase/tests/database`

Please always write automated tests for new functionality.

### Code Style

- TypeScript strict mode
- Prettier with `semi: false` (no semicolons)
- shadcn/ui components in `components/ui/`
- Tailwind CSS with dark mode (`class` strategy)
