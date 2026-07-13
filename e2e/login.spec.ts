import { expect, test } from "@playwright/test";

test.describe("Login", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@medvoice.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("signs in with valid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL ?? "admin@medvoice.com");
    await page.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD ?? "Admin@123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Welcome back/i);
  });
});
