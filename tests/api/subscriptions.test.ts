import { describe, it, expect } from "vitest";
import {
  validateCancelRequest,
  validateUpgradeRequest,
  validateSeatUpdate,
} from "@/app/api/subscriptions/validators";

describe("validateCancelRequest", () => {
  it("accepts valid immediate cancel", () => {
    const result = validateCancelRequest({
      subscriptionId: "sub_1",
      mode: "immediate",
    });
    expect(result.valid).toBe(true);
  });

  it("accepts valid scheduled cancel", () => {
    const result = validateCancelRequest({
      subscriptionId: "sub_1",
      mode: "scheduled",
    });
    expect(result.valid).toBe(true);
  });

  it("defaults mode to scheduled when omitted", () => {
    const result = validateCancelRequest({ subscriptionId: "sub_1" });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.mode).toBe("scheduled");
    }
  });

  it("rejects missing subscriptionId", () => {
    const result = validateCancelRequest({ mode: "immediate" });
    expect(result.valid).toBe(false);
  });

  it("rejects invalid mode string", () => {
    const result = validateCancelRequest({
      subscriptionId: "sub_1",
      mode: "now",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("mode");
    }
  });
});

describe("validateUpgradeRequest", () => {
  it("accepts valid upgrade", () => {
    const result = validateUpgradeRequest({
      subscriptionId: "sub_1",
      newProductId: "prod_2",
    });
    expect(result.valid).toBe(true);
  });

  it("rejects missing subscriptionId", () => {
    const result = validateUpgradeRequest({ newProductId: "prod_2" });
    expect(result.valid).toBe(false);
  });

  it("rejects missing newProductId", () => {
    const result = validateUpgradeRequest({ subscriptionId: "sub_1" });
    expect(result.valid).toBe(false);
  });
});

describe("validateSeatUpdate", () => {
  it("accepts positive seat count", () => {
    const result = validateSeatUpdate({
      subscriptionId: "sub_1",
      units: 5,
    });
    expect(result.valid).toBe(true);
  });

  it("rejects zero seats", () => {
    const result = validateSeatUpdate({
      subscriptionId: "sub_1",
      units: 0,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects negative seats", () => {
    const result = validateSeatUpdate({
      subscriptionId: "sub_1",
      units: -3,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects missing subscriptionId", () => {
    const result = validateSeatUpdate({ units: 5 });
    expect(result.valid).toBe(false);
  });
});
