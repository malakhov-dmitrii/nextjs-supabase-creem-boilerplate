import { describe, expect, it } from "vitest";

type Feature = "analytics" | "api" | "support" | "priority_support" | "sso" | "custom_integrations" | "unlimited_projects" | "unlimited_team";

const PLAN_FEATURES: Record<string, Feature[]> = {
  starter: ["analytics", "support"],
  pro: ["analytics", "api", "support", "priority_support", "custom_integrations", "unlimited_projects"],
  enterprise: ["analytics", "api", "support", "priority_support", "sso", "custom_integrations", "unlimited_projects", "unlimited_team"],
};

function getPlanFeatures(productName: string): Feature[] {
  const key = productName.toLowerCase().split(" ")[0];
  return PLAN_FEATURES[key] ?? [];
}

function planHasFeature(productName: string, feature: Feature): boolean {
  return getPlanFeatures(productName).includes(feature);
}

describe("Entitlements", () => {
  describe("getPlanFeatures", () => {
    it("should return starter features", () => {
      expect(getPlanFeatures("Starter")).toEqual(["analytics", "support"]);
    });

    it("should return pro features", () => {
      const features = getPlanFeatures("Pro Plan");
      expect(features).toContain("api");
      expect(features).toContain("priority_support");
      expect(features).toContain("unlimited_projects");
    });

    it("should return enterprise features", () => {
      const features = getPlanFeatures("Enterprise");
      expect(features).toContain("sso");
      expect(features).toContain("unlimited_team");
    });

    it("should return empty array for unknown plans", () => {
      expect(getPlanFeatures("Unknown")).toEqual([]);
    });

    it("should be case-insensitive", () => {
      expect(getPlanFeatures("STARTER")).toEqual(getPlanFeatures("starter"));
    });
  });

  describe("planHasFeature", () => {
    it("should return true for included features", () => {
      expect(planHasFeature("Pro", "api")).toBe(true);
    });

    it("should return false for excluded features", () => {
      expect(planHasFeature("Starter", "sso")).toBe(false);
    });

    it("should return false for no plan", () => {
      expect(planHasFeature("", "api")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle product name with extra words", () => {
      expect(getPlanFeatures("Pro Plan Monthly")).toContain("api");
    });

    it("should handle empty string", () => {
      expect(getPlanFeatures("")).toEqual([]);
    });

    it("should handle whitespace-only string", () => {
      expect(getPlanFeatures("   ")).toEqual([]);
    });

    it("enterprise should include all pro features", () => {
      const proFeatures = getPlanFeatures("Pro");
      const enterpriseFeatures = getPlanFeatures("Enterprise");
      for (const feature of proFeatures) {
        expect(enterpriseFeatures).toContain(feature);
      }
    });

    it("pro should include all starter features", () => {
      const starterFeatures = getPlanFeatures("Starter");
      const proFeatures = getPlanFeatures("Pro");
      for (const feature of starterFeatures) {
        expect(proFeatures).toContain(feature);
      }
    });
  });
});
