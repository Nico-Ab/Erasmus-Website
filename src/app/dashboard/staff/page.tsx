import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";
import { StaffDashboardContent } from "@/components/dashboard/staff-dashboard-content";
import { requireRole } from "@/lib/auth/guards";
import { getStaffDashboardData } from "@/lib/dashboard/service";

export default async function StaffDashboardPage() {
  const session = await requireRole([UserRole.STAFF, UserRole.OFFICER, UserRole.ADMIN]);
  const data = await getStaffDashboardData(session.user.id);

  if (!data) {
    notFound();
  }

  return <StaffDashboardContent data={data} />;
}