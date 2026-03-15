import { describe, it, expect } from "vitest";
import {
  validateSpendRequest,
  isUnlimited,
  CREDIT_UNLIMITED,
} from "@/app/api/credits/helpers";

describe("isUnlimited", () => {
  it("returns true for CREDIT_UNLIMITED sentinel", () => {
    expect(isUnlimited(CREDIT_UNLIMITED)).toBe(true);
  });

  it("returns false for zero", () => {
    expect(isUnlimited(0)).toBe(false);
  });

  it("returns false for positive number", () => {
    expect(isUnlimited(100)).toBe(false);
  });
});

describe("validateSpendRequest", () => {
  it("accepts valid spend", () => {
    const result = validateSpendRequest({ amount: 10, reason: "API call" });
    expect(result.valid).toBe(true);
  });

  it("rejects zero amount", () => {
    const result = validateSpendRequest({ amount: 0, reason: "test" });
    expect(result.valid).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = validateSpendRequest({ amount: -5, reason: "test" });
    expect(result.valid).toBe(false);
  });

  it("rejects missing reason", () => {
    const result = validateSpendRequest({ amount: 10 });
    expect(result.valid).toBe(false);
  });

  it("rejects empty string reason", () => {
    const result = validateSpendRequest({ amount: 5, reason: "" });
    expect(result.valid).toBe(false);
  });
});
