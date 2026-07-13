import { expect, test } from "@playwright/test";

test.describe("Appointment Booking", () => {
  test("opens appointment creation page", async ({ page }) => {
    await page.goto("/appointments/new");
    await expect(page.getByText("Participants")).toBeVisible();
    await expect(page.getByText("Schedule")).toBeVisible();
  });

  test("lists appointments", async ({ page }) => {
    await page.goto("/appointments");
    await expect(page.getByRole("heading", { name: /appointments/i })).toBeVisible();
    await expect(page.getByRole("grid")).toBeVisible();
  });
});
