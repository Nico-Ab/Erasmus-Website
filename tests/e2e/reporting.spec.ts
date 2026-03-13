import { expect, test, type Download, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

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
    hostInstitution: `Report Host ${suffix}`,
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
  await form.getByLabel(/academic year/i).selectOption({ label: "2025/2026" });
  await form.getByLabel(/mobility type/i).selectOption({ label: seed.mobilityTypeLabel });
  await form.getByLabel(/host institution/i).fill(seed.hostInstitution);
  await form.getByLabel(/host country/i).fill(seed.hostCountry);
  await form.getByLabel(/host city/i).fill(seed.hostCity);
  await form.getByLabel(/start date/i).fill("2026-06-10");
  await form.getByLabel(/end date/i).fill("2026-06-15");
  await form.getByLabel(/notes/i).fill("Reporting workflow seed.");
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
      name: "report-agreement.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("report-agreement")
    });
    await panel.getByRole("button", { name: /upload document/i }).click();
    await expect(panel.getByTestId("document-version-mobility_agreement-1")).toBeVisible();
  }

  await signOutCurrentUser(page);
}

async function archiveCaseAsOfficer(page: Page, hostInstitution: string) {
  await signInWith(page, officerCredentials);
  await page.goto(`/dashboard/officer/cases?hostInstitution=${encodeURIComponent(hostInstitution)}`);
  const row = page.locator("tbody tr").filter({ hasText: hostInstitution });
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: /open case/i }).click();

  const statusForm = page.getByTestId("review-status-form");
  await statusForm.getByLabel(/new status/i).selectOption({ label: "Completed" });
  await statusForm.getByLabel(/transition note/i).fill("Marked complete for reporting export.");
  await statusForm.getByRole("button", { name: /save status change/i }).click();
  await expect(page.getByText(/^Completed$/i).first()).toBeVisible();

  await statusForm.getByRole("button", { name: /archive completed case/i }).click();
  await expect(page.getByText(/^Archived$/i).first()).toBeVisible();
  await signOutCurrentUser(page);
}

async function readDownload(download: Download) {
  const filePath = await download.path();

  if (!filePath) {
    throw new Error("Download path was not available.");
  }

  return readFile(filePath, "utf8");
}

test("officers can open report pages and apply combined filters", async ({ page }) => {
  const firstSeed = buildCaseSeed({
    hostInstitution: `Science Reports ${Date.now()}`,
    hostCountry: "Austria",
    hostCity: "Graz",
    mobilityTypeLabel: "Teaching"
  });
  const secondSeed = buildCaseSeed({
    hostInstitution: `Law Reports ${Date.now()}`,
    hostCountry: "Belgium",
    hostCity: "Leuven",
    mobilityTypeLabel: "Training"
  });

  await createSubmittedCaseAsStaff(page, staffCredentials, firstSeed);
  await createSubmittedCaseAsStaff(page, secondStaffCredentials, secondSeed);
  await signInWith(page, officerCredentials);
  await page.goto("/dashboard/reports");

  await expect(page.getByRole("heading", { name: /operational reports/i })).toBeVisible();

  const filters = page.getByTestId("report-filters");
  await filters.getByLabel(/academic year/i).selectOption({ label: "2025/2026" });
  await filters.getByLabel(/faculty/i).selectOption({ label: "Faculty of Law" });
  await filters.getByLabel(/department/i).selectOption({ label: "Public Law" });
  await filters.getByLabel(/mobility type/i).selectOption({ label: "Training" });
  await filters.getByLabel(/country/i).fill("Belgium");
  await filters.getByLabel(/host institution/i).fill(secondSeed.hostInstitution);
  await filters.getByLabel(/^status$/i).selectOption({ label: "Submitted" });
  await filters.getByRole("button", { name: /apply filters/i }).click();

  const caseTable = page.getByTestId("report-case-table");
  const matchingRow = caseTable.locator("tbody tr").filter({ hasText: secondSeed.hostInstitution });
  await expect(matchingRow).toBeVisible();
  await expect(
    caseTable.locator("tbody tr").filter({ hasText: firstSeed.hostInstitution })
  ).toHaveCount(0);
  await expect(page.getByTestId("report-summary-faculty")).toContainText(/faculty of law/i);
});

test("officers can export csv from filtered reporting data and archived cases remain exportable", async ({ page }) => {
  const archivedSeed = buildCaseSeed({
    hostInstitution: `Archived Reports ${Date.now()}`,
    hostCountry: "Germany",
    hostCity: "Berlin",
    mobilityTypeLabel: "Teaching"
  });

  await createSubmittedCaseAsStaff(page, staffCredentials, archivedSeed, true);
  await archiveCaseAsOfficer(page, archivedSeed.hostInstitution);
  await signInWith(page, officerCredentials);
  await page.goto(`/dashboard/reports?hostInstitution=${encodeURIComponent(archivedSeed.hostInstitution)}`);

  const row = page.getByTestId("report-case-table").locator("tbody tr").filter({
    hasText: archivedSeed.hostInstitution
  });
  await expect(row).toBeVisible();
  await expect(row).toContainText(/archived/i);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: /export filtered case list/i }).click();
  const download = await downloadPromise;
  const csv = await readDownload(download);

  expect(csv).toContain("Archived Reports");
  expect(csv).toContain(",Archived,Completed,");
});

test("officers can report on cases with missing documents", async ({ page }) => {
  const missingDocumentSeed = buildCaseSeed({
    hostInstitution: `Missing Docs ${Date.now()}`,
    hostCountry: "Italy",
    hostCity: "Padua",
    mobilityTypeLabel: "Teaching"
  });

  await createSubmittedCaseAsStaff(page, staffCredentials, missingDocumentSeed);
  await signInWith(page, officerCredentials);
  await page.goto(`/dashboard/reports?hostInstitution=${encodeURIComponent(missingDocumentSeed.hostInstitution)}`);

  await expect(page.getByTestId("report-document-gap-table")).toContainText(
    /cases without mobility agreement/i
  );
  await expect(page.getByTestId("report-document-gap-table")).toContainText(
    /cases without final certificate/i
  );
  const row = page.getByTestId("report-case-table").locator("tbody tr").filter({
    hasText: missingDocumentSeed.hostInstitution
  });
  await expect(row).toContainText(/mobility agreement \| final certificate/i);
});