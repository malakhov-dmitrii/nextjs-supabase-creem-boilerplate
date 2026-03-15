import { describe, it, expect } from "vitest";
import { getServerIdx } from "@/lib/creem";

describe("getServerIdx", () => {
  it("returns 1 (test) for creem_test_ prefixed keys", () => {
    expect(getServerIdx("creem_test_abc123")).toBe(1);
  });

  it("returns 0 (production) for non-test keys", () => {
    expect(getServerIdx("creem_live_abc123")).toBe(0);
  });

  it("returns 0 for empty string", () => {
    expect(getServerIdx("")).toBe(0);
  });
});
