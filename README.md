# SaaSKit — Next.js + Supabase + Creem

A production-ready SaaS boilerplate that lets you launch your paid SaaS in hours, not weeks.

**Auth + Database + Payments + Subscriptions** — everything you need to ship fast.

## Stack

- **Next.js 16** — App Router, Server Components, TypeScript
- **Supabase** — Auth, Postgres database, Row Level Security
- **Creem** — Payments, subscriptions, tax compliance (190+ countries)
- **Tailwind CSS 4** — Styling
- **Biome** — Linting and formatting
- **Vitest** — Unit tests

## Features

- Email/password authentication with Supabase Auth
- Protected routes via middleware
- Subscription management synced via webhooks
- HMAC-SHA256 webhook signature verification
- Checkout flow with Creem hosted checkout
- Customer billing portal (manage subscriptions, update payment methods)
- Landing page, pricing page, dashboard
- Responsive design
- TypeScript strict mode throughout
- 13+ unit tests covering webhook verification and event handling

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/malakhov-dmitrii/nextjs-supabase-creem-boilerplate.git
cd saaskit-creem
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **Settings > API** and copy your project URL, anon key, and service role key
3. Go to **SQL Editor** and run the schema:

```sql
-- Copy contents of supabase/schema.sql and run it
```

### 3. Create a Creem Account

1. Sign up at [creem.io](https://creem.io)
2. Get your API key from the dashboard
3. Create your subscription products (Starter, Pro, Enterprise)
4. Set up a webhook endpoint pointing to `https://your-domain.com/api/webhooks/creem`
5. Copy your webhook secret

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your values:

```env
CREEM_API_KEY=creem_test_xxxxx
CREEM_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Update Product IDs

Edit `src/app/pricing/page.tsx` and replace `REPLACE_WITH_*_PRODUCT_ID` with your actual Creem product IDs.

### 6. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Sign in page
│   │   └── signup/page.tsx         # Sign up page
│   ├── api/
│   │   ├── checkout/route.ts       # Create Creem checkout session
│   │   ├── billing-portal/route.ts # Generate billing portal link
│   │   └── webhooks/creem/route.ts # Webhook handler (HMAC verified)
│   ├── dashboard/page.tsx          # User dashboard with subscription info
│   ├── pricing/page.tsx            # Pricing page with checkout buttons
│   ├── page.tsx                    # Landing page
│   └── layout.tsx                  # Root layout
├── components/
│   ├── pricing-card.tsx            # Pricing tier card with checkout
│   ├── subscription-card.tsx       # Subscription status and billing
│   └── sign-out-button.tsx         # Sign out button
├── lib/
│   ├── creem.ts                    # Creem SDK client
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       ├── server.ts               # Server Supabase client
│       └── middleware.ts           # Auth session middleware
└── middleware.ts                   # Route protection
supabase/
└── schema.sql                      # Database schema with RLS
tests/
├── webhook-verification.test.ts    # HMAC signature verification tests
└── webhook-events.test.ts          # Webhook event parsing tests
```

## How It Works

### Authentication Flow

1. User signs up/in via Supabase Auth
2. Middleware protects `/dashboard` routes
3. Session is managed via cookies (SSR-compatible)

### Payment Flow

1. User clicks a plan on `/pricing`
2. API creates a Creem checkout session with `user_id` in metadata
3. User completes payment on Creem hosted checkout
4. Creem sends `checkout.completed` webhook
5. Webhook handler verifies HMAC signature and upserts subscription in Supabase
6. Dashboard shows active subscription with plan details

### Subscription Lifecycle

All Creem webhook events are handled:

| Event | Action |
|-------|--------|
| `checkout.completed` | Create/activate subscription |
| `subscription.active` | Mark active |
| `subscription.renewed` | Mark active, update period |
| `subscription.cancelled` | Mark cancelled |
| `subscription.paused` | Mark paused |
| `subscription.expired` | Mark expired |

### Billing Portal

Users manage their subscription (upgrade, cancel, update payment method) via Creem's hosted billing portal, accessible from the dashboard.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Check code with Biome |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format code with Biome |
| `npm run check` | Lint + typecheck + test (CI) |

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/malakhov-dmitrii/nextjs-supabase-creem-boilerplate)

1. Click the button above
2. Add environment variables in Vercel dashboard
3. Set up Creem webhook URL to `https://your-app.vercel.app/api/webhooks/creem`

## Database Schema

The `subscriptions` table syncs with Creem via webhooks:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | References auth.users (unique) |
| `creem_customer_id` | text | Creem customer ID |
| `creem_subscription_id` | text | Creem subscription ID |
| `creem_product_id` | text | Creem product ID |
| `product_name` | text | Human-readable plan name |
| `status` | text | active / cancelled / paused / expired / inactive |
| `current_period_end` | timestamptz | Next billing date |

Row Level Security ensures users can only read their own subscription.

## Test Cards

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Declined |

Use any future expiry date and any CVC.

## Why Creem?

- **Merchant of Record** — Creem handles tax compliance in 190+ countries
- **Simple pricing** — 3.9% + 30c per transaction, no monthly fees
- **Developer-first** — TypeScript SDK, webhooks, CLI
- **Fast setup** — Accept payments in under 10 minutes

## License

MIT
