import { expect, test } from "@playwright/test";

test.describe("Authentication Pages", () => {
  test.describe("Login Page", () => {
    test("renders login form", async ({ page }) => {
      await page.goto("/login");

      await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
      await expect(page.getByLabel("Email")).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();
      await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible();
    });

    test("shows validation on empty submit", async ({ page }) => {
      await page.goto("/login");
      await page.getByRole("button", { name: "Sign In" }).click();
      // HTML5 required validation prevents submission
      await expect(page).toHaveURL("/login");
    });

    test("shows error for invalid credentials", async ({ page }) => {
      await page.goto("/login");
      await page.getByLabel("Email").fill("nonexistent@example.com");
      await page.getByLabel("Password").fill("wrongpassword");
      await page.getByRole("button", { name: "Sign In" }).click();

      await expect(page.getByText(/invalid|Invalid/i)).toBeVisible({ timeout: 10000 });
    });

    test("navigates to signup page", async ({ page }) => {
      await page.goto("/login");
      await page.getByRole("link", { name: "Sign Up" }).click();
      await expect(page).toHaveURL("/signup");
    });
  });

  test.describe("Signup Page", () => {
    test("renders signup form", async ({ page }) => {
      await page.goto("/signup");

      await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
      await expect(page.getByLabel("Email")).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();
      await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
    });

    test("shows validation on empty submit", async ({ page }) => {
      await page.goto("/signup");
      await page.getByRole("button", { name: "Sign Up" }).click();
      await expect(page).toHaveURL("/signup");
    });

    test("navigates to login page", async ({ page }) => {
      await page.goto("/signup");
      await page.getByRole("link", { name: "Sign In" }).click();
      await expect(page).toHaveURL("/login");
    });

    test("shows loading state during submission", async ({ page }) => {
      await page.goto("/signup");
      await page.getByLabel("Email").fill("test-e2e@example.com");
      await page.getByLabel("Password").fill("testpassword123");
      await page.getByRole("button", { name: "Sign Up" }).click();

      // Should show loading state or redirect to dashboard
      await expect(
        page.getByText("Creating account..."),
      ).toBeVisible({ timeout: 5000 }).catch(() => {
        // Already redirected to dashboard
        return expect(page).toHaveURL(/\/dashboard/);
      });
    });
  });
});
