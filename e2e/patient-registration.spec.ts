import { expect, test } from "@playwright/test";

test.describe("Patient Registration", () => {
  test("registers a new patient", async ({ page }) => {
    const unique = Date.now();
    await page.goto("/patients/new");
    await page.getByLabel("First Name").fill(`E2E${unique}`);
    await page.getByLabel("Last Name").fill("Patient");
    await page.getByLabel("Date of Birth").fill("1992-03-15");
    await page.getByLabel("Gender").click();
    await page.getByRole("option", { name: "Male" }).click();
    await page.getByLabel("Mobile").fill(`9876${String(unique).slice(-6)}`);
    await page.getByRole("button", { name: "Register Patient" }).click();
    await expect(page).toHaveURL(/\/patients\/[0-9a-f-]+$/);
  });
});
