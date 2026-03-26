import { UserRole } from "@prisma/client";
import type { AppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export type NavigationItem = {
  title: string;
  href: string;
  description: string;
  roles?: UserRole[];
};

export function getPublicNavigation(locale: AppLocale): NavigationItem[] {
  const { navigation } = getMessages(locale);

  return [
    {
      title: navigation.public.home.title,
      href: "/",
      description: navigation.public.home.description
    },
    {
      title: navigation.public.status.title,
      href: "/status",
      description: navigation.public.status.description
    },
    {
      title: navigation.public.login.title,
      href: "/login",
      description: navigation.public.login.description
    },
    {
      title: navigation.public.register.title,
      href: "/register",
      description: navigation.public.register.description
    }
  ];
}

function getDashboardNavigationItems(locale: AppLocale): NavigationItem[] {
  const { navigation } = getMessages(locale);

  return [
    {
      title: navigation.dashboard.overview.title,
      href: "/dashboard",
      description: navigation.dashboard.overview.description
    },
    {
      title: navigation.dashboard.profile.title,
      href: "/dashboard/profile",
      description: navigation.dashboard.profile.description,
      roles: [UserRole.STAFF, UserRole.OFFICER, UserRole.ADMIN]
    },
    {
      title: navigation.dashboard.staff.title,
      href: "/dashboard/staff",
      description: navigation.dashboard.staff.description,
      roles: [UserRole.STAFF]
    },
    {
      title: navigation.dashboard.newCase.title,
      href: "/dashboard/staff/cases/new",
      description: navigation.dashboard.newCase.description,
      roles: [UserRole.STAFF]
    },
    {
      title: navigation.dashboard.officer.title,
      href: "/dashboard/officer",
      description: navigation.dashboard.officer.description,
      roles: [UserRole.OFFICER, UserRole.ADMIN]
    },
    {
      title: navigation.dashboard.reviewCases.title,
      href: "/dashboard/officer/cases",
      description: navigation.dashboard.reviewCases.description,
      roles: [UserRole.OFFICER, UserRole.ADMIN]
    },
    {
      title: navigation.dashboard.reports.title,
      href: "/dashboard/reports",
      description: navigation.dashboard.reports.description,
      roles: [UserRole.OFFICER, UserRole.ADMIN]
    },
    {
      title: navigation.dashboard.admin.title,
      href: "/dashboard/admin",
      description: navigation.dashboard.admin.description,
      roles: [UserRole.ADMIN]
    },
    {
      title: navigation.dashboard.users.title,
      href: "/dashboard/admin/users",
      description: navigation.dashboard.users.description,
      roles: [UserRole.ADMIN]
    },
    {
      title: navigation.dashboard.masterData.title,
      href: "/dashboard/admin/master-data",
      description: navigation.dashboard.masterData.description,
      roles: [UserRole.ADMIN]
    },
    {
      title: navigation.dashboard.auditLog.title,
      href: "/dashboard/admin/audit-log",
      description: navigation.dashboard.auditLog.description,
      roles: [UserRole.ADMIN]
    }
  ];
}

export function getDashboardNavigation(role: UserRole, locale: AppLocale = "en") {
  return getDashboardNavigationItems(locale).filter((item) => !item.roles || item.roles.includes(role));
}
