# Next.js + Supabase SaaS Starter

The production-ready SaaS starter kit that saves you months of development. Built with Next.js 16, Supabase, Stripe, and TypeScript.

[![Buy Now](https://img.shields.io/badge/Buy%20Now-blue?style=for-the-badge)](https://sanjosolutions.gumroad.com/l/next-js-supabase-saas-starter)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## Why This Starter?

Most SaaS starters give you auth and a landing page. This one gives you a **complete, production-grade application** with multi-tenant organizations, Stripe billing, usage-based credits, an optional B2B marketplace module, EU legal compliance, i18n, admin dashboard, and comprehensive test coverage.

**Ship your SaaS in days, not months.**

---

## Features

### Core Platform
- **Authentication** -- Email/password, Google, and GitHub OAuth with email verification, password reset, and session management
- **Multi-Tenant Organizations** -- Role-based access control (owner, admin, member) with invite system and org switching
- **Stripe Billing** -- Subscription plans (free/pro), Stripe Checkout, Customer Portal, webhook handling
- **Usage-Based Credits** -- Atomic credit system with purchase, deduction, refund, and full transaction audit trail
- **Admin Dashboard** -- Platform-wide stats (users, orgs, revenue, subscriptions) with recent activity feed
- **In-App Notifications** -- Real-time notification system with unread counts and mark-as-read
- **Feature Flags** -- Per-organization feature toggles to gate features behind plans or A/B test
- **Internationalization** -- English and German out of the box with URL-based locale routing (`/en/...`, `/de/...`)

### Modular Architecture
Every feature is designed as an independent module that can be enabled or disabled:

- **B2B Marketplace** -- Request-offer matching engine, Stripe Connect payments, contract lifecycle, dispute resolution
- **Legal & Compliance** -- German legal templates (Impressum, AGB, Datenschutz), GDPR data export, cookie consent
- **EU Regulations** -- DSA content moderation, DAC7 tax reporting, P2B complaint system
- **Activity Dashboard** -- Audit log of organization events (Pro plan feature gate)

Code-level module definitions live under `features/<feature>/` and the central registry in `features/registry.ts`. Each module declares its feature flag, default state, route prefixes, and the owned paths that can be removed from the repo.

### Developer Experience
- **TypeScript strict mode** end-to-end
- **Storybook** for UI component development and testing
- **E2E tests** with Playwright (12 spec files)
- **Unit tests** with Vitest
- **Database security tests** with pgTAP
- **CI/CD pipeline** with GitHub Actions (lint, test, build, E2E)
- **Row-Level Security** on all tables with comprehensive RLS policies
- **Code quality** enforced with ESLint and Prettier

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router, Server Components, Server Actions) |
| Database | **Supabase** (PostgreSQL, Auth, Realtime, RLS) |
| Payments | **Stripe** (Subscriptions, Checkout, Connect, Customer Portal) |
| Styling | **Tailwind CSS** + **shadcn/ui** components |
| i18n | **next-intl** with URL-based routing |
| Testing | **Playwright** (E2E) + **Vitest** (unit) + **pgTAP** (DB) |
| UI Catalog | **Storybook** |
| Language | **TypeScript** (strict mode) |

---

## Project Structure

```
app/
  [locale]/
    (authenticated)/        # Protected routes (requires login)
      admin/                # Platform admin dashboard
      marketplace/          # Thin route wrappers for the marketplace module
      organizations/[id]/   # Org settings, billing, members, activity
      invites/              # Invite acceptance flow
      protected/            # Post-login landing
    (legal)/                # Legal pages (impressum, privacy, terms)
    auth/                   # Login, signup, password reset, OAuth callback
  api/
    account/export/         # GDPR data export
    marketplace/listings/   # Thin API wrappers for marketplace endpoints
    matching-engine/        # Thin wrapper for marketplace matching cron
    dac7/export/            # Thin wrapper for marketplace DAC7 export
    webhooks/stripe/        # Stripe billing webhooks
    webhooks/stripe-connect/# Thin wrapper for marketplace Connect webhooks
components/                 # Shared React components
  ui/                       # shadcn/ui base components
features/
  marketplace/             # Self-contained marketplace feature bundle
    actions/               # Marketplace server actions
    api/                   # Marketplace API implementations
    components/            # Marketplace-only UI
    lib/                   # Marketplace business logic
    routes/                # Marketplace page implementations
lib/                        # Shared utilities
  supabase/                 # Supabase client factories
messages/                   # i18n translation files (en, de)
stories/                    # Storybook stories
supabase/
  migrations/               # Database migrations (22+)
  tests/                    # pgTAP database tests
e2e/                        # Playwright E2E tests
```

---

## Quick Start

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local Supabase)

