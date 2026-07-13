import { expect, test } from "@playwright/test";

test.describe("Billing", () => {
  test("lists invoices", async ({ page }) => {
    await page.goto("/billing/invoices");
    await expect(page.getByRole("heading", { name: /invoices|billing/i })).toBeVisible();
    await expect(page.getByRole("grid")).toBeVisible();
  });
});
