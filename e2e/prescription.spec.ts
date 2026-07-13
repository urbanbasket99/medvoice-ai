import { expect, test } from "@playwright/test";

test.describe("Prescription", () => {
  test("lists prescriptions", async ({ page }) => {
    await page.goto("/prescriptions");
    await expect(page.getByRole("heading", { name: /prescriptions/i })).toBeVisible();
    await expect(page.getByRole("grid")).toBeVisible();
  });
});
