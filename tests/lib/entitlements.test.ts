import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  getPlanFeatures,
  planHasFeature,
  hasAccess,
  PLAN_FEATURES,
} from "@/lib/entitlements";

// Mock Supabase admin for hasAccess tests
const mockMaybeSingle = vi.fn();
const mockEqStatus = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockEqUser = vi.fn(() => ({ eq: mockEqStatus }));
const mockSelect = vi.fn(() => ({ eq: mockEqUser }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}));

describe("PLAN_FEATURES", () => {
  test("starter has exactly analytics and support", () => {
    expect(PLAN_FEATURES.starter).toEqual(["analytics", "support"]);
  });

  test("pro includes api and priority_support", () => {
    expect(PLAN_FEATURES.pro).toContain("api");
    expect(PLAN_FEATURES.pro).toContain("priority_support");
    expect(PLAN_FEATURES.pro).toContain("custom_integrations");
  });

  test("enterprise includes all features including sso and unlimited_team", () => {
    expect(PLAN_FEATURES.enterprise).toContain("sso");
    expect(PLAN_FEATURES.enterprise).toContain("unlimited_team");
    expect(PLAN_FEATURES.enterprise).toContain("api");
  });
});

describe("getPlanFeatures", () => {
  test("returns starter features for 'starter'", () => {
    expect(getPlanFeatures("starter")).toEqual(PLAN_FEATURES.starter);
  });

  test("returns pro features for 'pro'", () => {
    expect(getPlanFeatures("pro")).toEqual(PLAN_FEATURES.pro);
  });

  test("returns enterprise features for 'enterprise'", () => {
    expect(getPlanFeatures("enterprise")).toEqual(PLAN_FEATURES.enterprise);
  });

  test("returns empty array for unknown plan", () => {
    expect(getPlanFeatures("nonexistent")).toEqual([]);
  });

  test("case-insensitive: 'Pro Plan' extracts 'pro'", () => {
    expect(getPlanFeatures("Pro Plan")).toEqual(PLAN_FEATURES.pro);
  });

  test("case-insensitive: 'ENTERPRISE' works", () => {
    expect(getPlanFeatures("ENTERPRISE")).toEqual(PLAN_FEATURES.enterprise);
  });
});

describe("planHasFeature", () => {
  test("pro has analytics", () => {
    expect(planHasFeature("pro", "analytics")).toBe(true);
  });

  test("starter lacks api", () => {
    expect(planHasFeature("starter", "api")).toBe(false);
  });

  test("enterprise has sso", () => {
    expect(planHasFeature("enterprise", "sso")).toBe(true);
  });

  test("starter lacks sso", () => {
    expect(planHasFeature("starter", "sso")).toBe(false);
  });
});

describe("hasAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns true for active subscription with matching feature", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { product_name: "Pro Plan", status: "active" },
      error: null,
    });

    const result = await hasAccess("user-123", "api");
    expect(result).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith("subscriptions");
    expect(mockSelect).toHaveBeenCalledWith("product_name, status");
    expect(mockEqUser).toHaveBeenCalledWith("user_id", "user-123");
    expect(mockEqStatus).toHaveBeenCalledWith("status", "active");
  });

  test("returns false when no subscription exists", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await hasAccess("user-456", "api");
    expect(result).toBe(false);
  });

  test("returns false when subscription lacks the feature", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { product_name: "Starter Plan", status: "active" },
      error: null,
    });

    const result = await hasAccess("user-789", "sso");
    expect(result).toBe(false);
  });
});
