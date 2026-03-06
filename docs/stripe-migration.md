# Stripe to Creem Migration Guide

Move from Stripe to Creem in an afternoon. This guide covers every code change you need to make, nothing more.

---

## Why Creem?

| Feature | Stripe | Creem |
|---------|--------|-------|
| Transaction fee | 2.9% + $0.30 | 3.9% + $0.30 |
| Tax collection | +Tax module ($0.05/txn) | Included |
| VAT invoicing | Manual setup | Automatic |
| Refunds | Manual + fee | Handled by MoR |
| PCI compliance | You manage (SAQ A) | Creem is MoR — fully handled |
| Merchant of Record | No | Yes |
| Dispute handling | You respond | Creem handles |
| Global tax remittance | You register per country | Creem remits everywhere |

The 1% fee difference pays for itself the moment you avoid a single tax registration, dispute, or invoice audit.

---

## Concept Mapping

| Stripe | Creem | Notes |
|--------|-------|-------|
| `stripe.checkout.sessions.create()` | `creem.checkouts.create()` | Same flow, fewer fields |
| `stripe.customers.create()` | Automatic on checkout | No explicit customer creation needed |
| `stripe.billingPortal.sessions.create()` | `creem.customers.generateBillingLinks()` | Returns a URL |
| `stripe.subscriptions.retrieve()` | `creem.subscriptions.get()` | Same concept |
| `stripe.subscriptions.cancel()` | `creem.subscriptions.cancel()` | Same concept |
| `stripe.products.create()` | `creem.products.create()` | Fewer required fields |
| `stripe.webhooks.constructEvent()` | Manual HMAC-SHA256 verify | See webhook section |
| Stripe signing secret | `CREEM_WEBHOOK_SECRET` | Same purpose, different algorithm |
| `customer.id` | `customer_id` in webhook payload | Stored in your DB |
| `subscription.id` | `subscription_id` in webhook payload | Stored in your DB |

---

## Code Migration

### Creating a Checkout Session

**Stripe**

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card'],
  line_items: [
    {
      price: 'price_1234',
      quantity: 1,
    },
  ],
  customer_email: user.email,
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  metadata: {
    user_id: user.id,
  },
});

return redirect(session.url!);
```

**Creem**

```typescript
import { Creem } from 'creem';

const creem = new Creem({ apiKey: process.env.CREEM_API_KEY! });

const checkout = await creem.checkouts.create({
  productId: process.env.CREEM_PRODUCT_ID!,
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  requestId: user.id, // passed back in webhook as metadata.requestId
  customerId: existingCreemCustomerId ?? undefined, // omit on first checkout
});

return redirect(checkout.checkoutUrl!);
```

Key differences:
- No `line_items` — products are pre-created in the Creem dashboard or via API
- `requestId` is your correlation ID; comes back in every webhook for this checkout
- Customer is created automatically; Creem returns `customer_id` in the webhook

---

### Webhook Verification

**Stripe**

```typescript
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // handle event.type ...
}
```

**Creem**

```typescript
import crypto from 'crypto';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get('creem-signature')!;

  const expected = crypto
    .createHmac('sha256', process.env.CREEM_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (sig !== expected) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  const event = JSON.parse(body);

  // handle event.type ...
}
```

Or use the `@creem_io/nextjs` adapter which wraps this for you:

```typescript
import { withCreemWebhook } from '@creem_io/nextjs';

export const POST = withCreemWebhook(
  process.env.CREEM_WEBHOOK_SECRET!,
  async (event) => {
    // event is verified and typed
    switch (event.type) {
      case 'checkout.completed':
        // ...
    }
    return new Response('ok');
  }
);
```

---

### Webhook Events

| Stripe event | Creem event | Notes |
|---|---|---|
| `checkout.session.completed` | `checkout.completed` | Includes `customer_id`, `subscription_id` |
| `customer.subscription.created` | `subscription.created` | |
| `customer.subscription.updated` | `subscription.updated` | |
| `customer.subscription.deleted` | `subscription.cancelled` | |
| `customer.subscription.trial_will_end` | — | Creem handles trial end automatically |
| `invoice.payment_succeeded` | `invoice.paid` | |
| `invoice.payment_failed` | — | Creem retries automatically |
| `customer.subscription.paused` | `subscription.paused` | |
| — | `subscription.active` | Fires when trial converts to paid |
| — | `subscription.expired` | |
| — | `subscription.renewed` | |
| `payment_intent.succeeded` | `payment.received` | |
| `charge.dispute.created` | `dispute.opened` | |
| `charge.dispute.lost` | `dispute.lost` | |
| `charge.refunded` | `refund.created` | |
| `customer.created` | — | Customer created inside `checkout.completed` |
| `license.key.created` | `license.activated` | |

---

### Billing Portal

**Stripe**

```typescript
const portalSession = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
});

return redirect(portalSession.url);
```

**Creem**

```typescript
const creem = new Creem({ apiKey: process.env.CREEM_API_KEY! });

const links = await creem.customers.generateBillingLinks({
  customerId: creemCustomerId,
});

return redirect(links.customerPortalLink);
```

Store `creemCustomerId` from the `checkout.completed` webhook payload — same as you stored `stripeCustomerId` from Stripe's `customer.created` event.

---

## Migration Checklist

- [ ] 1. Add `CREEM_API_KEY`, `CREEM_PRODUCT_ID`, `CREEM_WEBHOOK_SECRET` to `.env`
- [ ] 2. Run `npm install creem @creem_io/nextjs` and remove `stripe` from `package.json`
- [ ] 3. Create products in Creem dashboard (or via `creem.products.create()`) and note their IDs
- [ ] 4. Replace checkout creation code with `creem.checkouts.create()`, store `requestId` = your user ID
- [ ] 5. Replace webhook handler: swap `stripe.webhooks.constructEvent` with HMAC-SHA256 verify (or use `withCreemWebhook`)
- [ ] 6. Update webhook event names in your switch/if statements (see table above)
- [ ] 7. Replace subscription retrieval with `creem.subscriptions.get({ id })`
- [ ] 8. Replace billing portal with `creem.customers.generateBillingLinks({ customerId })`
- [ ] 9. Remove customer creation code — Creem creates customers automatically
- [ ] 10. Register your webhook endpoint URL in the Creem dashboard and copy the signing secret

---

## What You DON'T Need to Migrate

**Tax configuration** — Creem is a Merchant of Record. Delete your Stripe Tax rules, nexus registrations, and any tax rate lookups. Creem handles collection and remittance in every jurisdiction automatically.

**Invoice templates** — Creem generates compliant VAT invoices for every transaction. Remove any invoice PDF generation or Stripe Invoice configuration.

**Webhook retry logic** — Creem retries failed webhook deliveries automatically with exponential backoff. If you added a queue or retry layer on top of Stripe webhooks, you can remove it.

**PCI documentation** — Since Creem is the MoR and card data never touches your server, your PCI scope is reduced to SAQ A (or eliminated entirely if you use the hosted checkout). You don't need to maintain a PCI compliance program.

**Dispute response tooling** — Creem handles disputes on your behalf as the MoR. Remove any Stripe dispute webhook handlers and evidence-submission logic.
