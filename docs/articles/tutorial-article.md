# Build a Paid SaaS in 30 Minutes with Next.js, Supabase & Creem

What if you could go from zero to accepting payments in 30 minutes?

Not "accepting payments in theory." Actual checkout with test cards. Webhook-verified subscriptions synced to your database. Deployed and live.

That's what we're building today. By the end of this tutorial, you'll have a fully working SaaS boilerplate with:

- User authentication (email/password)
- Three subscription tiers with live checkout
- Webhook-verified payment processing
- Plan-based feature gating
- Customer billing portal
- Deployed on Vercel

The stack: **Next.js 16** + **Supabase** + **Creem**.

> **What is Creem?** A Merchant of Record for SaaS. Unlike Stripe where you handle tax compliance, invoicing, and VAT across 190+ countries yourself, Creem does it all for you. You build. They handle the rest.

## Prerequisites

You'll need:
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Creem](https://creem.io) account (test mode is free)
- A GitHub account (for deployment)

## Step 1: Clone and Install

```bash
git clone https://github.com/malakhov-dmitrii/nextjs-supabase-creem-boilerplate.git
cd nextjs-supabase-creem-boilerplate
npm install
```

You'll get a fully structured Next.js 16 project with App Router, TypeScript strict mode, and Tailwind CSS 4.

## Step 2: Set Up Supabase

Head to [supabase.com](https://supabase.com) and create a new project.

Once your project is ready:

1. Go to **Settings > API** and copy your **Project URL**, **anon key**, and **service role key**
2. Go to **SQL Editor** and paste the contents of `supabase/schema.sql`
3. Hit **Run**

This creates three tables:

- `subscriptions` — synced via Creem webhooks, with Row Level Security so users can only see their own data
- `purchases` — for one-time products
- `webhook_events` — for idempotent webhook processing (prevents double-processing)

The schema includes indexes, RLS policies, and an auto-updating `updated_at` trigger. Ready to use as-is.

## Step 3: Set Up Creem

Sign up at [creem.io](https://creem.io) and:

1. Grab your **test API key** from the dashboard (starts with `creem_test_`)
2. Create three subscription products — Starter ($9/mo), Pro ($29/mo), Enterprise ($99/mo)
3. Copy each product ID (starts with `prod_`)
4. Set up a **webhook endpoint** pointing to `https://your-domain.com/api/webhooks/creem`
5. Copy the **webhook secret**

> The SDK auto-detects test vs production mode from your API key prefix. No config changes needed when you go live.

## Step 4: Configure Environment

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

## Step 5: Update Product IDs

Open `src/app/pricing/page.tsx` and replace the three `productId` values with your actual Creem product IDs:

```typescript
const plans = [
  {
    name: "Starter",
    price: "$9",
    period: "month",
    productId: "prod_YOUR_STARTER_ID",  // <-- your ID here
    features: ["3 projects", "Basic analytics", "Email support"],
  },
  // ... Pro and Enterprise
];
```

## Step 6: Run It

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll see a landing page, pricing page, and auth flow.

Try the full flow:
1. Click **Get Started** and create an account
2. Go to **Pricing** and click a plan
3. Complete checkout with test card `4242 4242 4242 4242` (any future expiry, any CVC)
4. You'll land on the dashboard with your subscription active and features unlocked

## How it works under the hood

### The checkout flow

When a user clicks "Get Started" on a plan, here's what happens:

```
User clicks plan -> POST /api/checkout -> Creem creates checkout session
-> User completes payment on Creem -> Creem sends webhook
-> POST /api/webhooks/creem -> Verify HMAC signature -> Upsert subscription in Supabase
-> Dashboard shows active plan with unlocked features
```

No client-side subscription syncing. No trusting URL parameters. The subscription is created exclusively through verified webhooks. This is the correct production pattern.

### Webhook security

Every webhook is verified with HMAC-SHA256 before processing:

```typescript
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

The handler also tracks processed event IDs to prevent double-processing. If Creem retries a webhook, it gets a 200 response without re-running the database operation.

### Feature entitlements

The boilerplate includes a plan-based feature gating system:

```typescript
import { hasAccess } from "@/lib/entitlements";

// In any server component or API route
if (await hasAccess(userId, "api")) {
  // User has API access (Pro or Enterprise)
}
```

Features are mapped to plans in a simple config:

| Feature | Starter | Pro | Enterprise |
|---------|---------|-----|------------|
| Analytics | x | x | x |
| API access | | x | x |
| Priority support | | x | x |
| SSO / SAML | | | x |
| Unlimited projects | | x | x |

The dashboard dynamically shows locked/unlocked features based on the active plan.

## Deploy to Vercel

Click the deploy button in the README, or:

```bash
npm run build  # verify it builds
```

Then push to GitHub and connect to Vercel. Add your environment variables in the Vercel dashboard, and update `NEXT_PUBLIC_APP_URL` to your production URL.

Don't forget to update your Creem webhook URL to `https://your-app.vercel.app/api/webhooks/creem`.

## What's in the box

Beyond the tutorial flow above, the repo includes 91 tests (webhooks, API routes, components, middleware, entitlements), TypeScript strict mode with zero `any` leaks, Biome linting, Playwright E2E tests, idempotent webhook processing, Row Level Security on all tables, and a Stripe-to-Creem migration guide with side-by-side code comparisons in `docs/stripe-migration.md`.

## Why Creem over Stripe?

If you sell to customers in more than one country, tax compliance is a real problem. Creem is a Merchant of Record, which means they handle VAT, sales tax, and invoicing in 190+ countries. With Stripe, that's on you (or on Stripe Tax at $0.50/transaction, or on Avalara at... well, you don't want to know).

The API is also simpler. No separate Price objects, no PaymentIntents. Create a product, create a checkout. The rate is 3.9% + 30c vs Stripe's 2.9% + 30c, but once you factor in tax modules and engineering time, the math works out.

## Get Started

Clone the repo and start building your SaaS today:

[github.com/malakhov-dmitrii/nextjs-supabase-creem-boilerplate](https://github.com/malakhov-dmitrii/nextjs-supabase-creem-boilerplate)

Questions? Open an issue or find me on Twitter.

---

*Built with [Next.js](https://nextjs.org), [Supabase](https://supabase.com), and [Creem](https://creem.io). Open source and free to use.*
