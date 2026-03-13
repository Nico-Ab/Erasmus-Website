import { readFile } from "node:fs/promises";
import { expect, type APIRequestContext, type Download, type Locator, type Page } from "@playwright/test";

const appBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export const adminCredentials = {
  email: "admin@swu.local",
  password: "AdminPass123!"
};

export const officerCredentials = {
  email: "officer@swu.local",
  password: "OfficerPass123!"
};

export type Credentials = {
  email: string;
  password: string;
};

export type RegistrationData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type CaseSeed = {
  hostInstitution: string;
  updatedHostInstitution: string;
  hostCountry: string;
  hostCity: string;
  mobilityTypeLabel: "Teaching" | "Training";
};

function buildAppUrl(pathname: string) {
  return new URL(pathname, appBaseUrl).toString();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createRegistrationData(prefix = "portal") {
  const suffix = `${Date.now()}-${Math.round(Math.random() * 100000)}`;

  return {
    firstName: "Portal",
    lastName: "Staff",
    email: `${prefix}.${suffix}@swu.local`,
    password: "PortalPass123!"
  } satisfies RegistrationData;
}

export function buildCaseSeed(prefix = "Critical Journey") {
  const suffix = `${Date.now()}-${Math.round(Math.random() * 100000)}`;

  return {
    hostInstitution: `${prefix} Host ${suffix}`,
    updatedHostInstitution: `${prefix} Host Updated ${suffix}`,
    hostCountry: "Belgium",
    hostCity: "Leuven",
    mobilityTypeLabel: "Teaching"
  } satisfies CaseSeed;
}

export async function visitPath(page: Page, pathname: string) {
  const targetUrl = buildAppUrl(pathname);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await page.goto(targetUrl);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isTransientNavigationError = /ERR_ABORTED|frame was detached/i.test(message);

      if (!isTransientNavigationError || attempt === 3) {
        throw error;
      }

      await page.waitForTimeout(500 * attempt);
    }
  }
}

export async function clearSession(page: Page) {
  await page.context().clearCookies();
  await visitPath(page, "/");
}

export async function signInWith(page: Page, credentials: Credentials) {
  await visitPath(page, "/login");

  const emailInput = page.getByLabel(/email/i);
  const passwordInput = page.getByLabel(/password/i);

  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await emailInput.fill(credentials.email);
  await passwordInput.fill(credentials.password);
  await expect(emailInput).toHaveValue(credentials.email);
  await expect(passwordInput).toHaveValue(credentials.password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

export async function signInToDashboard(page: Page, credentials: Credentials) {
  await signInWith(page, credentials);
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /dashboard navigation/i })).toBeVisible();
}

export async function signOutCurrentUser(page: Page) {
  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

export async function registerStaffViaApi(
  request: APIRequestContext,
  registration: RegistrationData
) {
  const response = await request.post(`${appBaseUrl}/api/register`, {
    data: {
      ...registration,
      confirmPassword: registration.password
    }
  });

  expect(response.status()).toBe(201);
  return response.json() as Promise<{ email?: string }>;
}

export async function registerStaffViaUi(page: Page, registration: RegistrationData) {
  await visitPath(page, "/");
  const registerLink = page.getByRole("link", { name: /register staff account/i });
  const registerHref = await registerLink.getAttribute("href");

  try {
    await Promise.all([
      page.waitForURL(/\/register/, { timeout: 10_000 }),
      registerLink.click()
    ]);
  } catch {
    await visitPath(page, registerHref ?? "/register");
  }

  const form = page.getByTestId("register-form");
  await expect(form).toBeVisible();
  await form.getByLabel(/first name/i).fill(registration.firstName);
  await form.getByLabel(/last name/i).fill(registration.lastName);
  await form.getByLabel(/email/i).fill(registration.email);
  await form.getByLabel(/^password$/i).fill(registration.password);
  await form.getByLabel(/confirm password/i).fill(registration.password);
  await form.getByRole("button", { name: /submit registration/i }).click();

  await expect(page).toHaveURL(/\/pending-approval/);
  await expect(page.getByRole("heading", { name: /account pending approval/i })).toBeVisible();
  await expect(page.getByText(registration.email)).toBeVisible();
}

export async function approvePendingUserAsAdmin(page: Page, email: string) {
  await signInToDashboard(page, adminCredentials);
  await visitPath(page, "/dashboard/admin/users");

  const row = page.getByRole("row").filter({ hasText: email });
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/admin/users/") && response.request().method() === "PATCH"
  );

  await expect(row).toBeVisible();
  await row.getByRole("button", { name: /^approve$/i }).click();

  const response = await responsePromise;
  expect(response.status()).toBe(200);

  await page.reload();
  const refreshedRow = page.getByRole("row").filter({ hasText: email });
  await expect(refreshedRow).toBeVisible();
  await expect(refreshedRow).toContainText(/approved/i);
}

