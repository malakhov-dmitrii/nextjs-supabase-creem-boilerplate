import { describe, expect, it } from "vitest";

// Test webhook event parsing and routing
function parseWebhookEvent(body: string) {
  const event = JSON.parse(body);
  return {
    eventType: event.event_type,
    object: event.object,
  };
}

function getSubscriptionUpdate(eventType: string, object: Record<string, unknown>) {
  switch (eventType) {
    case "checkout.completed": {
      const { customer, product, subscription } = object as {
        customer: { id: string; metadata?: { user_id?: string } };
        product: { id: string; name: string };
        subscription?: { id: string; current_period_end: string };
      };
      return {
        action: "upsert",
        data: {
          user_id: customer.metadata?.user_id,
          creem_customer_id: customer.id,
          creem_subscription_id: subscription?.id,
          creem_product_id: product.id,
          product_name: product.name,
          status: "active",
          current_period_end: subscription?.current_period_end,
        },
      };
    }

    case "subscription.active":
    case "subscription.renewed":
      return {
        action: "update",
        match: { creem_subscription_id: (object as { id: string }).id },
        data: {
          status: "active",
          current_period_end: (object as { current_period_end: string }).current_period_end,
        },
      };

    case "subscription.cancelled":
      return {
        action: "update",
        match: { creem_subscription_id: (object as { id: string }).id },
        data: { status: "cancelled" },
      };

    case "subscription.expired":
      return {
        action: "update",
        match: { creem_subscription_id: (object as { id: string }).id },
        data: { status: "expired" },
      };

    case "subscription.paused":
      return {
        action: "update",
        match: { creem_subscription_id: (object as { id: string }).id },
        data: { status: "paused" },
      };

    default:
      return null;
  }
}

describe("Webhook Event Parsing", () => {
  it("should parse checkout.completed event", () => {
    const body = JSON.stringify({
      event_type: "checkout.completed",
      object: {
        customer: { id: "cust_123", metadata: { user_id: "uuid-456" } },
        product: { id: "prod_789", name: "Pro Plan" },
        subscription: { id: "sub_012", current_period_end: "2026-04-06T00:00:00Z" },
      },
    });

    const { eventType, object } = parseWebhookEvent(body);
    expect(eventType).toBe("checkout.completed");

    const result = getSubscriptionUpdate(eventType, object);
    expect(result).toEqual({
      action: "upsert",
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

  it("should handle checkout without subscription (one-time purchase)", () => {
    const body = JSON.stringify({
      event_type: "checkout.completed",
      object: {
        customer: { id: "cust_123", metadata: { user_id: "uuid-456" } },
        product: { id: "prod_789", name: "Lifetime Deal" },
      },
    });

    const { eventType, object } = parseWebhookEvent(body);
    const result = getSubscriptionUpdate(eventType, object);
    expect(result!.data.creem_subscription_id).toBeUndefined();
    expect(result!.data.status).toBe("active");
  });

  it("should handle subscription.cancelled", () => {
    const result = getSubscriptionUpdate("subscription.cancelled", { id: "sub_123" });
    expect(result).toEqual({
      action: "update",
      match: { creem_subscription_id: "sub_123" },
      data: { status: "cancelled" },
    });
  });

  it("should handle subscription.renewed", () => {
    const result = getSubscriptionUpdate("subscription.renewed", {
      id: "sub_123",
      current_period_end: "2026-05-06T00:00:00Z",
    });
    expect(result).toEqual({
      action: "update",
      match: { creem_subscription_id: "sub_123" },
      data: { status: "active", current_period_end: "2026-05-06T00:00:00Z" },
    });
  });

  it("should handle subscription.paused", () => {
    const result = getSubscriptionUpdate("subscription.paused", { id: "sub_123" });
    expect(result!.data.status).toBe("paused");
  });

  it("should handle subscription.expired", () => {
    const result = getSubscriptionUpdate("subscription.expired", { id: "sub_123" });
    expect(result!.data.status).toBe("expired");
  });

  it("should return null for unknown events", () => {
    const result = getSubscriptionUpdate("unknown.event", {});
    expect(result).toBeNull();
  });
});
