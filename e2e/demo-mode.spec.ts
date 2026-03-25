import { expect, test } from "@playwright/test";

test.describe("Demo Mode (no credentials required)", () => {
  test("landing page loads with hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("SaaSKit")).toBeVisible();
  });

  test("pricing page shows all three plans", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("Starter")).toBeVisible();
    await expect(page.getByText("Pro")).toBeVisible();
    await expect(page.getByText("Enterprise")).toBeVisible();
  });

  test("pricing page has clickable checkout buttons", async ({ page }) => {
    await page.goto("/pricing");
    const buttons = page.getByRole("button", { name: /get started/i });
    await expect(buttons.first()).toBeVisible();
    await expect(buttons).toHaveCount(3);
  });

  test("demo checkout redirects to dashboard", async ({ page }) => {
    await page.goto("/pricing");
    const firstButton = page.getByRole("button", { name: /get started/i }).first();
    await firstButton.click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test("dashboard is accessible in demo mode", async ({ page }) => {
    await page.goto("/dashboard");
    // In demo mode, middleware bypasses auth — page should load
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
