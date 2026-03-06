# Switching from Stripe to Creem: A Developer's Migration Guide

I spent 3 days setting up Stripe Tax.

Three days configuring tax registrations, testing VAT calculations, debugging invoice templates, and reading documentation about reverse-charge mechanisms in the EU. Three days before writing a single line of product code.

Then I found Creem.

Creem is a **Merchant of Record** (MoR) for SaaS. The difference from Stripe is fundamental: with Stripe, *you* are the seller. You handle tax compliance, you issue invoices, you deal with VAT. With Creem, *they* are the seller on your behalf. Tax compliance, invoicing, VAT — handled.

I migrated my SaaS boilerplate from Stripe to Creem in an afternoon. Here's how, and more importantly, *why*.

## What's a Merchant of Record?

When you use Stripe, the legal transaction is between your company and the customer. You're responsible for:

- Collecting the right tax rate in every jurisdiction
- Issuing compliant invoices (EU VAT invoices have specific requirements)
- Handling tax remittance to each country
- PCI compliance (at minimum SAQ-A)

When you use a Merchant of Record like Creem, the legal transaction is between *Creem* and the customer. Creem resells your product. They handle all of the above.

| Concern | Stripe (you handle) | Creem (they handle) |
|---------|-------------------|-------------------|
| Tax collection | Configure Stripe Tax or Avalara | Automatic |
| VAT invoicing | Generate compliant invoices | Creem issues them |
| Refunds & disputes | Your problem | Creem handles it |
| PCI compliance | Your responsibility | Creem's responsibility |
| Pricing | 2.9% + 30c + Tax module fees | 3.9% + 30c, all inclusive |

Yes, Creem's percentage is higher. But factor in Stripe Tax ($0.50/transaction or $100k+ for Avalara), the engineering time for tax compliance, and the legal risk of getting it wrong — Creem is cheaper for most SaaS builders.

## The code migration

Here's what actually changes in your codebase.

### Checkout sessions

**Stripe:**

```typescript
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  line_items: [{ price: "price_xxx", quantity: 1 }],
  success_url: "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
  cancel_url: "https://example.com/cancel",
  client_reference_id: userId,
});
// redirect to session.url
```

**Creem:**

```typescript
import { Creem } from "creem";
const creem = new Creem({ apiKey: process.env.CREEM_API_KEY });

const checkout = await creem.checkouts.create({
  productId: "prod_xxx",
  successUrl: "https://example.com/dashboard?checkout=success",
  metadata: { user_id: userId },
});
// redirect to checkout.checkoutUrl
```

Notice: no separate `Price` objects. In Stripe, you create a Product, then a Price for that product, then reference the Price in checkout. In Creem, you create a Product with a price and reference it directly. One less abstraction.

### Webhook verification

**Stripe:**

```typescript
const event = stripe.webhooks.constructEvent(
  body,
  request.headers["stripe-signature"],
  process.env.STRIPE_WEBHOOK_SECRET,
);
```

**Creem:**

```typescript
import crypto from "node:crypto";

const signature = request.headers.get("creem-signature");
const hmac = crypto.createHmac("sha256", process.env.CREEM_WEBHOOK_SECRET);
const digest = hmac.update(body).digest("hex");
const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
```

Both use HMAC-SHA256. Stripe wraps it in a helper; Creem gives you the raw crypto. Personally I prefer seeing exactly what's happening with my webhook verification, but if you want a helper, the `@creem_io/nextjs` package has one.

### Webhook events

The event names map pretty directly:

| Stripe | Creem |
|--------|-------|
| `checkout.session.completed` | `checkout.completed` |
| `customer.subscription.created` | `subscription.created` |
| `customer.subscription.updated` | `subscription.active` / `subscription.renewed` |
| `customer.subscription.deleted` | `subscription.cancelled` |
| `invoice.paid` | `invoice.paid` |

The payload structure is simpler too. Stripe events have deeply nested objects with expandable references. Creem events are flat: `event.object` contains the customer, product, and subscription data you need.

### Billing portal

**Stripe:**

```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: "https://example.com/dashboard",
});
// redirect to session.url
```

**Creem:**

```typescript
const portal = await creem.customers.generateBillingLinks({
  customerId: customerId,
});
// redirect to portal.customerPortalLink
```

Same concept, same pattern.

## What you don't need anymore

After migrating, I deleted:

- **Tax configuration** — no Stripe Tax setup, no tax rates, no tax registrations
- **Invoice templates** — Creem generates compliant invoices automatically
- **PCI compliance documentation** — not my problem anymore
- **Tax remittance tracking** — Creem handles it

That's not just less code. It's less stuff to think about at 2am when a customer in Germany emails about a missing invoice.

## The tradeoffs

I'm not going to pretend Creem is perfect for everyone. Here's the honest assessment:

**Choose Creem when:**
- You're selling to customers in multiple countries
- You don't want to deal with tax compliance
- You want simpler code with fewer abstractions
- You're a solo developer or small team

**Stay on Stripe when:**
- You need Stripe Connect (marketplace payments)
- You need complex billing (metered, usage-based, custom invoicing)
- You're enterprise and already have tax infrastructure
- You need the massive Stripe ecosystem (thousands of integrations)

Creem is younger and smaller. The ecosystem is growing, but it's not Stripe's. If you need something niche, check [docs.creem.io](https://docs.creem.io) first.

## Migration checklist

If you're making the switch:

1. Create a Creem account at [creem.io](https://creem.io)
2. Recreate your products in the Creem dashboard
3. Replace the SDK: `npm uninstall stripe && npm install creem`
4. Update checkout creation code
5. Update webhook handler (event names + verification)
6. Update billing portal integration
7. Swap environment variables
8. Set up your Creem webhook endpoint
9. Test with card `4242 4242 4242 4242`
10. Migrate existing subscriptions (contact Creem support for bulk migration)

I've put together a detailed code-level migration guide with side-by-side comparisons for every step: [docs/stripe-migration.md](https://github.com/malakhov-dmitrii/nextjs-supabase-creem-boilerplate/blob/master/docs/stripe-migration.md)

And if you want a working boilerplate with Creem already wired up (Next.js + Supabase, 91 tests, entitlements, webhooks, billing portal), grab it here: [github.com/malakhov-dmitrii/nextjs-supabase-creem-boilerplate](https://github.com/malakhov-dmitrii/nextjs-supabase-creem-boilerplate)

## The bottom line

Stripe is a great payment processor. But for SaaS builders who sell globally, being your own Merchant of Record is a burden that doesn't add value to your product. The 1% price difference buys you zero tax headaches, zero compliance risk, and an afternoon of your life back.

I'll take that trade.

---

*Have questions about migrating? Open an issue on the [boilerplate repo](https://github.com/malakhov-dmitrii/nextjs-supabase-creem-boilerplate) or find me on Twitter.*
