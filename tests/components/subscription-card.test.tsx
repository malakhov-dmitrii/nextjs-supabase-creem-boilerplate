// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubscriptionCard } from "@/components/subscription-card";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const mockSub = {
  status: "active",
  product_name: "Pro Plan",
  current_period_end: "2026-04-01T00:00:00Z",
  creem_customer_id: "cust_123",
};

describe("SubscriptionCard", () => {
  it("shows No active subscription. when null", () => {
    render(<SubscriptionCard subscription={null} />);
    expect(screen.getByText("No active subscription.")).toBeTruthy();
  });

  it("shows View Plans link when no subscription", () => {
    render(<SubscriptionCard subscription={null} />);
    const link = screen.getByRole("link", { name: /view plans/i });
    expect(link).toBeTruthy();
  });

  it("shows plan name for active sub", () => {
    render(<SubscriptionCard subscription={mockSub} />);
    expect(screen.getByText("Pro Plan")).toBeTruthy();
  });

  it("shows active status badge", () => {
    render(<SubscriptionCard subscription={mockSub} />);
    expect(screen.getByText("active")).toBeTruthy();
  });

  it("shows cancelled status", () => {
    render(<SubscriptionCard subscription={{ ...mockSub, status: "cancelled" }} />);
    expect(screen.getByText("cancelled")).toBeTruthy();
  });

  it("shows paused status", () => {
    render(<SubscriptionCard subscription={{ ...mockSub, status: "paused" }} />);
    expect(screen.getByText("paused")).toBeTruthy();
  });

  it("shows billing date when present", () => {
    render(<SubscriptionCard subscription={mockSub} />);
    expect(screen.getByText("Next billing")).toBeTruthy();
  });

  it("shows Manage Billing button", () => {
    render(<SubscriptionCard subscription={mockSub} />);
    expect(screen.getByRole("button", { name: /manage billing/i })).toBeTruthy();
  });
});
