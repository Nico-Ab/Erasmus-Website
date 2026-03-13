import { expect, test, type Locator, type Page } from "@playwright/test";

const staffCredentials = {
  email: "staff@swu.local",
  password: "StaffPass123!"
};

const secondStaffCredentials = {
  email: "staff2@swu.local",
  password: "StaffTwoPass123!"
};

const officerCredentials = {
  email: "officer@swu.local",
  password: "OfficerPass123!"
};

type CaseSeed = {
  hostInstitution: string;
  hostCountry: string;
  hostCity: string;
  mobilityTypeLabel: "Teaching" | "Training";
};

function buildCaseSeed(overrides?: Partial<CaseSeed>): CaseSeed {
  const suffix = `${Date.now()}-${Math.round(Math.random() * 100000)}`;

  return {
    hostInstitution: `Review Host ${suffix}`,
    hostCountry: "Austria",
    hostCity: "Graz",
    mobilityTypeLabel: "Teaching",
    ...overrides
  };
}

async function signInWith(page: Page, credentials: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function signOutCurrentUser(page: Page) {
  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

async function fillCompleteCase(form: Locator, seed: CaseSeed) {
  await expect(form.getByLabel(/academic year/i)).toBeEnabled();
  await form.getByLabel(/academic year/i).selectOption({ label: "2025/2026" });
  await form.getByLabel(/mobility type/i).selectOption({ label: seed.mobilityTypeLabel });
  await form.getByLabel(/host institution/i).fill(seed.hostInstitution);
  await form.getByLabel(/host country/i).fill(seed.hostCountry);
  await form.getByLabel(/host city/i).fill(seed.hostCity);
  await form.getByLabel(/start date/i).fill("2026-05-10");
  await form.getByLabel(/end date/i).fill("2026-05-15");
  await form.getByLabel(/notes/i).fill("Review workflow case seed.");
}

async function createSubmittedCaseAsStaff(
  page: Page,
  credentials: { email: string; password: string },
  seed: CaseSeed,
  uploadAgreement = false
) {
  await signInWith(page, credentials);
  await page.goto("/dashboard/staff/cases/new");
  const form = page.getByTestId("mobility-case-create-form");
  await fillCompleteCase(form, seed);
  await form.getByRole("button", { name: /submit case/i }).click();

  await expect(page).toHaveURL(/saved=submitted/);
  await expect(page.getByRole("heading", { name: /mobility case detail/i })).toBeVisible();

  if (uploadAgreement) {
    const panel = page.getByTestId("document-panel-mobility_agreement");
    await panel.locator('input[type="file"]').setInputFiles({
      name: "review-agreement.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("review-agreement")
    });
    await panel.getByRole("button", { name: /upload document/i }).click();
    await expect(panel.getByTestId("document-version-mobility_agreement-1")).toBeVisible();
  }

  await signOutCurrentUser(page);
}

async function openOfficerCaseByHostInstitution(page: Page, hostInstitution: string) {
  await signInWith(page, officerCredentials);
  await page.goto(`/dashboard/officer/cases?hostInstitution=${encodeURIComponent(hostInstitution)}`);
  const row = page.locator("tbody tr").filter({ hasText: hostInstitution });
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: /open case/i }).click();
  await expect(page.getByRole("heading", { name: hostInstitution })).toBeVisible();
}

test("officers can open a submitted case and add review comments", async ({ page }) => {
  const seed = buildCaseSeed();
  await createSubmittedCaseAsStaff(page, staffCredentials, seed);
  await openOfficerCaseByHostInstitution(page, seed.hostInstitution);

  await expect(page.getByText(/missing required documents/i)).toBeVisible();

  const commentForm = page.getByTestId("review-comment-form");
  await commentForm.getByLabel(/comment/i).fill("Please confirm the final signed document set.");

  const commentResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/review/cases/") &&
      response.url().includes("/comments") &&
      response.request().method() === "POST"
  );

  await commentForm.getByRole("button", { name: /add comment/i }).click();
  const commentResponse = await commentResponsePromise;
  expect(commentResponse.status()).toBe(201);

  await page.reload();

  const commentsList = page.getByTestId("review-comments-list");
  await expect(commentsList).toContainText(/please confirm the final signed document set/i);
  await expect(commentsList).toContainText(/milan georgiev/i);
});

