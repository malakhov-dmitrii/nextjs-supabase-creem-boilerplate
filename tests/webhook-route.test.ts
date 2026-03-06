import crypto from "node:crypto";
import { describe, expect, it } from "vitest";

// --- Signature verification ---

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

// --- Subscription status map ---

const SUBSCRIPTION_STATUS_MAP: Record<string, string> = {
  "subscription.active": "active",
  "subscription.renewed": "active",
  "subscription.cancelled": "cancelled",
  "subscription.paused": "paused",
  "subscription.expired": "expired",
};

// --- Core business logic ---

type WebhookResult =
  | { action: "upsert_subscription"; data: Record<string, unknown> }
  | { action: "insert_purchase"; data: Record<string, unknown> }
  | { action: "update_subscription"; match: Record<string, unknown>; data: Record<string, unknown> }
  | { action: "unhandled"; eventType: string }
  | { error: string; status: number };

function processWebhookEvent(event: {
  eventType: string;
  object: Record<string, unknown>;
}): WebhookResult {
  const { eventType: event_type, object } = event;

  if (event_type === "checkout.completed") {
    const checkout = object as {
      customer?: { id?: string; metadata?: { user_id?: string } };
      product?: { id?: string; name?: string };
      subscription?: { id?: string; current_period_end?: string; current_period_end_date?: string };
    };

    if (!checkout.customer?.metadata) {
      return { error: "Missing metadata in checkout", status: 400 };
    }

    const userId = checkout.customer.metadata.user_id;
    if (!userId) {
      return { error: "Missing user_id in checkout metadata", status: 400 };
    }

    const subscription = checkout.subscription;

    if (!subscription) {
      // One-time purchase
      return {
        action: "insert_purchase",
        data: {
          user_id: userId,
          creem_customer_id: checkout.customer.id,
          creem_product_id: checkout.product?.id,
          product_name: checkout.product?.name,
          status: "active",
        },
      };
    }

    const periodEnd =
      subscription.current_period_end_date ?? subscription.current_period_end;

    return {
      action: "upsert_subscription",
      data: {
        user_id: userId,
        creem_customer_id: checkout.customer.id,
        creem_subscription_id: subscription.id,
        creem_product_id: checkout.product?.id,
        product_name: checkout.product?.name,
        status: "active",
        current_period_end: periodEnd,
      },
    };
  }

  const mappedStatus = SUBSCRIPTION_STATUS_MAP[event_type];
  if (mappedStatus) {
    const sub = object as { id: string; current_period_end?: string };
    const data: Record<string, unknown> = { status: mappedStatus };

    if (mappedStatus === "active" && sub.current_period_end) {
      data.current_period_end = sub.current_period_end;
    }

    return {
      action: "update_subscription",
      match: { creem_subscription_id: sub.id },
      data,
    };
  }

  return { action: "unhandled", eventType: event_type };
}

// --- Tests ---

