import { UserRole } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { getDashboardNavigation, getPublicNavigation } from "@/lib/navigation";

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
      "/dashboard/officer/cases",
      "/dashboard/reports",
      "/dashboard/admin",
      "/dashboard/admin/users",
      "/dashboard/admin/master-data",
      "/dashboard/admin/audit-log"
    ]);
  });
});

describe("getPublicNavigation", () => {
  it("returns localized public navigation items", () => {
    const items = getPublicNavigation("bg");

    expect(items.map((item) => item.title)).toEqual(["Начало", "Статус", "Вход", "Регистрация"]);
  });
});
