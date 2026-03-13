import { UserRole } from "@prisma/client";
import { StaffDashboardContent } from "@/components/dashboard/staff-dashboard-content";
import { requireRole } from "@/lib/auth/guards";
import { getStaffDashboardData } from "@/lib/dashboard/service";

export default async function StaffDashboardPage() {
  const session = await requireRole([UserRole.STAFF]);
  const data = await getStaffDashboardData(session.user.id);

  if (!data) {
    return null;
  }

  return <StaffDashboardContent data={data} />;
}