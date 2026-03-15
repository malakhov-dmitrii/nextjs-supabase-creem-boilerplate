import { describe, it, expect } from "vitest";
import {
  validateDiscountCreate,
  buildCheckoutWithDiscount,
} from "@/app/api/discounts/helpers";

describe("validateDiscountCreate", () => {
  it("accepts valid percentage discount", () => {
    const result = validateDiscountCreate({
      name: "Summer Sale",
      type: "percentage",
      percentage: 20,
      duration: "once",
      appliesToProducts: ["prod_1"],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects percentage > 100", () => {
    const result = validateDiscountCreate({
      name: "Too Much",
      type: "percentage",
      percentage: 150,
      duration: "once",
      appliesToProducts: ["prod_1"],
    });
    expect(result.valid).toBe(false);
  });

  it("accepts valid fixed discount", () => {
    const result = validateDiscountCreate({
      name: "$5 Off",
      type: "fixed",
      amount: 500,
      duration: "forever",
      appliesToProducts: ["prod_1"],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects fixed with zero amount", () => {
    const result = validateDiscountCreate({
      name: "Zero",
      type: "fixed",
      amount: 0,
      duration: "once",
      appliesToProducts: ["prod_1"],
    });
    expect(result.valid).toBe(false);
  });

  it("rejects missing appliesToProducts", () => {
    const result = validateDiscountCreate({
      name: "No Products",
      type: "percentage",
      percentage: 10,
      duration: "once",
    });
    expect(result.valid).toBe(false);
  });
});

describe("buildCheckoutWithDiscount", () => {
  it("includes discount code in checkout params", () => {
    const params = buildCheckoutWithDiscount("prod_1", "http://ok.com", "SUMMER20", "uid_1");
    expect(params.discountCode).toBe("SUMMER20");
    expect(params.productId).toBe("prod_1");
  });

  it("omits discount code when not provided", () => {
    const params = buildCheckoutWithDiscount("prod_1", "http://ok.com", undefined, "uid_1");
    expect(params.discountCode).toBeUndefined();
  });

  it("includes user_id in metadata", () => {
    const params = buildCheckoutWithDiscount("prod_1", "http://ok.com", "CODE", "uid_1");
    expect(params.metadata?.user_id).toBe("uid_1");
  });
});
