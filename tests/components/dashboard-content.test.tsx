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
    expect(screen.getAllByText("0")).toHaveLength(2);
  });

  it("shows the empty state when no items exist", () => {
    renderWithUser(
      <DashboardListPanel
        title="Missing documents"
        description="Uploads pending"
        items={[]}
        emptyTitle="No document requests yet"
        emptyDescription="The upload workflow is not live."
      />
    );

    expect(screen.getByText(/no document requests yet/i)).toBeInTheDocument();
    expect(screen.getByText(/the upload workflow is not live/i)).toBeInTheDocument();
  });
});

describe("Dashboard content", () => {
  it("renders staff dashboard areas with real empty states and tasks", () => {
    renderWithUser(<StaffDashboardContent data={createStaffDashboardData()} />);

    expect(
      screen.getByRole("heading", { name: /staff operational dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/own cases overview/i)).toBeInTheDocument();
    expect(screen.getByText(/current status areas/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^open tasks$/i })).toBeInTheDocument();
    expect(screen.getByText(/complete institutional profile/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open profile editor/i })).toHaveAttribute(
      "href",
      "/dashboard/profile"
    );
  });

  it("renders admin review dashboard links and live registration items", () => {
    renderWithUser(<ReviewDashboardContent data={createReviewDashboardData()} mode="admin" />);

    expect(
      screen.getByRole("heading", { name: /admin operations dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/new registrations/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Pending Staff$/i)).toHaveLength(2);
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