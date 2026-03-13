import { UserRole } from "@prisma/client";

export type NavigationItem = {
  title: string;
  href: string;
  description: string;
  roles?: UserRole[];
};

export const publicNavigation: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
    description: "Portal overview"
  },
  {
    title: "Status",
    href: "/status",
    description: "Local environment checks"
  },
  {
    title: "Login",
    href: "/login",
    description: "Secure account access"
  },
  {
    title: "Register",
    href: "/register",
    description: "Staff account request"
  }
];

const dashboardNavigation: NavigationItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    description: "Role-aware summary"
  },
  {
    title: "My profile",
    href: "/dashboard/profile",
    description: "Institutional identity and assignment details",
    roles: [UserRole.STAFF, UserRole.OFFICER, UserRole.ADMIN]
  },
  {
    title: "Staff area",
    href: "/dashboard/staff",
    description: "Mobility cases, statuses, and comments",
    roles: [UserRole.STAFF]
  },
  {
    title: "New case",
    href: "/dashboard/staff/cases/new",
    description: "Create a new staff mobility case",
    roles: [UserRole.STAFF]
  },
  {
    title: "Officer area",
    href: "/dashboard/officer",
    description: "Review queues and case oversight",
    roles: [UserRole.OFFICER, UserRole.ADMIN]
  },
  {
    title: "Admin area",
    href: "/dashboard/admin",
    description: "Users, settings, and master data",
    roles: [UserRole.ADMIN]
  },
  {
    title: "User management",
    href: "/dashboard/admin/users",
    description: "Approve or reject staff registrations",
    roles: [UserRole.ADMIN]
  },
  {
    title: "Master data",
    href: "/dashboard/admin/master-data",
    description: "Faculties, departments, years, statuses, and settings",
    roles: [UserRole.ADMIN]
  }
];

export function getDashboardNavigation(role: UserRole) {
  return dashboardNavigation.filter((item) => !item.roles || item.roles.includes(role));
}