test("officers can reject a document with a reason and change case status", async ({ page }) => {
  const seed = buildCaseSeed();
  await createSubmittedCaseAsStaff(page, staffCredentials, seed, true);
  await openOfficerCaseByHostInstitution(page, seed.hostInstitution);

  const documentForm = page.getByTestId("review-document-form-mobility_agreement");
  await documentForm.getByLabel(/review note/i).fill("Missing signature on the uploaded agreement.");
  await documentForm.getByRole("button", { name: /reject current version/i }).click();

  const documentPanel = page.getByTestId("review-document-panel-mobility_agreement");
  await expect(documentPanel).toContainText(/rejected/i);
  await expect(documentPanel).toContainText(/missing signature on the uploaded agreement/i);

  const statusForm = page.getByTestId("review-status-form");
  await statusForm.getByLabel(/new status/i).selectOption({ label: "Under Review" });
  await statusForm.getByLabel(/transition note/i).fill("Officer review started after document check.");
  await statusForm.getByRole("button", { name: /save status change/i }).click();

  await expect(page.getByText(/^Under Review$/i).first()).toBeVisible();
  await expect(page.getByText(/officer review started after document check/i)).toBeVisible();
});

test("officers can archive completed cases while keeping them searchable", async ({ page }) => {
  const seed = buildCaseSeed();
  await createSubmittedCaseAsStaff(page, staffCredentials, seed);
  await openOfficerCaseByHostInstitution(page, seed.hostInstitution);

  const statusForm = page.getByTestId("review-status-form");
  await statusForm.getByLabel(/new status/i).selectOption({ label: "Completed" });
  await statusForm.getByLabel(/transition note/i).fill("All mobility requirements are satisfied.");
  await statusForm.getByRole("button", { name: /save status change/i }).click();
  await expect(page.getByText(/^Completed$/i).first()).toBeVisible();

  await statusForm.getByRole("button", { name: /archive completed case/i }).click();
  await expect(page.getByText(/^Archived$/i).first()).toBeVisible();

  await page.goto(`/dashboard/officer/cases?hostInstitution=${encodeURIComponent(seed.hostInstitution)}`);
  const row = page.locator("tbody tr").filter({ hasText: seed.hostInstitution });
  await expect(row).toBeVisible();
  await expect(row).toContainText(/archived/i);
});

test("officers can combine filters to isolate a target review case", async ({ page }) => {
  const firstSeed = buildCaseSeed({
    hostInstitution: `Economics Host ${Date.now()}`,
    hostCountry: "Austria",
    hostCity: "Graz",
    mobilityTypeLabel: "Teaching"
  });
  const secondSeed = buildCaseSeed({
    hostInstitution: `Law Host ${Date.now()}`,
    hostCountry: "Belgium",
    hostCity: "Leuven",
    mobilityTypeLabel: "Training"
  });

  await createSubmittedCaseAsStaff(page, staffCredentials, firstSeed);
  await createSubmittedCaseAsStaff(page, secondStaffCredentials, secondSeed);
  await signInWith(page, officerCredentials);
  await page.goto("/dashboard/officer/cases");

  const filters = page.getByTestId("review-case-filters");
  await filters.getByLabel(/status/i).selectOption({ label: "Submitted" });
  await filters.getByLabel(/academic year/i).selectOption({ label: "2025/2026" });
  await filters.getByLabel(/faculty/i).selectOption({ label: "Faculty of Law" });
  await filters.getByLabel(/department/i).selectOption({ label: "Public Law" });
  await filters.getByLabel(/mobility type/i).selectOption({ label: "Training" });
  await filters.getByLabel(/country/i).fill("Belgium");
  await filters.getByLabel(/host institution/i).fill(secondSeed.hostInstitution);
  await filters.getByRole("button", { name: /apply filters/i }).click();

  const matchingRow = page.locator("tbody tr").filter({ hasText: secondSeed.hostInstitution });
  await expect(matchingRow).toBeVisible();
  await expect(matchingRow).toContainText(/faculty of law/i);
  await expect(page.locator("tbody tr").filter({ hasText: firstSeed.hostInstitution })).toHaveCount(0);
});