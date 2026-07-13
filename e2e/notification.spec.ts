import { expect, test } from "@playwright/test";

test.describe("Notifications", () => {
  test("opens notification center", async ({ page }) => {
    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: /notification center/i })).toBeVisible();
  });
});
