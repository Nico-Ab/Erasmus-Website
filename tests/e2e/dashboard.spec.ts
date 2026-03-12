import { expect, test, type Page } from "@playwright/test";

const adminCredentials = {
  email: "admin@swu.local",
  password: "AdminPass123!"
};

const officerCredentials = {
  email: "officer@swu.local",
  password: "OfficerPass123!"
};

const staffCredentials = {
  email: "staff@swu.local",
  password: "StaffPass123!"
};

async function signInWith(page: Page, credentials: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test("staff users see the staff dashboard only", async ({ page }) => {
  await signInWith(page, staffCredentials);
  await page.goto("/dashboard/staff");

  await expect(page.getByRole("heading", { name: /staff operational dashboard/i })).toBeVisible();
  await expect(page.getByText(/own cases overview/i)).toBeVisible();
  await expect(page.getByText(/latest comments/i)).toBeVisible();

  await page.goto("/dashboard/officer");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/admin");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("officer users see the review dashboard without admin-only actions", async ({ page }) => {
  await signInWith(page, officerCredentials);
  await page.goto("/dashboard/officer");

  await expect(page.getByRole("heading", { name: /officer review dashboard/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^open reviews$/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /current academic year overview/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /open user management/i })).toHaveCount(0);
});

test("admin users see the admin operations dashboard and workspace actions", async ({ page }) => {
  await signInWith(page, adminCredentials);
  await page.goto("/dashboard/admin");

  await expect(page.getByRole("heading", { name: /admin operations dashboard/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^new registrations$/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /current academic year overview/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /open user management/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /open master data/i })).toBeVisible();
});