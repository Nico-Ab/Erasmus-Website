import { expect, test } from "@playwright/test";
import {
  adminCredentials,
  signInWith,
  signOutCurrentUser,
  switchLanguage,
  visitPath
} from "./helpers/portal";

test("language toggle switches the public shell to Bulgarian and persists into login", async ({ page }) => {
  await visitPath(page, "/");
  await switchLanguage(page, "bg");

  await expect(page.getByRole("heading", { name: /портал за мобилност на персонала по еразъм/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^начало$/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^вход$/i })).toBeVisible();

  await visitPath(page, "/login");
  await expect(page.getByText(/достъп до портала/i)).toBeVisible();
  await expect(page.getByLabel(/имейл/i)).toBeVisible();
});

test("language selection persists after sign-in and can be switched back to English", async ({ page }) => {
  await visitPath(page, "/login");
  await switchLanguage(page, "bg");
  await signInWith(page, adminCredentials);

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(/^навигация$/i)).toBeVisible();

  await switchLanguage(page, "en");
  await expect(page.getByText(/^navigation$/i)).toBeVisible();

  await signOutCurrentUser(page);
  await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
});
