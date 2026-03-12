import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

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
  const payload = (await response.json()) as { email?: string };

  return {
    email: payload.email ?? registration.email
  };
}

test("registration creates a pending approval outcome", async ({ page, request }) => {
  const registration = createRegistrationData();
  const result = await registerStaffAccount(request, registration);

  await page.goto(`/pending-approval?email=${encodeURIComponent(result.email)}&registered=1`);

  await expect(page).toHaveURL(/\/pending-approval/);
  await expect(page.getByRole("heading", { name: /account pending approval/i })).toBeVisible();
  await expect(page.getByText(result.email)).toBeVisible();
});

test("approved seeded users can log in", async ({ page }) => {
  await signInWith(page, staffCredentials);

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /dashboard navigation/i })).toBeVisible();
  await expect(page.getByText(/signed in as/i)).toBeVisible();
});

test("pending users are blocked from the protected workspace", async ({ page, request }) => {
  const registration = createRegistrationData();
  const result = await registerStaffAccount(request, registration);

  await signInWith(page, {
    email: result.email,
    password: registration.password
  });

  await expect(page).toHaveURL(/\/pending-approval\?email=/);
  await expect(page.getByRole("heading", { name: /account pending approval/i })).toBeVisible();
});

test("admin approval unlocks the new staff account", async ({ page, request }) => {
  const registration = createRegistrationData();
  const result = await registerStaffAccount(request, registration);

  await signInWith(page, adminCredentials);
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/dashboard/admin/users");
  const row = page.getByRole("row").filter({ hasText: result.email });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: /approve/i }).click();
  await expect(page.getByRole("row").filter({ hasText: result.email })).toContainText(
    /approved/i
  );

  await signOutCurrentUser(page);
  await signInWith(page, {
    email: result.email,
    password: registration.password
  });

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(/pending staff/i)).toBeVisible();
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