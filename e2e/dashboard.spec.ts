import { expect, test } from "@playwright/test";

test.describe("Dashboard", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");

    // Should redirect to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

test.describe("Dashboard (authenticated)", () => {
  const testEmail = process.env.E2E_TEST_EMAIL;
  const testPassword = process.env.E2E_TEST_PASSWORD;

  test.skip(!testEmail || !testPassword, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run");

  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password").fill(testPassword);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Wait for dashboard redirect
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  });

  test("shows dashboard with user email", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText(testEmail)).toBeVisible();
  });

  test("shows subscription card", async ({ page }) => {
    // Should show subscription status (active or upgrade prompt)
    await expect(
      page.getByText("Subscription").or(page.getByText("No Active Plan")),
    ).toBeVisible();
  });

  test("shows features section", async ({ page }) => {
    await expect(page.getByText("Your SaaS Features")).toBeVisible();
  });

  test("has sign out button", async ({ page }) => {
    const signOut = page.getByRole("button", { name: /sign out/i });
    await expect(signOut).toBeVisible();
  });

  test("sign out logs user out", async ({ page }) => {
    await page.getByRole("button", { name: /sign out/i }).click();
    // App redirects away from dashboard after sign out
    await page.waitForURL((url) => !url.pathname.startsWith("/dashboard"), { timeout: 10000 });
  });
});
