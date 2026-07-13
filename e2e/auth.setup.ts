import { expect, test as setup } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@medvoice.com";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "Admin@123";

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).not.toHaveURL(/\/login$/);
  await page.context().storageState({ path: "e2e/.auth/admin.json" });
});
