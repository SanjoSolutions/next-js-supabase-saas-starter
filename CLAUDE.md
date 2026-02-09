# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Process Instructions

- Always write tests before fixing bugs.
- Run `pnpm test` after making changes.
- Run `pnpm test:e2e` after the implementation of features.

## Commands

```bash
pnpm dev          # Start Next.js dev server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm test         # Run Vitest unit tests
pnpm test:e2e     # Run Playwright E2E tests
```

Run a single test file:

```bash
pnpm test components/language-switcher.test.tsx
pnpm test:e2e e2e/i18n.spec.ts
```

Database commands (requires Supabase CLI and Docker):

```bash
npx supabase start    # Start local Supabase
npx supabase db push  # Apply migrations
```

## Architecture

This is a **Next.js 16 + Supabase SaaS Starter** with multi-tenant organizations, Stripe billing, role-based access, i18n support, and a **B2B delivery gig marketplace**.

### Key Patterns

**Authentication Flow:**

- `lib/auth.ts` exports auth helpers with escalating requirements:
  - `requireUser()` — redirects to `/auth/login` if not authenticated
  - `requireOrgMember(orgId)` — redirects to `/protected` if not a member
  - `requireMarketplaceProfile(orgId)` — redirects to `/marketplace/profile/setup` if no profile
  - `requireSellerProfile(orgId)` — redirects to `/marketplace/seller/onboarding` if not onboarded
- Cookie-based auth via `@supabase/ssr` — use `createClient()` from `lib/supabase/server.ts` in Server Components/Actions
- `lib/supabase/admin.ts` bypasses RLS — only use in webhooks and cron jobs
- Default post-login redirect is `/marketplace` (not `/protected`)

**Multi-Tenancy:**

- All data scoped by `organization_id` with Row-Level Security (RLS)
- Users have memberships with roles: `owner`, `admin`, `member`
- Active org stored in cookie (`active_org_id`)

**Internationalization (i18n):**

- Uses `next-intl` with URL-based locale routing (`/en/...`, `/de/...`)
- Config in `i18n/config.ts`, `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`
- Translation files in `messages/en.json` and `messages/de.json`
- Server Components: `const t = await getTranslations('namespace')`
- Client Components: `const t = useTranslations('namespace')`
- Use `Link`, `useRouter`, `usePathname` from `@/i18n/navigation` for locale-aware navigation

**Server Actions:**

- Located in `actions/` and page-level `actions.ts` files
- Use `"use server"` directive at file top
- Marketplace actions organized in `actions/marketplace/` subdirectory

**Billing:**

- `actions/stripe.ts` has `createCheckoutSession()` and `createCustomerPortalSession()`
- Webhook at `app/api/webhooks/stripe/route.ts` updates org plan
- Organizations have `plan` (free/pro) and `subscription_status` fields

**Feature Flags:**

- `lib/feature-flags.ts` exports `isFeatureEnabled(name, orgId)`
- Gates Pro-only features like Activity Dashboard
- `marketplace_access` flag gates the marketplace

### Marketplace Architecture

The marketplace is a **request-offer matching system** for B2B delivery services.

**Core flow:** Profile setup → Create listings → Automatic matching → Confirm match → Contract → Payment → Delivery tracking → Completion

**Key entities and their tables:**

- `marketplace_profiles` — One per org. Role: `buyer`, `seller`, or `both`. Sellers need Stripe Connect onboarding.
- `service_listings` — Order book. Type: `request` or `offer`. Has **price range** (`price_min_cents`, `price_max_cents`) plus backward-compat `price_cents` (midpoint). Status: `open` → `matched` / `expired` / `cancelled`.
- `order_matches` — Proposed matches between a request and an offer. Both parties must confirm. Status: `proposed` → `buyer_confirmed`/`seller_confirmed` → `confirmed` / `rejected`.
- `contracts` — Created from confirmed matches. Full price breakdown (net, VAT 19%, gross, platform fee 10%, seller payout). Status lifecycle: `pending_payment` → `paid` → `in_progress` → `pickup_confirmed` → `delivered` → `completed`. Can also be `disputed`, `resolved`, `refunded`, `cancelled`.
- `disputes` — Filed by either contract party.

