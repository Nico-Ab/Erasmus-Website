import { UserRole } from "@prisma/client";
import { StaffDashboardContent } from "@/components/dashboard/staff-dashboard-content";
import { requireRole } from "@/lib/auth/guards";
import { getStaffDashboardData } from "@/lib/dashboard/service";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function StaffDashboardPage() {
  const session = await requireRole([UserRole.STAFF]);
  const locale = await getRequestLocale();
  const data = await getStaffDashboardData(session.user.id);

  if (!data) {
    return null;
  }

  return <StaffDashboardContent data={data} locale={locale} />;
}
