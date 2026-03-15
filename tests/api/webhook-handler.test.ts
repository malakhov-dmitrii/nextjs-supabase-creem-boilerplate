import { describe, it, expect } from "vitest";
import {
  mapSubscriptionStatus,
  buildSubscriptionUpsert,
  buildSubscriptionUpdate,
} from "@/app/api/webhooks/creem/handlers";

describe("mapSubscriptionStatus", () => {
  const cases: [string, string][] = [
    ["subscription.canceled", "cancelled"],
    ["subscription.active", "active"],
    ["subscription.past_due", "past_due"],
    ["subscription.trialing", "trialing"],
    ["subscription.paused", "paused"],
    ["subscription.expired", "expired"],
    ["subscription.unpaid", "past_due"],
    ["subscription.paid", "active"],
    ["subscription.update", "active"],
  ];

  for (const [eventType, expected] of cases) {
    it(`maps ${eventType} → ${expected}`, () => {
      expect(mapSubscriptionStatus(eventType)).toBe(expected);
    });
  }

  it("returns null for unknown event types", () => {
    expect(mapSubscriptionStatus("checkout.completed")).toBeNull();
    expect(mapSubscriptionStatus("refund.created")).toBeNull();
    expect(mapSubscriptionStatus("dispute.created")).toBeNull();
    expect(mapSubscriptionStatus("unknown.event")).toBeNull();
  });
});

describe("buildSubscriptionUpsert", () => {
  it("builds upsert data from checkout.completed with subscription", () => {
    const result = buildSubscriptionUpsert({
      metadata: { user_id: "uid_1" },
      product: { id: "prod_1", name: "Pro Plan" },
      customer: { id: "cust_1" },
      subscription: {
        id: "sub_1",
        current_period_end_date: new Date("2026-04-01"),
        canceled_at: null,
      },
    });

    expect(result.user_id).toBe("uid_1");
    expect(result.creem_customer_id).toBe("cust_1");
    expect(result.creem_subscription_id).toBe("sub_1");
    expect(result.creem_product_id).toBe("prod_1");
    expect(result.product_name).toBe("Pro Plan");
    expect(result.status).toBe("active");
  });

  it("builds upsert for one-time purchase (no subscription)", () => {
    const result = buildSubscriptionUpsert({
      metadata: { user_id: "uid_99" },
      product: { id: "prod_lt", name: "Lifetime" },
      customer: { id: "cust_2" },
    });

    expect(result.user_id).toBe("uid_99");
    expect(result.creem_subscription_id).toBeUndefined();
    expect(result.status).toBe("active");
  });

  it("returns undefined user_id when metadata is missing", () => {
    const result = buildSubscriptionUpsert({
      product: { id: "prod_1", name: "Pro" },
      customer: { id: "cust_1" },
    });

    expect(result.user_id).toBeUndefined();
  });
});

describe("buildSubscriptionUpdate", () => {
  it("builds update with period end for active status", () => {
    const result = buildSubscriptionUpdate("active", {
      current_period_end_date: new Date("2026-05-01"),
    });

    expect(result.status).toBe("active");
    expect(result.current_period_end).toBeDefined();
  });

  it("includes cancel_at for scheduled_cancel status", () => {
    const result = buildSubscriptionUpdate("scheduled_cancel", {
      canceled_at: new Date("2026-04-15"),
      current_period_end_date: new Date("2026-05-01"),
    });

    expect(result.status).toBe("scheduled_cancel");
    expect(result.cancel_at).toBeDefined();
  });

  it("sets minimal fields for terminal statuses", () => {
    const result = buildSubscriptionUpdate("expired", {});

    expect(result.status).toBe("expired");
    expect(result.current_period_end).toBeUndefined();
    expect(result.cancel_at).toBeUndefined();
  });
});