export async function updateProfile(
  page: Page,
  values: {
    firstName: string;
    facultyLabel: string;
    departmentLabel: string;
    academicTitleLabel?: string;
  }
) {
  await visitPath(page, "/dashboard/profile");
  const form = page.getByTestId("profile-form");

  await expect(page.getByRole("heading", { name: /editable staff profile/i })).toBeVisible();
  await form.getByLabel(/first name/i).fill(values.firstName);

  if (values.academicTitleLabel) {
    await form.getByLabel(/academic title/i).selectOption({ label: values.academicTitleLabel });
  }

  await form.getByLabel(/^faculty$/i).selectOption({ label: values.facultyLabel });
  await form.getByLabel(/department/i).selectOption({ label: values.departmentLabel });
  await form.getByRole("button", { name: /save profile/i }).click();

  await expect(page.getByText(/profile updated successfully\./i)).toBeVisible();
}

export function getCreateCaseForm(page: Page) {
  return page.getByTestId("mobility-case-create-form");
}

export function getEditCaseForm(page: Page) {
  return page.getByTestId("mobility-case-edit-form");
}

export async function waitForCaseFormReady(form: Locator) {
  await expect(form.getByLabel(/academic year/i)).toBeEnabled();
  await expect(form.getByLabel(/host institution/i)).toBeEnabled();
}

export async function fillMobilityCaseForm(form: Locator, seed: CaseSeed, notes: string) {
  await waitForCaseFormReady(form);
  await form.getByLabel(/academic year/i).selectOption({ label: "2025/2026" });
  await form.getByLabel(/mobility type/i).selectOption({ label: seed.mobilityTypeLabel });
  await form.getByLabel(/host institution/i).fill(seed.hostInstitution);
  await form.getByLabel(/host country/i).fill(seed.hostCountry);
  await form.getByLabel(/host city/i).fill(seed.hostCity);
  await form.getByLabel(/start date/i).fill("2026-06-10");
  await form.getByLabel(/end date/i).fill("2026-06-15");
  await form.getByLabel(/notes/i).fill(notes);
}

export async function createDraftCase(page: Page, seed: CaseSeed) {
  await visitPath(page, "/dashboard/staff/cases/new");
  const form = getCreateCaseForm(page);

  await fillMobilityCaseForm(form, seed, "Initial mobility draft for the critical workflow.");
  await form.getByRole("button", { name: /^save draft$/i }).click();

  await expect(page).toHaveURL(/saved=draft/);
  await expect(page.getByRole("heading", { name: /mobility case detail/i })).toBeVisible();
  await expect(page.getByText(/^Draft$/i).first()).toBeVisible();
}

export async function openStaffCaseFromDashboard(page: Page, hostInstitution: string) {
  await visitPath(page, "/dashboard/staff");
  const row = page.locator("tbody tr").filter({ hasText: hostInstitution });

  await expect(row).toBeVisible();
  await row.getByRole("link", { name: /view case/i }).click();
  await expect(page.getByRole("heading", { name: /mobility case detail/i })).toBeVisible();
}

export async function updateDraftCase(page: Page, nextHostInstitution: string, notes: string) {
  const form = getEditCaseForm(page);

  await waitForCaseFormReady(form);
  await form.getByLabel(/host institution/i).fill(nextHostInstitution);
  await form.getByLabel(/notes/i).fill(notes);
  await form.getByRole("button", { name: /save draft changes/i }).click();

  await expect(page).toHaveURL(/saved=draft/);
  await expect(form.getByLabel(/host institution/i)).toHaveValue(nextHostInstitution);
  await expect(form.getByLabel(/notes/i)).toHaveValue(notes);
}

