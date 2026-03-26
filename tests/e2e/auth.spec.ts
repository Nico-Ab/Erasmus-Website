import { expect, test, type Page } from "@playwright/test";
import { approvePendingUserAsAdmin, registerStaffViaUi, updateProfile } from "./helpers/portal";

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

function createRegistrationData() {
  const suffix = `${Date.now()}-${Math.round(Math.random() * 100000)}`;

  return {
    firstName: "Pending",
    lastName: "Staff",
    email: `pending.${suffix}@swu.local`,
    password: "PendingPass123!"
  };
}

async function signInWith(page: Page, credentials: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

async function signOutCurrentUser(page: Page) {
  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

test("registration creates a pending approval outcome", async ({ page }) => {
  const registration = createRegistrationData();
  await registerStaffViaUi(page, registration);

  await expect(page).toHaveURL(/\/pending-approval/);
  await expect(page.getByRole("heading", { name: /account pending approval/i })).toBeVisible();
  await expect(page.getByText(registration.email)).toBeVisible();
});

test("approved seeded users can log in", async ({ page }) => {
  await signInWith(page, staffCredentials);

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /^navigation$/i })).toBeVisible();
  await expect(page.getByText(/signed in as/i)).toBeVisible();
});

test("pending users are blocked from the protected workspace", async ({ page }) => {
  const registration = createRegistrationData();
  await registerStaffViaUi(page, registration);

  await signInWith(page, {
    email: registration.email,
    password: registration.password
  });

  await expect(page).toHaveURL(/\/pending-approval\?email=/);
  await expect(page.getByRole("heading", { name: /account pending approval/i })).toBeVisible();
});

test("admin approval unlocks the new staff account", async ({ page }) => {
  const registration = createRegistrationData();
  await registerStaffViaUi(page, registration);

  await approvePendingUserAsAdmin(page, registration.email);
  await signInWith(page, {
    email: registration.email,
    password: registration.password
  });

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /^navigation$/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /staff workspace/i })).toBeVisible();
});

test("central admin profiles can remain without faculty and department assignments", async ({ page }) => {
  await signInWith(page, adminCredentials);
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/dashboard/profile");
  const form = page.getByTestId("profile-form");

  await expect(page.getByRole("heading", { name: /my institutional profile/i })).toBeVisible();
  await expect(form.getByLabel(/^faculty$/i)).toHaveValue("");
  await expect(form.getByLabel(/department/i)).toBeDisabled();
  await updateProfile(page, {
    firstName: "Ivana Maria",
    facultyLabel: null,
    departmentLabel: null
  });
  await expect(form.getByLabel(/^faculty$/i)).toHaveValue("");
  await expect(form.getByLabel(/department/i)).toBeDisabled();
});

test("protected routes enforce authentication and role access", async ({ page }) => {
  await page.goto("/dashboard/admin");
  await expect(page).toHaveURL(/\/login/);

  await signInWith(page, staffCredentials);
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/dashboard/officer");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/admin");
  await expect(page).toHaveURL(/\/dashboard$/);

  await signOutCurrentUser(page);
  await signInWith(page, officerCredentials);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.goto("/dashboard/officer");
  await expect(page).toHaveURL(/\/dashboard\/officer$/);
  await page.goto("/dashboard/admin");
  await expect(page).toHaveURL(/\/dashboard$/);
});
