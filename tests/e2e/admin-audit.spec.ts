import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const adminCredentials = {
  email: "admin@swu.local",
  password: "AdminPass123!"
};

function createRegistrationData() {
  const suffix = `${Date.now()}-${Math.round(Math.random() * 100000)}`;

  return {
    firstName: "Audit",
    lastName: "Candidate",
    email: `audit.${suffix}@swu.local`,
    password: "AuditPass123!"
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

async function registerStaffAccount(
  request: APIRequestContext,
  registration: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }
) {
  const response = await request.post("/api/register", {
    data: {
      ...registration,
      confirmPassword: registration.password
    }
  });

  expect(response.status()).toBe(201);
}

test("admins can approve, change role, deactivate, and review audit entries", async ({ page, request }) => {
  const registration = createRegistrationData();
  await registerStaffAccount(request, registration);

  await signInWith(page, adminCredentials);
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/dashboard/admin/users");
  const row = page.getByRole("row").filter({ hasText: registration.email });
  await expect(row).toBeVisible();

  await row.getByRole("button", { name: /^approve$/i }).click();
  await expect(row).toContainText(/approved/i);

  await row.getByLabel(/role assignment/i).selectOption("OFFICER");
  await row.getByLabel(new RegExp(`Type ${registration.email} to confirm`, "i")).fill(registration.email);
  await row.getByRole("button", { name: /change role/i }).click();
  await expect(row).toContainText(/officer/i);

  await page.goto("/dashboard/admin/audit-log");
  await expect(page.getByTestId("audit-log-page")).toBeVisible();
  await expect(page.getByText(new RegExp(`approved staff registration for ${registration.email}`, "i"))).toBeVisible();
  await expect(page.getByText(new RegExp(`changed role for ${registration.email}`, "i"))).toBeVisible();

  await page.goto("/dashboard/admin/users");
  const refreshedRow = page.getByRole("row").filter({ hasText: registration.email });
  await refreshedRow
    .getByLabel(new RegExp(`Type ${registration.email} to deactivate access`, "i"))
    .fill(registration.email);
  await refreshedRow.getByRole("button", { name: /deactivate user/i }).click();
  await expect(refreshedRow).toContainText(/deactivated/i);

  await page.goto("/dashboard/admin/audit-log");
  await expect(page.getByText(new RegExp(`deactivated ${registration.email}`, "i"))).toBeVisible();

  await signOutCurrentUser(page);
  await signInWith(page, {
    email: registration.email,
    password: registration.password
  });

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText(/your account is deactivated/i)).toBeVisible();
});