**Matching algorithm** (`find_matching_listings()` SQL function):
- Matches opposite listing types with same postal codes, package size, delivery date
- **Price range overlap**: `request_max >= offer_min AND offer_max >= request_min`
- Agreed price = midpoint of the overlapping range
- Run via cron: `POST /api/matching-engine` (auth: `CRON_SECRET` bearer token)

**Contract status transitions** (enforced in `actions/marketplace/contracts.ts`):
- Seller-only: `paid→in_progress`, `in_progress→pickup_confirmed`, `pickup_confirmed→delivered`
- Buyer-only: `delivered→completed`

**Stripe Connect integration:**
- Sellers onboard via `actions/marketplace/stripe-connect.ts`
- Payments use destination charges (buyer pays, platform takes fee, seller gets payout)
- Webhook at `app/api/webhooks/stripe-connect/route.ts` handles async events

**Price utilities** (`lib/marketplace/price.ts`):
- `calculateVat()`, `calculateGross()`, `calculatePlatformFee()`, `calculateSellerPayout()`, `calculatePriceBreakdown()`
- `formatEurCents()` — German locale EUR formatting
- Default: 19% VAT, 10% platform fee (configurable via `MARKETPLACE_PLATFORM_FEE_PERCENT`)

**EU compliance tables**: `dac7_seller_data` (tax reporting), `content_reports` (DSA), `p2b_complaints` (P2B regulation)

### REST API Endpoints

- `POST /api/marketplace/listings` — Create listing. Auth: Bearer token. Validates fields, membership, marketplace profile, role/Stripe requirements.
- `POST /api/matching-engine` — Run matching engine. Auth: `CRON_SECRET` bearer token.
- `POST /api/dac7/export` — DAC7 tax export.
- `POST /api/webhooks/stripe` — Stripe billing webhooks.
- `POST /api/webhooks/stripe-connect` — Stripe Connect webhooks.

### Route Structure

- `app/[locale]/(authenticated)/` — Protected routes (requires login)
- `app/[locale]/(authenticated)/marketplace/` — Marketplace routes (dashboard, listings, matches, contracts, disputes)
- `app/[locale]/auth/` — Login, signup, password reset
- `app/[locale]/(legal)/` — Impressum, Datenschutz, AGB, Marketplace Terms
- `app/api/` — REST API and webhook handlers
- `proxy.ts` — Combined i18n middleware and Supabase session handling

### Database

Migrations in `supabase/migrations/`. Key tables:

- `organizations` — Org data, Stripe IDs, plan
- `memberships` — User-org relationships with roles
- `invites` — Token-based email invitations
- `activity_logs` — Audit trail (auto-populated by triggers)
- `feature_flags` — Per-org feature toggles
- `notifications` — In-app notifications
- `marketplace_profiles` — Marketplace role, business info, Stripe Connect
- `service_listings` — Delivery requests/offers with price ranges
- `order_matches` — Matched request-offer pairs with confirmation state machine
- `contracts` — Delivery contracts with full price breakdown and status lifecycle
- `disputes` — Contract dispute records

### Testing

- Unit tests: Vitest with jsdom, co-located with components (e.g., `component.test.tsx`)
- E2E tests: Playwright in `e2e/`, uses `.env.local` for test credentials
- Database security tests: pgTAP in `supabase/tests/database`
- i18n test wrapper: `I18nTestWrapper` in `test/utils/i18n-test-wrapper.tsx`
- E2E helpers in `e2e/helpers.ts`: `loginAsTestUser()`, `signUp()`, `createOrganization()`, `acceptInvite()`, `generateTestEmail()`
- Default test user: `test@example.com` / `password123`
- E2E tests must support both English and German UI text

### Code Style

- TypeScript strict mode
- Prettier with `semi: false` (no semicolons)
- shadcn/ui components in `components/ui/`
- Tailwind CSS with dark mode (`class` strategy)
