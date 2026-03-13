import { expect, test } from "@playwright/test";
import {
  addOfficerComment,
  adminCredentials,
  approvePendingUserAsAdmin,
  archiveCompletedCase,
  buildCaseSeed,
  changeReviewStatus,
  clearSession,
  createDraftCase,
  createRegistrationData,
  openOfficerCaseByHostInstitution,
  openStaffCaseFromDashboard,
  readDownload,
  registerStaffViaApi,
  reviewCurrentDocument,
  signInToDashboard,
  signInWith,
  signOutCurrentUser,
  submitCurrentCase,
  updateDraftCase,
  updateProfile,
  uploadDocumentVersion,
  visitPath
} from "./helpers/portal";

test("critical portal journey runs from staff registration through archive and reporting", async ({
  page,
  request
}) => {
  test.slow();

  const registration = createRegistrationData("critical");
  const caseSeed = buildCaseSeed("Critical Portal");

  await test.step("staff registration creates a pending account for the workflow", async () => {
    await registerStaffViaApi(request, registration);
    await visitPath(
      page,
      `/pending-approval?email=${encodeURIComponent(registration.email)}&registered=1`
    );
    await expect(page.getByRole("heading", { name: /account pending approval/i })).toBeVisible();
    await expect(page.getByText(registration.email)).toBeVisible();
  });

  await test.step("pending users stay blocked until an admin approves them", async () => {
    await clearSession(page);
    await signInWith(page, {
      email: registration.email,
      password: registration.password
    });

    await expect(page).toHaveURL(/\/pending-approval/);
    await expect(page.getByRole("heading", { name: /account pending approval/i })).toBeVisible();
    await expect(page.getByText(registration.email)).toBeVisible();
  });

  await test.step("admin approval unlocks the new staff account", async () => {
    await clearSession(page);
    await approvePendingUserAsAdmin(page, registration.email);
    await signOutCurrentUser(page);

    await signInToDashboard(page, {
      email: registration.email,
      password: registration.password
    });
  });

  await test.step("staff boundaries stay enforced on protected officer and admin areas", async () => {
    await visitPath(page, "/dashboard/officer/cases");
    await expect(page).toHaveURL(/\/dashboard$/);

    await visitPath(page, "/dashboard/admin/users");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  await test.step("staff can edit profile data before starting the workflow", async () => {
    await updateProfile(page, {
      firstName: "Portal Updated",
      academicTitleLabel: "Dr.",
      facultyLabel: "Faculty of Law",
      departmentLabel: "Public Law"
    });
    await page.reload();
    await expect(page.getByTestId("profile-form").getByLabel(/first name/i)).toHaveValue(
      "Portal Updated"
    );
  });

  await test.step("staff can create a draft case and resume it later", async () => {
    await createDraftCase(page, caseSeed);
    await openStaffCaseFromDashboard(page, caseSeed.hostInstitution);
    await updateDraftCase(
      page,
      caseSeed.updatedHostInstitution,
      "Draft resumed with a reviewed host institution entry."
    );
  });

  await test.step("staff can submit the case and upload the first mobility agreement", async () => {
    await submitCurrentCase(page);

    const panel = await uploadDocumentVersion(
      page,
      "mobility_agreement",
      "critical-mobility-agreement-v1.pdf",
      "critical-mobility-agreement-v1"
    );

    await expect(panel.getByTestId("document-version-mobility_agreement-1")).toContainText(
      /current version/i
    );
    await expect(page.getByText(/^Agreement Uploaded$/i).first()).toBeVisible();
  });

  await test.step("officer review can comment, reject the document, and move the case into changes required", async () => {
    await signOutCurrentUser(page);
    await openOfficerCaseByHostInstitution(page, caseSeed.updatedHostInstitution);

    await addOfficerComment(page, "Please replace the agreement with the fully signed version.");
    await reviewCurrentDocument(
      page,
      "mobility_agreement",
      "reject",
      "Missing authorizing signature on the agreement."
    );
    await expect(page.getByTestId("review-document-panel-mobility_agreement")).toContainText(
      /missing authorizing signature on the agreement/i
    );

    await changeReviewStatus(
      page,
      "Changes Required",
      "Staff must replace the rejected agreement before review can continue."
    );
    await expect(page.getByTestId("review-comments-list")).toContainText(
      /please replace the agreement with the fully signed version/i
    );
  });

  await test.step("staff can see the review feedback and upload a corrected agreement version", async () => {
    await signOutCurrentUser(page);
    await signInToDashboard(page, {
      email: registration.email,
      password: registration.password
    });
    await openStaffCaseFromDashboard(page, caseSeed.updatedHostInstitution);

    const agreementPanel = page.getByTestId("document-panel-mobility_agreement");
    await expect(page.getByText(/^Changes Required$/i).first()).toBeVisible();
    await expect(
      page.getByText(/please replace the agreement with the fully signed version/i)
    ).toBeVisible();
    await expect(agreementPanel).toContainText(/missing authorizing signature on the agreement/i);

    await uploadDocumentVersion(
      page,
      "mobility_agreement",
      "critical-mobility-agreement-v2.pdf",
      "critical-mobility-agreement-v2"
    );

    await expect(agreementPanel.getByTestId("document-version-mobility_agreement-2")).toContainText(
      /current version/i
    );
    await expect(
      agreementPanel.getByTestId("document-version-mobility_agreement-1")
    ).not.toContainText(/current version/i);
    await expect(page.getByText(/^Agreement Uploaded$/i).first()).toBeVisible();
  });

  await test.step("officer can accept the corrected agreement and progress the case through active statuses", async () => {
    await signOutCurrentUser(page);
    await openOfficerCaseByHostInstitution(page, caseSeed.updatedHostInstitution);

    await reviewCurrentDocument(
      page,
      "mobility_agreement",
      "accept",
      "Corrected agreement received and accepted."
    );
    await expect(page.getByTestId("review-document-panel-mobility_agreement")).toContainText(
      /accepted/i
    );

    await changeReviewStatus(
      page,
      "Under Review",
      "Officer validation resumed after corrected upload."
    );
    await changeReviewStatus(page, "Approved", "Agreement and case data are now approved.");
    await changeReviewStatus(page, "Mobility Ongoing", "Mobility period has started.");
  });

  await test.step("staff can upload the final certificate after mobility begins", async () => {
    await signOutCurrentUser(page);
    await signInToDashboard(page, {
      email: registration.email,
      password: registration.password
    });
    await openStaffCaseFromDashboard(page, caseSeed.updatedHostInstitution);

    const certificatePanel = await uploadDocumentVersion(
      page,
      "certificate_of_attendance",
      "critical-final-certificate-v1.pdf",
      "critical-final-certificate-v1"
    );

    await expect(
      certificatePanel.getByTestId("document-version-certificate_of_attendance-1")
    ).toContainText(/current version/i);
    await expect(page.getByText(/^Certificate Uploaded$/i).first()).toBeVisible();
  });

  await test.step("officer can complete and archive the case after reviewing the final certificate", async () => {
    await signOutCurrentUser(page);
    await openOfficerCaseByHostInstitution(page, caseSeed.updatedHostInstitution);

    await addOfficerComment(page, "Final certificate received and recorded.");
    await reviewCurrentDocument(
      page,
      "certificate_of_attendance",
      "accept",
      "Final attendance certificate accepted."
    );
    await changeReviewStatus(page, "Completed", "All mobility requirements are satisfied.");
    await archiveCompletedCase(page);
  });

  await test.step("archived cases remain filterable and exportable in reporting", async () => {
    await visitPath(
      page,
      `/dashboard/reports?hostInstitution=${encodeURIComponent(caseSeed.updatedHostInstitution)}`
    );

    const filters = page.getByTestId("report-filters");
    await expect(page.getByRole("heading", { name: /operational reports/i })).toBeVisible();

    await filters.getByLabel(/academic year/i).selectOption({ label: "2025/2026" });
    await filters.getByLabel(/faculty/i).selectOption({ label: "Faculty of Law" });
    await filters.getByLabel(/department/i).selectOption({ label: "Public Law" });
    await filters.getByLabel(/mobility type/i).selectOption({ label: caseSeed.mobilityTypeLabel });
    await filters.getByLabel(/country/i).fill(caseSeed.hostCountry);
    await filters.getByLabel(/host institution/i).fill(caseSeed.updatedHostInstitution);
    await filters.getByLabel(/^status$/i).selectOption({ label: "Archived" });
    await filters.getByRole("button", { name: /apply filters/i }).click();

    const row = page.getByTestId("report-case-table").locator("tbody tr").filter({
      hasText: caseSeed.updatedHostInstitution
    });
    await expect(row).toBeVisible();
    await expect(row).toContainText(/archived/i);

    const caseExportPromise = page.waitForEvent("download");
    await page.getByTestId("export-cases-csv").click();
    const caseExport = await caseExportPromise;
    const caseCsv = await readDownload(caseExport);

    expect(caseCsv).toContain(caseSeed.updatedHostInstitution);
    expect(caseCsv).toContain("Archived");

  });

  await test.step("officer boundaries still block admin-only pages", async () => {
    await visitPath(page, "/dashboard/admin/users");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  await test.step("admin audit log shows the major workflow actions from the critical journey", async () => {
    await clearSession(page);
    await signInToDashboard(page, adminCredentials);
    await visitPath(page, "/dashboard/admin/audit-log");

    await expect(
      page.getByText(new RegExp(`approved staff registration for ${registration.email}`, "i"))
    ).toBeVisible();
    await expect(
      page.getByText(new RegExp(`created a mobility case for ${caseSeed.hostInstitution}`, "i"))
    ).toBeVisible();
    await expect(page.getByText(/rejected the current mobility agreement version/i).first()).toBeVisible();
    await expect(
      page.getByText(/accepted the current final certificate of attendance version/i).first()
    ).toBeVisible();
  });
});