import { describe, expect, test } from "vitest";
import { validateCheckoutRequest } from "@/app/api/checkout/validators";

describe("validateCheckoutRequest", () => {
  test("rejects missing productId", () => {
    const result = validateCheckoutRequest({});
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("productId is required");
    }
  });

  test("rejects non-string productId", () => {
    const result = validateCheckoutRequest({ productId: 123 });
    expect(result.valid).toBe(false);
  });

  test("accepts valid productId", () => {
    const result = validateCheckoutRequest({ productId: "prod_abc123" });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.productId).toBe("prod_abc123");
    }
  });

  test("passes through discountCode when provided", () => {
    const result = validateCheckoutRequest({
      productId: "prod_abc123",
      discountCode: "LAUNCH20",
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.discountCode).toBe("LAUNCH20");
    }
  });

  test("ignores non-string discountCode", () => {
    const result = validateCheckoutRequest({
      productId: "prod_abc123",
      discountCode: 42,
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.discountCode).toBeUndefined();
    }
  });
});
