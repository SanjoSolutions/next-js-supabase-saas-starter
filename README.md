<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build apps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase SaaS Starter Kit</h1>
</a>

<p align="center">
 MIT licensed
</p>

## Features

- Works across the entire [Next.js](https://nextjs.org) stack
  - App Router
  - Pages Router
  - Proxy
  - Client
  - Server
  - It just works!
- supabase-ssr. A package to configure Supabase Auth to use cookies
- Password-based authentication block installed via the [Supabase UI Library](https://supabase.com/ui/docs/nextjs/password-based-auth)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Components with [shadcn/ui](https://ui.shadcn.com/)
- Optional deployment with [Supabase Vercel Integration and Vercel deploy](#deploy-your-own)
  - Environment variables automatically assigned to Vercel project
- Users
- Organizations
  - Memberships
  - Invite
  - Billing (with Stripe)
    - Plans
  - Activity Dashboard (Pro plan)
    - Audit log of all organization events
    - Automatic tracking via database triggers
    - Member joins, invites, role changes, billing events
- Feature Flags
  - Per-organization feature toggles
  - Gate features behind subscription plans
- Notifications
  - In-app notification system
  - Mark as read/unread
  - Notification bell with unread count
