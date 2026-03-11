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
  }
];

const dashboardNavigation: NavigationItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    description: "Role-aware summary"
  },
  {
    title: "Staff area",
    href: "/dashboard/staff",
    description: "Profile, cases, and documents",
    roles: [UserRole.STAFF, UserRole.OFFICER, UserRole.ADMIN]
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
  }
];

export function getDashboardNavigation(role: UserRole) {
  return dashboardNavigation.filter((item) => !item.roles || item.roles.includes(role));
}
