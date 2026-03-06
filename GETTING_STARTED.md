# Getting Started

This guide walks you through setting up the SaaS starter for local development.

## Option 1: For Developers

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`pnpm add -g supabase`)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd next-js-supabase-saas-starter
pnpm install
```

### 2. Start Local Supabase

Make sure Docker Desktop is running, then:

```bash
npx supabase start
```

This starts a local Supabase instance with PostgreSQL, Auth, Storage, and Realtime. The output shows your local credentials:

```
API URL: http://localhost:54321
anon key: eyJ...
service_role key: eyJ...
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with the values from `supabase start`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon key from above>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from above>
```

### 4. Apply Database Migrations

```bash
npx supabase db push
```

This creates all tables, RLS policies, functions, and triggers.

### 5. Start Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the landing page.

### 6. Create a Test User

1. Go to [http://localhost:3000/auth/sign-up](http://localhost:3000/auth/sign-up)
2. Sign up with any email and password
3. For local development, email confirmation is disabled by default

### 7. Optional: Configure Stripe

For billing features:

1. Create a [Stripe account](https://dashboard.stripe.com/)
2. Get your test API keys from the Stripe Dashboard
3. Create a subscription product and price
4. Add the keys to `.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
   ```
5. Set up webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### 8. Optional: Configure Social Auth

To enable Google and GitHub login:

1. Open the Supabase Dashboard at [http://localhost:54323](http://localhost:54323)
2. Go to **Authentication > Providers**
3. Enable Google and/or GitHub
4. Add your OAuth app credentials (Client ID and Secret)

For production, configure these in your hosted Supabase project.

### 9. Optional: Admin Dashboard

To access the admin dashboard at `/admin`:

1. Sign up and note your user ID (visible in Supabase Dashboard > Auth > Users)
2. Add it to `.env.local`:
   ```env
   ADMIN_USER_IDS=your-user-uuid
   ```
3. Restart the dev server
4. Navigate to `/admin`

---

## Option 2: For Non-Technical Entrepreneurs (with Claude Code)

If you prefer to have AI build your SaaS product, you can use [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview).

### Prerequisites

1. **Claude Code** installed -- [Install guide](https://docs.anthropic.com/en/docs/claude-code/overview)
2. **Docker Desktop** installed and running -- [docker.com](https://www.docker.com/products/docker-desktop/)

### Start Building

Create a folder for your project. Open your terminal, switch to your project folder (`cd <FOLDER>`) and run `claude` to start Claude Code. Then give it a prompt like this:

```
I'd like to build a SaaS for [describe your idea].
Please use https://github.com/SanjoSolutions/next-js-supabase-saas-starter as a starter.
Clone the repository.
```

Claude Code will clone the starter project and begin setting things up. From here, you can keep describing what you want in plain natural language, and Claude Code will make the changes for you.

---

## Running Tests

```bash
# Unit tests
pnpm test:unit

# E2E tests (requires dev server running)
pnpm test:e2e

# All tests
pnpm test

# Storybook (UI component catalog)
pnpm storybook
```

---

## Deploying to Production

### Supabase (Database)

1. Create a project at [supabase.com](https://supabase.com)
2. Link: `npx supabase link --project-ref <your-project-ref>`
3. Push migrations: `npx supabase db push`
4. Configure Auth providers in the Dashboard

### Vercel (App)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy

### Stripe Webhooks (Production)

1. In Stripe Dashboard, create webhook endpoints:
   - `https://yourdomain.com/api/webhooks/stripe` (billing events)
   - `https://yourdomain.com/api/webhooks/stripe-connect` (Connect events)
2. Update webhook secrets in your environment variables
