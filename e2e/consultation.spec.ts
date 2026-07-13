import { expect, test } from "@playwright/test";

test.describe("Consultation", () => {
  test("lists consultations", async ({ page }) => {
    await page.goto("/consultations");
    await expect(page.getByRole("heading", { name: /consultations/i })).toBeVisible();
    await expect(page.getByRole("grid")).toBeVisible();
  });
});
