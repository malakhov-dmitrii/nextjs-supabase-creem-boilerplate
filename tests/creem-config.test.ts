import { describe, expect, it } from "vitest";

function getServerIdx(apiKey: string): 0 | 1 {
  return apiKey.startsWith("creem_test_") ? 1 : 0;
}

describe("Creem Config", () => {
  it("should use test server for test API keys", () => {
    expect(getServerIdx("creem_test_abc123")).toBe(1);
  });

  it("should use production server for live API keys", () => {
    expect(getServerIdx("creem_live_abc123")).toBe(0);
  });

  it("should use production server for unknown prefixes", () => {
    expect(getServerIdx("creem_abc123")).toBe(0);
  });
});