### Setup

```bash
# Clone and install
git clone <your-repo-url>
cd next-js-supabase-saas-starter
pnpm install

# Start local Supabase (requires Docker)
npx supabase start

# Copy env vars from Supabase output
cp .env.example .env.local
# Edit .env.local with your Supabase URL, keys, and Stripe keys

# Run database migrations
npx supabase db push

# Start dev server
pnpm dev
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (billing)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Connect (marketplace payments)
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...

# Marketplace
CRON_SECRET=your-cron-secret
MARKETPLACE_PLATFORM_FEE_PERCENT=10

# Admin
ADMIN_USER_IDS=user-uuid-1,user-uuid-2

# Social Auth (configure in Supabase Dashboard > Auth > Providers)
# Google and GitHub OAuth are handled by Supabase — no env vars needed here
```

---

## Commands

```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm test             # Run the fast default loop (unit tests only)
pnpm verify           # Run the fast local gate (lint + unit tests)
pnpm test:unit        # Run Vitest unit tests
pnpm test:e2e:smoke   # Run a small Playwright smoke subset
pnpm test:e2e         # Run Playwright E2E tests
pnpm test:full        # Run lint + unit tests + full E2E
pnpm storybook        # Start Storybook dev server
pnpm build-storybook  # Build static Storybook
```

---

## Enabling/Disabling Modules

The starter uses a feature flag system to control which modules are active:

### Database Feature Flags
Toggle features per organization via the `feature_flags` table:
- `advanced_analytics` -- Activity dashboard (typically Pro-only)
- `marketplace_access` -- B2B marketplace module

### Removing a Module
Each module is self-contained. To remove a module, start with its manifest in `features/<feature>/module.ts`.

For example, to remove marketplace:
1. Delete `features/marketplace/`
2. Delete the thin app and API wrapper paths listed in `features/marketplace/module.ts`
3. Remove the `marketplace` entry from `features/registry.ts`
4. Remove marketplace translation keys from `messages/`

The core platform (auth, orgs, billing, credits, notifications) continues to work independently.

---

## Marketplace Module

The included B2B delivery marketplace demonstrates a complete two-sided marketplace:

- **Listings** -- Buyers post delivery requests, sellers post delivery offers with price ranges
- **Matching** -- Automated engine matches compatible listings by location, date, package size, and price overlap
- **Contracts** -- Full lifecycle from payment to delivery completion with status tracking
- **Payments** -- Stripe Connect with platform fee (10% default), destination charges
- **Disputes** -- Built-in dispute resolution system
- **Compliance** -- DSA content moderation, DAC7 tax reporting, P2B complaint handling

---

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run `npx supabase link --project-ref your-project-ref`
3. Run `npx supabase db push` to apply migrations
4. Configure Auth providers (Google, GitHub) in the Supabase Dashboard

---

## Testing

| Type | Tool | Location |
|------|------|----------|
| E2E | Playwright | `e2e/` (12 spec files) |
| Unit | Vitest + Testing Library | Co-located `*.test.tsx` |
| Database | pgTAP | `supabase/tests/database/` |
| UI | Storybook | `stories/` |
| CI | GitHub Actions | `.github/workflows/ci.yml` |

---

## License

MIT -- use it for any commercial project, modify freely, keep all revenue.

---

## Buy

[![Buy Now](https://img.shields.io/badge/Buy%20Now-blue?style=for-the-badge)](https://sanjosolutions.gumroad.com/l/next-js-supabase-saas-starter)

You can always test it first and buy it later. Buying is a way to support continued development.
