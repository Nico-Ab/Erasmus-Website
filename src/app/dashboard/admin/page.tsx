import { UserRole } from "@prisma/client";
import { ReviewDashboardContent } from "@/components/dashboard/review-dashboard-content";
import { requireRole } from "@/lib/auth/guards";
import { getReviewDashboardData } from "@/lib/dashboard/service";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function AdminDashboardPage() {
  await requireRole([UserRole.ADMIN]);
  const locale = await getRequestLocale();
  const data = await getReviewDashboardData();

  return <ReviewDashboardContent data={data} locale={locale} mode="admin" />;
}
