import { expect, test } from "@playwright/test";

const staffCredentials = {
  email: "staff@swu.local",
  password: "StaffPass123!"
};

test("home page loads", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /swu erasmus staff mobility portal/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /open login/i })).toBeVisible();
});

test("login page loads", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: /access the institutional workspace/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});

test("main app shell renders after sign-in", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel(/email/i).fill(staffCredentials.email);
  await page.getByLabel(/password/i).fill(staffCredentials.password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /dashboard navigation/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /sign out/i })).toBeVisible();
});
