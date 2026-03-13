import { expect, test, type Locator, type Page } from "@playwright/test";

const staffCredentials = {
  email: "staff@swu.local",
  password: "StaffPass123!"
};

const secondStaffCredentials = {
  email: "staff2@swu.local",
  password: "StaffTwoPass123!"
};

function buildCaseSeed() {
  const suffix = `${Date.now()}-${Math.round(Math.random() * 100000)}`;

  return {
    hostInstitution: `Document Host ${suffix}`,
    hostCountry: "Austria",
    hostCity: "Graz"
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

async function fillCompleteCase(form: Locator, seed: ReturnType<typeof buildCaseSeed>) {
  await expect(form.getByLabel(/academic year/i)).toBeEnabled();
  await form.getByLabel(/academic year/i).selectOption({ label: "2025/2026" });
  await form.getByLabel(/mobility type/i).selectOption({ label: "Teaching" });
  await form.getByLabel(/host institution/i).fill(seed.hostInstitution);
  await form.getByLabel(/host country/i).fill(seed.hostCountry);
  await form.getByLabel(/host city/i).fill(seed.hostCity);
  await form.getByLabel(/start date/i).fill("2026-04-10");
  await form.getByLabel(/end date/i).fill("2026-04-15");
  await form.getByLabel(/notes/i).fill("Case created for document workflow coverage.");
}

async function createSubmittedCase(page: Page, seed: ReturnType<typeof buildCaseSeed>) {
  await page.goto("/dashboard/staff/cases/new");
  const form = page.getByTestId("mobility-case-create-form");
  await fillCompleteCase(form, seed);
  await form.getByRole("button", { name: /submit case/i }).click();

  await expect(page).toHaveURL(/saved=submitted/);
  await expect(page.getByRole("heading", { name: /mobility case detail/i })).toBeVisible();
}

async function uploadDocumentVersion(
  page: Page,
  documentTypeKey: "mobility_agreement" | "certificate_of_attendance",
  fileName: string,
  fileContents: string
) {
  const panel = page.getByTestId(`document-panel-${documentTypeKey}`);
  await expect(panel).toBeVisible();
  await panel.locator('input[type="file"]').setInputFiles({
    name: fileName,
    mimeType: "application/pdf",
    buffer: Buffer.from(fileContents)
  });
  await panel.getByRole("button", {
    name: /upload document|upload next version/i
  }).click();

  return panel;
}

test("staff users can upload a mobility agreement", async ({ page }) => {
  const seed = buildCaseSeed();
  await signInWith(page, staffCredentials);
  await createSubmittedCase(page, seed);

  const panel = await uploadDocumentVersion(
    page,
    "mobility_agreement",
    "mobility-agreement-v1.pdf",
    "agreement-v1"
  );

  const currentVersionRow = panel.getByTestId("document-version-mobility_agreement-1");
  await expect(currentVersionRow).toBeVisible();
  await expect(currentVersionRow).toContainText(/current version/i);
  await expect(currentVersionRow).toContainText(/mobility-agreement-v1\.pdf/i);
  await expect(panel.getByText(/pending review/i).first()).toBeVisible();
});

test("staff users can upload a later version and the current version marker moves forward", async ({ page }) => {
  const seed = buildCaseSeed();
  await signInWith(page, staffCredentials);
  await createSubmittedCase(page, seed);

  const panel = await uploadDocumentVersion(
    page,
    "mobility_agreement",
    "mobility-agreement-v1.pdf",
    "agreement-v1"
  );
  await expect(panel.getByTestId("document-version-mobility_agreement-1")).toBeVisible();

  await uploadDocumentVersion(page, "mobility_agreement", "mobility-agreement-v2.pdf", "agreement-v2");

  const versionOneRow = panel.getByTestId("document-version-mobility_agreement-1");
  const versionTwoRow = panel.getByTestId("document-version-mobility_agreement-2");

  await expect(versionTwoRow).toBeVisible();
  await expect(versionTwoRow).toContainText(/current version/i);
  await expect(versionTwoRow).toContainText(/mobility-agreement-v2\.pdf/i);
  await expect(versionOneRow).not.toContainText(/current version/i);
});

test("authorized users can download the current document version through the private route", async ({ page }) => {
  const seed = buildCaseSeed();
  await signInWith(page, staffCredentials);
  await createSubmittedCase(page, seed);

  const panel = await uploadDocumentVersion(
    page,
    "mobility_agreement",
    "mobility-agreement-download.pdf",
    "agreement-download"
  );
  const currentVersionRow = panel.getByTestId("document-version-mobility_agreement-1");
  const downloadPath = await currentVersionRow.getByRole("link", { name: /download/i }).getAttribute("href");

  expect(downloadPath).toBeTruthy();

  const response = await page.request.get(downloadPath!);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-disposition"]).toContain("mobility-agreement-download.pdf");
  expect(response.headers()["cache-control"]).toBe("private, no-store");
  await expect(response.body()).resolves.toEqual(Buffer.from("agreement-download"));
});

test("other staff users cannot download a document they do not own", async ({ page }) => {
  const seed = buildCaseSeed();
  await signInWith(page, staffCredentials);
  await createSubmittedCase(page, seed);

  const panel = await uploadDocumentVersion(
    page,
    "mobility_agreement",
    "mobility-agreement-private.pdf",
    "agreement-private"
  );
  const currentVersionRow = panel.getByTestId("document-version-mobility_agreement-1");
  const downloadPath = await currentVersionRow.getByRole("link", { name: /download/i }).getAttribute("href");

  expect(downloadPath).toBeTruthy();

  await signOutCurrentUser(page);
  await signInWith(page, secondStaffCredentials);

  const response = await page.request.get(downloadPath!);

  expect(response.status()).toBe(404);
});

test("staff users can review the current version marker from their case detail page", async ({ page }) => {
  const seed = buildCaseSeed();
  await signInWith(page, staffCredentials);
  await createSubmittedCase(page, seed);

  const panel = await uploadDocumentVersion(
    page,
    "mobility_agreement",
    "mobility-agreement-history-v1.pdf",
    "agreement-history-v1"
  );
  await expect(panel.getByTestId("document-version-mobility_agreement-1")).toContainText(
    /current version/i
  );

  await uploadDocumentVersion(
    page,
    "mobility_agreement",
    "mobility-agreement-history-v2.pdf",
    "agreement-history-v2"
  );

  await expect(panel.getByTestId("document-version-mobility_agreement-2")).toContainText(
    /current version/i
  );
  await expect(panel.getByTestId("document-version-mobility_agreement-1")).not.toContainText(
    /current version/i
  );
  await expect(panel).toContainText(/version history/i);
});