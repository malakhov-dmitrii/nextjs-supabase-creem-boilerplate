import { expect, test } from "@playwright/test";

test.describe("Checkout Flow", () => {
  const testEmail = process.env.E2E_TEST_EMAIL || "e2e-test@example.com";
  const testPassword = process.env.E2E_TEST_PASSWORD || "testpassword123";

  test("unauthenticated user clicking subscribe triggers auth redirect or error", async ({
    page,
  }) => {
    await page.goto("/pricing");

    const subscribeButtons = page.getByRole("button", { name: /subscribe|get started/i });
    await subscribeButtons.first().click();

    // Should redirect to login or show an error
    await expect(
      page.getByRole("heading", { name: /sign in/i }).or(page.getByText(/unauthorized/i)),
    ).toBeVisible({ timeout: 10000 });
  });

  test("authenticated user clicking subscribe redirects to Creem checkout", async ({ page }) => {
    test.skip(!process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run");

    // Login first
    await page.goto("/login");
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password").fill(testPassword);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Go to pricing and subscribe
    await page.goto("/pricing");
    const subscribeButtons = page.getByRole("button", { name: /subscribe|get started/i });
    await subscribeButtons.first().click();

    // Should redirect to Creem checkout (test-api.creem.io or creem.io)
    await page.waitForURL(/(creem\.io|creem\.com)/, { timeout: 15000 });
    await expect(page.url()).toContain("creem");
  });
});

test.describe("Checkout Success Sync", () => {
  test("dashboard handles checkout success params gracefully", async ({ page }) => {
    // Visit dashboard with checkout params but unauthenticated — should redirect to login
    await page.goto("/dashboard?checkout=success&subscription_id=test&product_id=test");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
