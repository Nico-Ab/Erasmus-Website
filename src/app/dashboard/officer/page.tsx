import { UserRole } from "@prisma/client";
import { ReviewDashboardContent } from "@/components/dashboard/review-dashboard-content";
import { requireRole } from "@/lib/auth/guards";
import { getReviewDashboardData } from "@/lib/dashboard/service";

export default async function OfficerDashboardPage() {
  await requireRole([UserRole.OFFICER, UserRole.ADMIN]);
  const data = await getReviewDashboardData();

  return <ReviewDashboardContent data={data} mode="officer" />;
}