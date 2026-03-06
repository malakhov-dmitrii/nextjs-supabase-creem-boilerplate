import { expect, test } from "@playwright/test";

test.describe("Pricing Page", () => {
  test("renders all three pricing plans", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByRole("heading", { name: /simple.*transparent.*pricing/i })).toBeVisible();

    // Plan names
    await expect(page.getByRole("heading", { name: "Starter" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pro" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Enterprise" })).toBeVisible();

    // Prices
    await expect(page.getByText("$9", { exact: true })).toBeVisible();
    await expect(page.getByText("$29", { exact: true })).toBeVisible();
    await expect(page.getByText("$99", { exact: true })).toBeVisible();
  });

  test("highlights Pro plan as popular", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByText("Most Popular")).toBeVisible();
  });

  test("shows plan features", async ({ page }) => {
    await page.goto("/pricing");

    // Starter features
    await expect(page.getByText("3 projects")).toBeVisible();
    await expect(page.getByText("Basic analytics")).toBeVisible();

    // Pro features
    await expect(page.getByText("Unlimited projects")).toBeVisible();
    await expect(page.getByText("Advanced analytics")).toBeVisible();
    await expect(page.getByText("API access")).toBeVisible();

    // Enterprise features
    await expect(page.getByText("SSO / SAML")).toBeVisible();
    await expect(page.getByText("SLA guarantee")).toBeVisible();
  });

  test("has subscribe buttons for each plan", async ({ page }) => {
    await page.goto("/pricing");

    const buttons = page.getByRole("button", { name: /subscribe|get started/i });
    await expect(buttons).toHaveCount(3);
  });

  test("header links work", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByRole("link", { name: "SaaSKit" })).toBeVisible();
    await page.getByRole("link", { name: "SaaSKit" }).click();
    await expect(page).toHaveURL("/");
  });

  test("shows Creem branding in footer", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByText("Creem").first()).toBeVisible();
  });
});
