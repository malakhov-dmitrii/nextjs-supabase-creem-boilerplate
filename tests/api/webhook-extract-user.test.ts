import { describe, expect, test } from "vitest";
import { extractUserId } from "@/app/api/webhooks/creem/handlers";

describe("extractUserId", () => {
  test("reads user_id from metadata", () => {
    expect(extractUserId({ user_id: "abc-123" })).toBe("abc-123");
  });

  test("returns undefined for empty metadata", () => {
    expect(extractUserId(undefined)).toBeUndefined();
  });

  test("returns undefined when user_id is missing", () => {
    expect(extractUserId({ other_key: "value" })).toBeUndefined();
  });

  test("returns undefined for empty object", () => {
    expect(extractUserId({})).toBeUndefined();
  });
});