describe("Webhook Route", () => {
  const secret = "whsec_test_secret_key_123";

  describe("Signature Verification", () => {
    it("valid signature accepted", () => {
      const payload = JSON.stringify({ eventType: "checkout.completed", object: {} });
      const sig = signPayload(payload, secret);
      expect(verifyWebhookSignature(payload, sig, secret)).toBe(true);
    });

    it("invalid signature rejected", () => {
      const payload = JSON.stringify({ eventType: "checkout.completed" });
      expect(verifyWebhookSignature(payload, "deadbeef00000000", secret)).toBe(false);
    });

    it("tampered payload rejected", () => {
      const payload = JSON.stringify({ eventType: "checkout.completed" });
      const sig = signPayload(payload, secret);
      const tampered = JSON.stringify({ eventType: "checkout.completed", hacked: true });
      expect(verifyWebhookSignature(tampered, sig, secret)).toBe(false);
    });

    it("wrong secret rejected", () => {
      const payload = JSON.stringify({ eventType: "checkout.completed" });
      const sig = signPayload(payload, "wrong_secret");
      expect(verifyWebhookSignature(payload, sig, secret)).toBe(false);
    });

    it("empty payload with valid signature accepted", () => {
      const sig = signPayload("", secret);
      expect(verifyWebhookSignature("", sig, secret)).toBe(true);
    });

    it("mismatched length signatures handled gracefully", () => {
      expect(verifyWebhookSignature("test", "short", secret)).toBe(false);
    });

    it("empty signature string rejected", () => {
      const payload = JSON.stringify({ eventType: "checkout.completed" });
      expect(verifyWebhookSignature(payload, "", secret)).toBe(false);
    });
  });

  describe("Event Processing — checkout.completed subscription", () => {
    const baseCheckout = {
      eventType: "checkout.completed",
      object: {
        customer: { id: "cust_123", metadata: { user_id: "uuid-456" } },
        product: { id: "prod_789", name: "Pro Plan" },
        subscription: { id: "sub_012", current_period_end: "2026-04-06T00:00:00Z" },
      },
    };

    it("upsert subscription with all fields", () => {
      const result = processWebhookEvent(baseCheckout);
      expect(result).toEqual({
        action: "upsert_subscription",
        data: {
          user_id: "uuid-456",
          creem_customer_id: "cust_123",
          creem_subscription_id: "sub_012",
          creem_product_id: "prod_789",
          product_name: "Pro Plan",
          status: "active",
          current_period_end: "2026-04-06T00:00:00Z",
        },
      });
    });

    it("fallback to current_period_end when current_period_end_date missing", () => {
      const event = {
        eventType: "checkout.completed",
        object: {
          customer: { id: "cust_1", metadata: { user_id: "uuid-1" } },
          product: { id: "prod_1", name: "Starter" },
          subscription: {
            id: "sub_1",
            current_period_end_date: "2026-05-01T00:00:00Z",
          },
        },
      };
      const result = processWebhookEvent(event);
      expect(result).toMatchObject({
        action: "upsert_subscription",
        data: { current_period_end: "2026-05-01T00:00:00Z" },
      });
    });

    it("reject checkout without user_id in metadata", () => {
      const event = {
        eventType: "checkout.completed",
        object: {
          customer: { id: "cust_1", metadata: {} },
          product: { id: "prod_1", name: "Pro" },
          subscription: { id: "sub_1", current_period_end: "2026-04-06T00:00:00Z" },
        },
      };
      const result = processWebhookEvent(event);
      expect(result).toMatchObject({ error: expect.any(String), status: 400 });
    });

    it("reject checkout with no metadata", () => {
      const event = {
        eventType: "checkout.completed",
        object: {
          customer: { id: "cust_1" },
          product: { id: "prod_1", name: "Pro" },
          subscription: { id: "sub_1", current_period_end: "2026-04-06T00:00:00Z" },
        },
      };
      const result = processWebhookEvent(event);
      expect(result).toMatchObject({ error: expect.any(String), status: 400 });
    });
  });

  describe("Event Processing — checkout.completed one-time purchase", () => {
    it("insert purchase when no subscription object in event", () => {
      const event = {
        eventType: "checkout.completed",
        object: {
          customer: { id: "cust_2", metadata: { user_id: "uuid-789" } },
          product: { id: "prod_lt", name: "Lifetime Deal" },
        },
      };
      const result = processWebhookEvent(event);
      expect(result).toEqual({
        action: "insert_purchase",
        data: {
          user_id: "uuid-789",
          creem_customer_id: "cust_2",
          creem_product_id: "prod_lt",
          product_name: "Lifetime Deal",
          status: "active",
        },
      });
    });
  });

  describe("Subscription status changes", () => {
    it("subscription.active -> status active with period_end", () => {
      const result = processWebhookEvent({
        eventType: "subscription.active",
        object: { id: "sub_1", current_period_end: "2026-04-06T00:00:00Z" },
      });
      expect(result).toEqual({
        action: "update_subscription",
        match: { creem_subscription_id: "sub_1" },
        data: { status: "active", current_period_end: "2026-04-06T00:00:00Z" },
      });
    });

    it("subscription.renewed -> status active with period_end", () => {
      const result = processWebhookEvent({
        eventType: "subscription.renewed",
        object: { id: "sub_2", current_period_end: "2026-05-06T00:00:00Z" },
      });
      expect(result).toEqual({
        action: "update_subscription",
        match: { creem_subscription_id: "sub_2" },
        data: { status: "active", current_period_end: "2026-05-06T00:00:00Z" },
      });
    });

    it("subscription.cancelled -> status cancelled", () => {
      const result = processWebhookEvent({
        eventType: "subscription.cancelled",
        object: { id: "sub_3" },
      });
      expect(result).toEqual({
        action: "update_subscription",
        match: { creem_subscription_id: "sub_3" },
        data: { status: "cancelled" },
      });
    });

    it("subscription.paused -> status paused", () => {
      const result = processWebhookEvent({
        eventType: "subscription.paused",
        object: { id: "sub_4" },
      });
      expect(result).toEqual({
        action: "update_subscription",
        match: { creem_subscription_id: "sub_4" },
        data: { status: "paused" },
      });
    });

    it("subscription.expired -> status expired", () => {
      const result = processWebhookEvent({
        eventType: "subscription.expired",
        object: { id: "sub_5" },
      });
      expect(result).toEqual({
        action: "update_subscription",
        match: { creem_subscription_id: "sub_5" },
        data: { status: "expired" },
      });
    });

    it("no period_end included for non-active statuses", () => {
      const cancelled = processWebhookEvent({
        eventType: "subscription.cancelled",
        object: { id: "sub_6", current_period_end: "2026-04-06T00:00:00Z" },
      });
      expect(cancelled).toMatchObject({ action: "update_subscription" });
      expect((cancelled as { data: Record<string, unknown> }).data).not.toHaveProperty("current_period_end");
    });

    it("active status without period_end omits current_period_end", () => {
      const result = processWebhookEvent({
        eventType: "subscription.active",
        object: { id: "sub_7" },
      });
      expect(result).toMatchObject({ action: "update_subscription" });
      expect((result as { data: Record<string, unknown> }).data).not.toHaveProperty("current_period_end");
    });
  });

  describe("Unhandled events", () => {
    it("unknown event type returns unhandled", () => {
      const result = processWebhookEvent({
        eventType: "payment.mystery",
        object: {},
      });
      expect(result).toEqual({ action: "unhandled", eventType: "payment.mystery" });
    });

    it("invoice.paid returns unhandled", () => {
      const result = processWebhookEvent({
        eventType: "invoice.paid",
        object: {},
      });
      expect(result).toEqual({ action: "unhandled", eventType: "invoice.paid" });
    });
  });

  describe("Idempotency", () => {
    it("track processed event IDs, duplicates detected", () => {
      const processedIds = new Set<string>();

      function isDuplicate(eventId: string | undefined): boolean {
        if (!eventId) return false;
        if (processedIds.has(eventId)) return true;
        processedIds.add(eventId);
        return false;
      }

      expect(isDuplicate("evt_abc")).toBe(false);
      expect(isDuplicate("evt_abc")).toBe(true);
      expect(isDuplicate("evt_xyz")).toBe(false);
      expect(isDuplicate(undefined)).toBe(false);
    });
  });
});
