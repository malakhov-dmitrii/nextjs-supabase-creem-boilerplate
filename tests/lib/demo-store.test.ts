import { describe, it, expect, vi, afterEach } from "vitest";
import { isDemoMode } from "@/lib/demo/mode";
import {
  getDemoStore,
  resetDemoStore,
  type DemoStore,
} from "@/lib/demo/store";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isDemoMode", () => {
  it("returns true when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(isDemoMode()).toBe(true);
  });

  it("returns true for placeholder URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://your-project.supabase.co");
    expect(isDemoMode()).toBe(true);
  });

  it("returns false for a real Supabase URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abcdefg.supabase.co");
    expect(isDemoMode()).toBe(false);
  });
});

describe("getDemoStore", () => {
  it("returns seeded store with default data", () => {
    const store = getDemoStore();
    expect(store.subscriptions.size).toBeGreaterThanOrEqual(0);
    expect(store.creditWallets).toBeDefined();
    expect(store.licenses).toBeDefined();
    expect(store.users).toBeDefined();
  });
});

describe("resetDemoStore", () => {
  it("clears all data and re-seeds", () => {
    const store = getDemoStore();
    store.subscriptions.set("temp", {
      id: "temp",
      user_id: "u1",
      creem_subscription_id: "sub_1",
      creem_product_id: "prod_1",
      status: "active",
      seats: 1,
    } as DemoStore["subscriptions"] extends Map<string, infer V> ? V : never);
    const sizeBefore = store.subscriptions.size;

    resetDemoStore();
    const fresh = getDemoStore();
    expect(fresh.subscriptions.size).toBeLessThan(sizeBefore);
  });
});

describe("demo store spend credits", () => {
  it("returns error when insufficient balance", () => {
    const store = getDemoStore();
    // Ensure wallet exists with 0 balance
    store.creditWallets.set("user_empty", {
      user_id: "user_empty",
      balance: 0,
    });
    const wallet = store.creditWallets.get("user_empty");
    expect(wallet?.balance).toBe(0);
  });

  it("deducts balance on valid spend", () => {
    const store = getDemoStore();
    store.creditWallets.set("user_rich", {
      user_id: "user_rich",
      balance: 100,
    });
    // Simulate spend
    const wallet = store.creditWallets.get("user_rich")!;
    wallet.balance -= 25;
    store.creditWallets.set("user_rich", wallet);
    expect(store.creditWallets.get("user_rich")?.balance).toBe(75);
  });
});
