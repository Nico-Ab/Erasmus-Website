import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StaffCaseTable } from "@/components/cases/staff-case-table";
import { renderWithUser } from "../helpers/render";

describe("StaffCaseTable", () => {
  it("renders a readable case row with detail access", () => {
    renderWithUser(
      <StaffCaseTable
        items={[
          {
            id: "case_1",
            academicYearLabel: "2025/2026",
            mobilityTypeLabel: "Teaching",
            hostInstitution: "University of Graz",
            hostLocation: "Graz, Austria",
            dateRangeLabel: "10 Apr 2026 - 15 Apr 2026",
            status: {
              key: "draft",
              label: "Draft"
            },
            updatedAtLabel: "12 Mar 2026",
            submittedAtLabel: null
          }
        ]}
      />
    );

    expect(screen.getByText(/university of graz/i)).toBeInTheDocument();
    expect(screen.getByText(/graz, austria/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view case/i })).toHaveAttribute(
      "href",
      "/dashboard/staff/cases/case_1"
    );
  });

  it("shows an empty state when no cases exist", () => {
    renderWithUser(<StaffCaseTable items={[]} />);

    expect(screen.getByText(/no mobility cases yet/i)).toBeInTheDocument();
  });
});