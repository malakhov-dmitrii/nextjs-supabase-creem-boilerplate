import { describe, expect, test } from "vitest";
import { CREDIT_UNLIMITED, getCreditAllocation, isUnlimited } from "@/app/api/credits/helpers";

describe("getCreditAllocation", () => {
  test("returns -1 (unlimited) for enterprise", () => {
    expect(getCreditAllocation("enterprise")).toBe(CREDIT_UNLIMITED);
  });

  test("returns 500 for pro", () => {
    expect(getCreditAllocation("pro")).toBe(500);
  });

  test("returns 100 for starter", () => {
    expect(getCreditAllocation("starter")).toBe(100);
  });

  test("returns 100 for unknown plan", () => {
    expect(getCreditAllocation("nonexistent")).toBe(100);
  });

  test("is case-insensitive", () => {
    expect(getCreditAllocation("Enterprise")).toBe(CREDIT_UNLIMITED);
    expect(getCreditAllocation("PRO")).toBe(500);
  });
});

describe("isUnlimited", () => {
  test("returns true for CREDIT_UNLIMITED (-1)", () => {
    expect(isUnlimited(CREDIT_UNLIMITED)).toBe(true);
  });

  test("returns false for 0", () => {
    expect(isUnlimited(0)).toBe(false);
  });

  test("returns false for positive balance", () => {
    expect(isUnlimited(500)).toBe(false);
  });
});
