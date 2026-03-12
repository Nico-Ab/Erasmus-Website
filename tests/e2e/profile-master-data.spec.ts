import { expect, test, type Page } from "@playwright/test";

const adminCredentials = {
  email: "admin@swu.local",
  password: "AdminPass123!"
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

test("staff users can edit their own profile", async ({ page }) => {
  await signInWith(page, staffCredentials);
  await page.goto("/dashboard/profile");

  await expect(page.getByRole("heading", { name: /editable staff profile/i })).toBeVisible();
  await page.getByLabel(/first name/i).fill("Elena Updated");
  await page.getByLabel(/faculty/i).selectOption({ label: "Faculty of Law" });
  await page.getByLabel(/department/i).selectOption({ label: "Public Law" });
  await page.getByRole("button", { name: /save profile/i }).click();

  await expect(page.getByText(/profile updated successfully\./i)).toBeVisible();
  await page.reload();
  await expect(page.getByLabel(/first name/i)).toHaveValue("Elena Updated");
  await expect(page.getByLabel(/faculty/i)).toHaveValue(/.+/);
  await expect(page.getByLabel(/department/i)).toHaveValue(/.+/);
  await expect(page.getByRole("heading", { name: /editable staff profile/i })).toBeVisible();
});

test("admins can create and edit faculties and departments", async ({ page }) => {
  const suffix = `${Date.now() % 100000}`;
  const facultyCode = `HIST_${suffix}`;
  const facultyName = `Faculty ${suffix}`;
  const facultyUpdatedName = `${facultyName} Updated`;
  const departmentCode = `HIST_DEP_${suffix}`;
  const departmentName = `History Department ${suffix}`;
  const departmentUpdatedName = `${departmentName} Updated`;

  await signInWith(page, adminCredentials);
  await page.goto("/dashboard/admin/master-data");

  const facultiesSection = page.locator('[data-section="faculties"]');
  await facultiesSection.getByLabel(/faculty code/i).first().fill(facultyCode);
  await facultiesSection.getByLabel(/faculty name/i).first().fill(facultyName);
  await facultiesSection.getByRole("button", { name: /add faculty/i }).click();

  const facultyRow = facultiesSection
    .locator(`input[value="${facultyCode}"]`)
    .locator("xpath=ancestor::form[1]");
  await expect(facultyRow).toBeVisible();
  await facultyRow.getByLabel(/faculty name/i).fill(facultyUpdatedName);
  await facultyRow.getByRole("button", { name: /save faculty/i }).click();
  await expect(facultiesSection.locator(`input[value="${facultyUpdatedName}"]`)).toBeVisible();

  const departmentsSection = page.locator('[data-section="departments"]');
  await departmentsSection.getByLabel(/^faculty$/i).first().selectOption({ label: facultyUpdatedName });
  await departmentsSection.getByLabel(/department code/i).first().fill(departmentCode);
  await departmentsSection.getByLabel(/department name/i).first().fill(departmentName);
  await departmentsSection.getByRole("button", { name: /add department/i }).click();

  const departmentRow = departmentsSection
    .locator(`input[value="${departmentCode}"]`)
    .locator("xpath=ancestor::form[1]");
  await expect(departmentRow).toBeVisible();
  await departmentRow.getByLabel(/department name/i).fill(departmentUpdatedName);
  await departmentRow.getByRole("button", { name: /save department/i }).click();
  await expect(
    departmentsSection.locator(`input[value="${departmentUpdatedName}"]`)
  ).toBeVisible();
});

test("unauthorized users cannot edit admin master data", async ({ page }) => {
  await signInWith(page, staffCredentials);
  await page.goto("/dashboard/admin/master-data");

  await expect(page).toHaveURL(/\/dashboard$/);

  const status = await page.evaluate(async () => {
    const response = await fetch("/api/admin/master-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        entity: "faculty",
        mode: "create",
        code: "FORBIDDEN_EDIT",
        name: "Forbidden Edit",
        isActive: true
      })
    });

    return response.status;
  });

  expect(status).toBe(403);
});