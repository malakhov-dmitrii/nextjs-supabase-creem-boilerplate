// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PricingCard } from "@/components/pricing-card";

const mockPlan = {
  name: "Pro",
  price: "$29",
  period: "month",
  productId: "prod_test_123",
  features: ["Unlimited projects", "API access"],
  popular: false,
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("PricingCard", () => {
  it("renders plan name and price", () => {
    render(<PricingCard plan={mockPlan} />);
    expect(screen.getByText("Pro")).toBeTruthy();
    expect(screen.getByText("$29")).toBeTruthy();
  });

  it("renders all features", () => {
    render(<PricingCard plan={mockPlan} />);
    expect(screen.getByText("Unlimited projects")).toBeTruthy();
    expect(screen.getByText("API access")).toBeTruthy();
  });

  it("shows Most Popular badge for popular plans", () => {
    render(<PricingCard plan={{ ...mockPlan, popular: true }} />);
    expect(screen.getByText("Most Popular")).toBeTruthy();
  });

  it("does not show badge for non-popular plans", () => {
    render(<PricingCard plan={mockPlan} />);
    expect(screen.queryByText("Most Popular")).toBeNull();
  });

  it("shows Get Started button", () => {
    render(<PricingCard plan={mockPlan} />);
    expect(screen.getByRole("button", { name: /get started/i })).toBeTruthy();
  });

  it("calls /api/checkout on click with correct productId", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ url: "https://checkout.creem.io/test" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<PricingCard plan={mockPlan} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /get started/i }));
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "prod_test_123" }),
    });
  });

  it("shows Redirecting... loading state", async () => {
    let resolvePromise!: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => { resolvePromise = resolve; });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pendingPromise));

    render(<PricingCard plan={mockPlan} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /get started/i }));
    });

    expect(screen.getByText("Redirecting...")).toBeTruthy();
    // cleanup: resolve so no hanging promises
    resolvePromise({ json: () => Promise.resolve({}) });
  });

  it("redirects to /login on unauthorized response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ error: "Unauthorized" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    // jsdom doesn't navigate; intercept href assignment
    const hrefSetter = vi.fn();
    const locationMock = { ...window.location } as Location;
    Object.defineProperty(locationMock, "href", { set: hrefSetter, get: () => "" });
    vi.spyOn(window, "location", "get").mockReturnValue(locationMock);

    render(<PricingCard plan={mockPlan} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /get started/i }));
    });

    expect(hrefSetter).toHaveBeenCalledWith("/login");
    vi.restoreAllMocks();
  });
});
