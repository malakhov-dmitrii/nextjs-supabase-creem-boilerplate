# Build a Complete SaaS with Next.js, Supabase & Creem -- Subscriptions, Credits, Licenses in 30 Minutes

So you want to launch a SaaS product. You need auth, a database, payments, subscription management, license keys, a credits system, discount codes, webhooks... and it all needs to work together.

I built **SaaSKit** -- an open-source boilerplate that wires all of this up with Next.js 16, Supabase, and Creem. In this tutorial, I'll walk you through how it works and how to get your own SaaS running.

**Live demo:** https://nextjs-supabase-creem-boilerplate.vercel.app/
**GitHub:** https://github.com/malakhov-dmitrii/nextjs-supabase-creem-boilerplate

---

## Why Creem?

If you've used Stripe, you know the pain: tax compliance, VAT handling, international regulations. Creem is a **Merchant of Record** -- they handle all of that for you. 3.9% + 30c, no monthly fees, and a TypeScript SDK that's a joy to use.

They also have built-in license key management, which is rare for payment processors.

---

## What You Get

SaaSKit ships with:

- **Authentication** -- Email/password + Google/GitHub OAuth via Supabase
- **3-tier pricing** -- Starter ($9), Pro ($29), Enterprise ($99)
- **Subscription management** -- Upgrade, downgrade, cancel (scheduled or immediate)
- **Seat-based billing** -- Add/remove team members
- **13 webhook events** -- Full subscription lifecycle, refunds, disputes
- **License keys** -- Activate, validate, deactivate per device
- **Credits wallet** -- Atomic Postgres operations, no race conditions
- **Discount codes** -- Percentage or fixed amount, product-scoped
- **Email notifications** -- Welcome + payment confirmation via Resend
- **Rate limiting** -- Upstash Redis on sensitive routes
- **SEO** -- Sitemap, robots.txt, OG image generation
- **Demo mode** -- Works without any accounts, pre-seeded with data
- **131 tests** -- All importing from actual source code
- **CI/CD** -- GitHub Actions pipeline

---

## Quick Start (Demo Mode)

No accounts needed. Clone and run:

```bash
git clone https://github.com/malakhov-dmitrii/nextjs-supabase-creem-boilerplate saaskit
cd saaskit
npm install
npm run dev
```

Open http://localhost:3000. Demo mode activates automatically -- you'll see a pre-seeded Pro subscription, 50 credits, and a sample license key. The full checkout flow works with in-memory data.

---

## Architecture Overview

The project uses Next.js 16 App Router with a clean structure:

```
src/
  app/
    (auth)/          -- Login, signup, OAuth callback
    api/             -- 11 API routes (checkout, subscriptions, licenses, credits, etc.)
    dashboard/       -- Main dashboard, transactions, licenses, admin
    pricing/         -- Pricing page with discount code support
  components/        -- 14 client components
  lib/
    creem.ts         -- SDK client with auto test/prod detection
    email.ts         -- Resend integration with graceful fallback
    rate-limit.ts    -- Upstash rate limiting
    demo/            -- Demo mode: store, mock, detection
    supabase/        -- Browser, server, admin clients
```

---

## Setting Up Payments with Creem

### 1. Install the SDK

SaaSKit uses both the Creem SDK and the Next.js webhook adapter:

```bash
npm install creem @creem_io/nextjs
```

### 2. Create a Checkout

The checkout route creates a Creem hosted checkout session:

```typescript
// src/app/api/checkout/route.ts
const checkout = await creem.checkouts.create({
  productId,
  successUrl: `${appUrl}/dashboard?checkout=success`,
  discountCode: discountCode || undefined,
  metadata: { user_id: user.id },
});
return NextResponse.json({ url: checkout.checkoutUrl });
```

The `metadata.user_id` is critical -- it's how webhooks know which user to update.

### 3. Handle Webhooks

SaaSKit handles all 13 Creem webhook events using `@creem_io/nextjs`:

```typescript
// src/app/api/webhooks/creem/route.ts
Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,
  onCheckoutCompleted: async (event) => {
    // Upsert subscription, send confirmation email
  },
  onSubscriptionCanceled: async (event) => {
    // Update status to cancelled
  },
  onGrantAccess: async ({ reason, metadata }) => {
    // Set subscription active
  },
  onRevokeAccess: async ({ reason, metadata }) => {
    // Revoke access based on reason
  },
  // ... 9 more handlers
});
```

Every webhook handler includes idempotency checking via a `webhook_events` table -- duplicate events are detected and skipped.

---

## Credits System

The credits wallet uses atomic Postgres operations to prevent race conditions:

```sql
CREATE FUNCTION spend_credits(p_user_id uuid, p_amount int, p_reason text)
RETURNS integer AS $$
  -- Lock row, check balance (handles unlimited sentinel -1)
  -- Deduct and log transaction atomically
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Enterprise plans get unlimited credits (stored as `-1` sentinel). The app layer checks `isUnlimited()` before calling the RPC, and the SQL function handles it as a defense-in-depth measure.

---

## License Key Management

Creem has built-in license key support. SaaSKit exposes three API routes:

```typescript
// Activate a license on a device
await creem.licenses.activate({ key, instanceName });

// Validate it's still active
await creem.licenses.validate({ key, instanceId });

// Deactivate when done
await creem.licenses.deactivate({ key, instanceId });
```

License keys are delivered automatically via the `checkout.completed` webhook and displayed in the dashboard.

---

## Demo Mode

One of SaaSKit's unique features is a full demo mode that works without any external services:

```typescript
export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return PLACEHOLDER_URLS.includes(url);
}
```

When no real Supabase URL is configured, the app uses an in-memory store with:
- A pre-seeded Pro subscription
- 50 credits with transaction history
- A sample active license key
- Full mock Supabase client supporting selects, inserts, upserts, and RPC calls

This means judges, reviewers, or potential users can clone the repo and see everything working immediately.

---

## Testing Strategy

SaaSKit has **131 unit tests** across 19 test files, plus Playwright E2E specs. Every test imports from the actual source module -- no reimplemented logic.

The key pattern: extract pure functions into `handlers.ts`, `validators.ts`, and `helpers.ts` files, then test those directly:

```typescript
// tests/api/webhook-handler.test.ts
import { mapSubscriptionStatus, buildSubscriptionUpsert } from "@/app/api/webhooks/creem/handlers";

test("maps subscription.canceled to cancelled", () => {
  expect(mapSubscriptionStatus("subscription.canceled")).toBe("cancelled");
});
```

---

## Deploying to Vercel

```bash
# Push to GitHub, then:
# 1. Import repo in Vercel
# 2. Add environment variables
# 3. Deploy
```

After deployment, configure your Creem webhook URL to `https://your-app.vercel.app/api/webhooks/creem` and you're live.

---

## Wrapping Up

SaaSKit gives you a production-ready foundation:

- **12 video proofs** demonstrating every flow
- **131 honest tests** with CI/CD
- **Demo mode** for instant evaluation
- **13 webhook handlers** for full subscription lifecycle
- **Rate limiting, email, SEO** out of the box

The code is MIT licensed. Clone it, customize it, ship your SaaS.

**GitHub:** https://github.com/malakhov-dmitrii/nextjs-supabase-creem-boilerplate
**Live Demo:** https://nextjs-supabase-creem-boilerplate.vercel.app/

---

*Built for the Creem Scoops bounty program. Creem is a Merchant of Record for SaaS -- learn more at [creem.io](https://creem.io).*
