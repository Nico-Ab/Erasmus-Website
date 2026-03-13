import { UserRole } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { getDashboardNavigation } from "@/lib/navigation";

describe("getDashboardNavigation", () => {
  it("returns staff routes for staff users", () => {
    const items = getDashboardNavigation(UserRole.STAFF);

    expect(items.map((item) => item.href)).toEqual([
      "/dashboard",
      "/dashboard/profile",
      "/dashboard/staff",
      "/dashboard/staff/cases/new"
    ]);
  });

  it("returns all admin routes for admin users", () => {
    const items = getDashboardNavigation(UserRole.ADMIN);

    expect(items.map((item) => item.href)).toEqual([
      "/dashboard",
      "/dashboard/profile",
      "/dashboard/officer",
      "/dashboard/admin",
      "/dashboard/admin/users",
      "/dashboard/admin/master-data"
    ]);
  });
});