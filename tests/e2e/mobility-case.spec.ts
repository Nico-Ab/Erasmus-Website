import { expect, test, type Locator, type Page } from "@playwright/test";

const staffCredentials = {
  email: "staff@swu.local",
  password: "StaffPass123!"
};

const officerCredentials = {
  email: "officer@swu.local",
  password: "OfficerPass123!"
};

async function signInWith(page: Page, credentials: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

function buildCaseSeed() {
  const suffix = `${Date.now()}-${Math.round(Math.random() * 100000)}`;

  return {
    hostInstitution: `Mobility Host ${suffix}`,
    updatedHostInstitution: `Updated Mobility Host ${suffix}`,
    hostCountry: "Austria",
    hostCity: "Graz"
  };
}

function getCreateCaseForm(page: Page) {
  return page.getByTestId("mobility-case-create-form");
}

function getEditCaseForm(page: Page) {
  return page.getByTestId("mobility-case-edit-form");
}

async function waitForCaseFormReady(form: Locator) {
  await expect(form.getByLabel(/academic year/i)).toBeEnabled();
  await expect(form.getByLabel(/host institution/i)).toBeEnabled();
}

async function fillCompleteCase(form: Locator, seed: ReturnType<typeof buildCaseSeed>) {
  await waitForCaseFormReady(form);
  await form.getByLabel(/academic year/i).selectOption({ label: "2025/2026" });
  await form.getByLabel(/mobility type/i).selectOption({ label: "Teaching" });
  await form.getByLabel(/host institution/i).fill(seed.hostInstitution);
  await form.getByLabel(/host country/i).fill(seed.hostCountry);
  await form.getByLabel(/host city/i).fill(seed.hostCity);
  await form.getByLabel(/start date/i).fill("2026-04-10");
  await form.getByLabel(/end date/i).fill("2026-04-15");
  await form.getByLabel(/notes/i).fill("Initial teaching mobility draft.");
}

test("staff users can create a new case and save it as draft", async ({ page }) => {
  const seed = buildCaseSeed();
  await signInWith(page, staffCredentials);

  await page.goto("/dashboard/staff/cases/new");
  const createForm = getCreateCaseForm(page);
  await fillCompleteCase(createForm, seed);
  await createForm.getByRole("button", { name: /^save draft$/i }).click();

  await expect(page).toHaveURL(/\/dashboard\/staff\/cases\/.*saved=draft/);
  await expect(page.getByRole("heading", { name: /mobility case detail/i })).toBeVisible();
  await expect(page.getByText(/^Draft$/i).first()).toBeVisible();
  await expect(getEditCaseForm(page).getByLabel(/host institution/i)).toHaveValue(seed.hostInstitution);
});

test("staff users can reopen and edit a saved draft", async ({ page }) => {
  const seed = buildCaseSeed();
  await signInWith(page, staffCredentials);

  await page.goto("/dashboard/staff/cases/new");
  const createForm = getCreateCaseForm(page);
  await fillCompleteCase(createForm, seed);
  await createForm.getByRole("button", { name: /^save draft$/i }).click();
  await expect(page).toHaveURL(/\/dashboard\/staff\/cases\//);

  const editForm = getEditCaseForm(page);
  await waitForCaseFormReady(editForm);
  const hostInstitutionField = editForm.getByLabel(/host institution/i);
  await hostInstitutionField.fill(seed.updatedHostInstitution);

  const notesField = editForm.getByLabel(/notes/i);
  await notesField.fill("Draft reopened and updated.");
  await expect(hostInstitutionField).toHaveValue(seed.updatedHostInstitution);

  await editForm.getByRole("button", { name: /save draft changes/i }).click();

  await expect(page).toHaveURL(/saved=draft/);
  await expect(getEditCaseForm(page).getByLabel(/host institution/i)).toHaveValue(seed.updatedHostInstitution);
  await expect(getEditCaseForm(page).getByLabel(/notes/i)).toHaveValue("Draft reopened and updated.");
});

test("staff users can submit a completed case", async ({ page }) => {
  const seed = buildCaseSeed();
  await signInWith(page, staffCredentials);

  await page.goto("/dashboard/staff/cases/new");
  const createForm = getCreateCaseForm(page);
  await fillCompleteCase(createForm, seed);
  await createForm.getByRole("button", { name: /submit case/i }).click();

  await expect(page).toHaveURL(/saved=submitted/);
  await expect(page.getByText(/^Submitted$/i).first()).toBeVisible();
  await expect(page.getByText(/case is currently read-only/i)).toBeVisible();
});

test("staff users can view their case list and open a detail page", async ({ page }) => {
  const seed = buildCaseSeed();
  await signInWith(page, staffCredentials);

  await page.goto("/dashboard/staff/cases/new");
  const createForm = getCreateCaseForm(page);
  await fillCompleteCase(createForm, seed);
  await createForm.getByRole("button", { name: /^save draft$/i }).click();
  await expect(page).toHaveURL(/saved=draft/);

  await page.goto("/dashboard/staff");
  await expect(page.locator("table").getByText(seed.hostInstitution)).toBeVisible();
  const row = page.locator("tbody tr").filter({ hasText: seed.hostInstitution });
  await row.getByRole("link", { name: /view case/i }).click();
  await expect(page.getByRole("heading", { name: /mobility case detail/i })).toBeVisible();
  await expect(getEditCaseForm(page).getByLabel(/host institution/i)).toHaveValue(seed.hostInstitution);
});

test("officer users cannot open staff case routes", async ({ page }) => {
  await signInWith(page, officerCredentials);

  await page.goto("/dashboard/staff/cases/new");
  await expect(page).toHaveURL(/\/dashboard$/);
});