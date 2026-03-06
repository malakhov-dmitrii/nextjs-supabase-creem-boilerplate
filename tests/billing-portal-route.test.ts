import { describe, expect, it } from "vitest";

type Subscription = {
  creem_customer_id?: string | null;
} | null;

// Pure validation logic matching what the billing portal API route enforces
function validateBillingPortalRequest(subscription: Subscription): { customerId: string } | { error: string; status: number } {
  if (!subscription) {
    return { error: "No active subscription found", status: 404 };
  }

  const customerId = subscription.creem_customer_id;

  if (!customerId) {
    return { error: "No customer ID on subscription", status: 400 };
  }

  return { customerId };
}

describe("Billing Portal Route Validation", () => {
  it("accepts subscription with customer ID", () => {
    const result = validateBillingPortalRequest({ creem_customer_id: "cust_abc123" });
    expect(result).toEqual({ customerId: "cust_abc123" });
  });

  it("rejects null subscription", () => {
    const result = validateBillingPortalRequest(null);
    expect(result).toMatchObject({ error: expect.any(String), status: 404 });
  });

  it("rejects subscription without customer ID", () => {
    const result = validateBillingPortalRequest({});
    expect(result).toMatchObject({ error: expect.any(String), status: 400 });
  });

  it("rejects subscription with empty customer ID", () => {
    const result = validateBillingPortalRequest({ creem_customer_id: "" });
    expect(result).toMatchObject({ error: expect.any(String), status: 400 });
  });
});
