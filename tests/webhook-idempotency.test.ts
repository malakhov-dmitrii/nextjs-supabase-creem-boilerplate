import { describe, expect, it } from "vitest";

// Simulate the duplicate detection logic used in the webhook handler
function isDuplicate(
  existingIds: Set<string>,
  eventId: string | undefined,
): boolean {
  if (!eventId) return false;
  return existingIds.has(eventId);
}

describe("Webhook Idempotency", () => {
  it("should detect duplicate events by id", () => {
    const processedIds = new Set(["evt_123", "evt_456"]);
    expect(isDuplicate(processedIds, "evt_123")).toBe(true);
  });

  it("should not flag new event ids as duplicates", () => {
    const processedIds = new Set(["evt_123"]);
    expect(isDuplicate(processedIds, "evt_999")).toBe(false);
  });

  it("should not flag events without an id as duplicates", () => {
    const processedIds = new Set(["evt_123"]);
    expect(isDuplicate(processedIds, undefined)).toBe(false);
  });
});
