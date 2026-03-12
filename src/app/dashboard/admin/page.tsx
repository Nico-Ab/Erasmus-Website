import { UserRole } from "@prisma/client";
import { ReviewDashboardContent } from "@/components/dashboard/review-dashboard-content";
import { requireRole } from "@/lib/auth/guards";
import { getReviewDashboardData } from "@/lib/dashboard/service";

export default async function AdminDashboardPage() {
  await requireRole([UserRole.ADMIN]);
  const data = await getReviewDashboardData();

  return <ReviewDashboardContent data={data} mode="admin" />;
}