export async function submitCurrentCase(page: Page) {
  const form = getEditCaseForm(page);

  await form.getByRole("button", { name: /submit case/i }).click();
  await expect(page).toHaveURL(/saved=submitted/);
  await expect(page.getByText(/^Submitted$/i).first()).toBeVisible();
  await expect(page.getByText(/case is currently read-only/i)).toBeVisible();
}

export async function uploadDocumentVersion(
  page: Page,
  documentTypeKey: "mobility_agreement" | "certificate_of_attendance",
  fileName: string,
  contents: string
) {
  const panel = page.getByTestId(`document-panel-${documentTypeKey}`);
  const uploadResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/staff/cases/") &&
      response.url().includes("/documents") &&
      response.request().method() === "POST"
  );

  await expect(panel).toBeVisible();
  await panel.locator('input[type="file"]').setInputFiles({
    name: fileName,
    mimeType: "application/pdf",
    buffer: Buffer.from(contents)
  });
  await panel.getByRole("button", {
    name: /upload document|upload next version/i
  }).click();

  const uploadResponse = await uploadResponsePromise;
  expect(uploadResponse.status()).toBe(200);

  return panel;
}

export async function expectCaseStatus(page: Page, label: string) {
  await expect(page.getByText(new RegExp(`^${escapeRegExp(label)}$`, "i")).first()).toBeVisible();
}

export async function openOfficerCaseByHostInstitution(page: Page, hostInstitution: string) {
  await signInToDashboard(page, officerCredentials);
  await visitPath(page, `/dashboard/officer/cases?hostInstitution=${encodeURIComponent(hostInstitution)}`);

  const row = page.locator("tbody tr").filter({ hasText: hostInstitution });
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: /open case/i }).click();
  await expect(page).toHaveURL(/\/dashboard\/officer\/cases\//);
  await expect(page.getByRole("heading", { name: /mobility case detail/i })).toBeVisible();
  await expect(page.getByText(hostInstitution).first()).toBeVisible();
}

export async function addOfficerComment(page: Page, body: string) {
  const commentForm = page.getByTestId("review-comment-form");
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/review/cases/") &&
      response.url().includes("/comments") &&
      response.request().method() === "POST"
  );

  await commentForm.getByLabel(/comment/i).fill(body);
  await commentForm.getByRole("button", { name: /add comment/i }).click();

  const response = await responsePromise;
  expect(response.status()).toBe(201);
  await page.reload();
  await expect(page.getByTestId("review-comments-list")).toContainText(body);
}

export async function reviewCurrentDocument(
  page: Page,
  documentTypeKey: "mobility_agreement" | "certificate_of_attendance",
  decision: "accept" | "reject",
  note: string
) {
  const form = page.getByTestId(`review-document-form-${documentTypeKey}`);
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/review/cases/") &&
      response.url().includes("/documents/review") &&
      response.request().method() === "PATCH"
  );

  await form.getByLabel(/review note/i).fill(note);
  await form
    .getByRole("button", {
      name: decision === "accept" ? /accept current version/i : /reject current version/i
    })
    .click();

  const response = await responsePromise;
  expect(response.status()).toBe(200);
}

export async function changeReviewStatus(page: Page, statusLabel: string, note: string) {
  const form = page.getByTestId("review-status-form");
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/review/cases/") &&
      response.url().includes("/status") &&
      response.request().method() === "PATCH"
  );

  await form.getByLabel(/new status/i).selectOption({ label: statusLabel });
  await form.getByLabel(/transition note/i).fill(note);
  await form.getByRole("button", { name: /save status change/i }).click();

  const response = await responsePromise;
  expect(response.status()).toBe(200);
  await expectCaseStatus(page, statusLabel);
}

export async function archiveCompletedCase(page: Page) {
  const form = page.getByTestId("review-status-form");
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/review/cases/") &&
      response.url().includes("/status") &&
      response.request().method() === "PATCH"
  );

  await form.getByRole("button", { name: /archive completed case/i }).click();

  const response = await responsePromise;
  expect(response.status()).toBe(200);
  await expectCaseStatus(page, "Archived");
}

export async function readDownload(download: Download) {
  const filePath = await download.path();

  if (!filePath) {
    throw new Error("Download path was not available.");
  }

  return readFile(filePath, "utf8");
}
