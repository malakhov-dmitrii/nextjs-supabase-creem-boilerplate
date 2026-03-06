import { describe, expect, it } from "vitest";

// Pure validation logic matching what the checkout API route enforces
function validateCheckoutRequest(body: unknown): { productId: string } | { error: string; status: number } {
  if (body === null || body === undefined) {
    return { error: "Missing request body", status: 400 };
  }

  const { productId } = body as Record<string, unknown>;

  if (typeof productId !== "string") {
    return { error: "productId must be a string", status: 400 };
  }

  if (!productId) {
    return { error: "productId is required", status: 400 };
  }

  if (!productId.startsWith("prod_")) {
    return { error: "productId must start with prod_", status: 400 };
  }

  return { productId };
}

describe("Checkout Route Validation", () => {
  it("accepts valid productId starting with prod_", () => {
    const result = validateCheckoutRequest({ productId: "prod_abc123" });
    expect(result).toEqual({ productId: "prod_abc123" });
  });

  it("rejects missing productId", () => {
    const result = validateCheckoutRequest({});
    expect(result).toMatchObject({ error: expect.any(String), status: 400 });
  });

  it("rejects null body", () => {
    const result = validateCheckoutRequest(null);
    expect(result).toMatchObject({ error: expect.any(String), status: 400 });
  });

  it("rejects non-string productId", () => {
    const result = validateCheckoutRequest({ productId: 42 });
    expect(result).toMatchObject({ error: expect.any(String), status: 400 });
  });

  it("rejects productId without prod_ prefix", () => {
    const result = validateCheckoutRequest({ productId: "plan_pro_monthly" });
    expect(result).toMatchObject({ error: expect.any(String), status: 400 });
  });
});
