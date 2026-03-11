import { expect, test } from "@playwright/test";

test("home page is reachable", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /swu erasmus staff mobility portal/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /open login/i })).toBeVisible();
});
