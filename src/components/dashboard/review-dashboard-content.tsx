import Link from "next/link";
import { OverviewMetric } from "@/components/app/overview-metric";
import { DashboardListPanel } from "@/components/dashboard/dashboard-list-panel";
import { Button } from "@/components/ui/button";
import type { ReviewDashboardData } from "@/lib/dashboard/service";

type ReviewDashboardContentProps = {
  mode: "officer" | "admin";
  data: ReviewDashboardData;
};

export function ReviewDashboardContent({ mode, data }: ReviewDashboardContentProps) {
  const title = mode === "admin" ? "Admin operations dashboard" : "Officer review dashboard";
  const description =
    mode === "admin"
      ? "This dashboard combines the live approval queue with honest review placeholders for the broader mobility workflow that still remains ahead."
      : "This dashboard provides read-only operational visibility into the live approval queue and the future review areas that will receive case data later.";

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white/95 p-5">
        <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OverviewMetric
          title="New registrations"
          value={data.newRegistrationsCount.toString()}
          description="Pending staff registrations are the first live operational queue in the protected workspace."
        />
        <OverviewMetric
          title="New submitted cases"
          value={data.newSubmittedCasesCount.toString()}
          description="No submitted mobility cases exist yet because the case module is not implemented."
        />
        <OverviewMetric
          title="Cases with missing documents"
          value={data.missingDocumentsCount.toString()}
          description="Document issues will appear here once secure uploads and case records are available."
        />
        <OverviewMetric
          title="Cases needing changes"
          value={data.casesNeedingChangesCount.toString()}
          description="Correction loops will populate this metric once officers can return submitted cases."
        />
        <OverviewMetric
          title="Open reviews"
          value={data.openReviewsCount.toString()}
          description="Registration approvals currently make up the live review queue for operational oversight."
        />
        <OverviewMetric
          title="Current academic year"
          value={data.currentAcademicYearLabel ?? "Not set"}
          description="Current year context sourced from active academic-year master data."
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <DashboardListPanel
          title="New registrations"
          description="Recent pending staff registrations that have not yet been approved or rejected."
          items={data.newRegistrations}
          emptyTitle="No new registrations"
          emptyDescription="There are currently no pending staff registrations waiting in the system."
          footer={
            mode === "admin" ? (
              <Button asChild variant="outline">
                <Link href="/dashboard/admin/users">Open user management</Link>
              </Button>
            ) : (
              <p className="text-sm text-slate-600">
                Registration decisions remain an admin-managed action even though officers can monitor the queue here.
              </p>
            )
          }
        />
        <DashboardListPanel
          title="Open reviews"
          description="The review queue is intentionally limited to registration approvals until the case-review workflow is built."
          items={data.openReviews}
          emptyTitle="No open reviews"
          emptyDescription="There are no current review items waiting for operational attention."
        />
        <DashboardListPanel
          title="New submitted cases"
          description="Future submitted-case intake will appear here with direct links into review work."
          items={[]}
          emptyTitle="No submitted cases yet"
          emptyDescription="The mobility case workflow is not live yet, so there are no submitted cases to review."
        />
        <DashboardListPanel
          title="Cases with missing documents"
          description="This queue will identify submissions that need additional uploads or corrected files."
          items={[]}
          emptyTitle="No document issues to review"
          emptyDescription="Document validation and secure upload handling are not implemented yet, so this queue is currently empty."
        />
        <DashboardListPanel
          title="Cases needing changes"
          description="Returned applications and correction requests will surface here once officers can send cases back."
          items={[]}
          emptyTitle="No changes-required cases"
          emptyDescription="Change-request workflows do not exist yet, so there are no cases awaiting staff corrections."
        />
        <DashboardListPanel
          title="Current academic year overview"
          description="Live master-data metrics that show whether the protected workspace has the administrative context it needs."
          items={data.academicYearOverview}
          emptyTitle="No academic year metrics"
          emptyDescription="No active academic year data is available for the operational dashboard."
          footer={
            mode === "admin" ? (
              <Button asChild>
                <Link href="/dashboard/admin/master-data">Open master data</Link>
              </Button>
            ) : null
          }
        />
      </section>
    </div>
  );
}