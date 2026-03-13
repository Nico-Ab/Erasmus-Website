import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardListPanel } from "@/components/dashboard/dashboard-list-panel";
import { ReviewDashboardContent } from "@/components/dashboard/review-dashboard-content";
import { StaffDashboardContent } from "@/components/dashboard/staff-dashboard-content";
import { createReviewDashboardData, createStaffDashboardData } from "../factories/dashboard";
import { renderWithUser } from "../helpers/render";

describe("DashboardListPanel", () => {
  it("renders structured rows when items are provided", () => {
    renderWithUser(
      <DashboardListPanel
        title="Current status areas"
        description="Configured statuses"
        items={createStaffDashboardData().statusAreas}
        emptyTitle="No statuses"
        emptyDescription="Nothing configured yet"
      />
    );

    expect(screen.getByText(/draft/i)).toBeInTheDocument();
    expect(screen.getByText(/submitted/i)).toBeInTheDocument();
    expect(screen.getAllByText("1")).toHaveLength(2);
  });

  it("shows the empty state when no items exist", () => {
    renderWithUser(
      <DashboardListPanel
        title="Missing documents"
        description="Uploads pending"
        items={[]}
        emptyTitle="No document requests yet"
        emptyDescription="All currently tracked required documents are already on file."
      />
    );

    expect(screen.getByText(/no document requests yet/i)).toBeInTheDocument();
    expect(screen.getByText(/all currently tracked required documents are already on file/i)).toBeInTheDocument();
  });
});

describe("Dashboard content", () => {
  it("renders staff dashboard areas with live case data and tasks", () => {
    renderWithUser(<StaffDashboardContent data={createStaffDashboardData()} />);

    expect(screen.getByRole("heading", { name: /staff mobility workspace/i })).toBeInTheDocument();
    expect(screen.getByText(/my mobility cases/i)).toBeInTheDocument();
    expect(screen.getByText(/current status areas/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^open tasks$/i })).toBeInTheDocument();
    expect(screen.getAllByText(/university of graz/i).length).toBeGreaterThan(0);

    const createCaseLinks = screen.getAllByRole("link", { name: /create new case/i });
    expect(createCaseLinks[0]).toHaveAttribute("href", "/dashboard/staff/cases/new");
  });

  it("renders admin review dashboard links and live queue items", () => {
    renderWithUser(<ReviewDashboardContent data={createReviewDashboardData()} mode="admin" />);

    expect(
      screen.getByRole("heading", { name: /admin operations dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/new submitted cases/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/university of graz/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /open user management/i })).toHaveAttribute(
      "href",
      "/dashboard/admin/users"
    );
    expect(screen.getByRole("link", { name: /open master data/i })).toHaveAttribute(
      "href",
      "/dashboard/admin/master-data"
    );
  });
});