import { expect, test } from "@playwright/test";

test.describe("Global Search", () => {
  test("opens search dialog from header", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /search/i }).click();
    await expect(page.getByRole("dialog", { name: /global search/i })).toBeVisible();
    await page.getByPlaceholder(/search the hospital system/i).fill("test");
    await expect(page.getByText(/use ↑ ↓ to navigate/i)).toBeVisible();
  });
});
