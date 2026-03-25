import { describe, expect, test } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  test("returns success:true without Redis configured", async () => {
    const result = await checkRateLimit("test-user");
    expect(result.success).toBe(true);
  });

  test("returns success:true for different identifiers", async () => {
    const result1 = await checkRateLimit("user-1");
    const result2 = await checkRateLimit("user-2");
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
  });
});
