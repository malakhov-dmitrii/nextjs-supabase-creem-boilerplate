import { describe, it, expect } from "vitest";
import { formatTransaction } from "@/app/api/transactions/helpers";

describe("formatTransaction", () => {
  it("formats USD amount correctly", () => {
    const result = formatTransaction({
      id: "tx_1",
      amount: 2900,
      currency: "usd",
      status: "completed",
      created_at: "2026-03-01T00:00:00Z",
    });
    expect(result.displayAmount).toBe("$29.00");
  });

  it("formats EUR amount correctly", () => {
    const result = formatTransaction({
      id: "tx_2",
      amount: 990,
      currency: "eur",
      status: "completed",
      created_at: "2026-03-01T00:00:00Z",
    });
    expect(result.displayAmount).toBe("€9.90");
  });

  it("defaults unknown currency to USD", () => {
    const result = formatTransaction({
      id: "tx_3",
      amount: 100,
      currency: "xyz",
      status: "completed",
      created_at: "2026-03-01T00:00:00Z",
    });
    expect(result.displayAmount).toBe("$1.00");
  });

  it("handles zero amount", () => {
    const result = formatTransaction({
      id: "tx_4",
      amount: 0,
      currency: "usd",
      status: "pending",
      created_at: "2026-03-01T00:00:00Z",
    });
    expect(result.displayAmount).toBe("$0.00");
  });
});
