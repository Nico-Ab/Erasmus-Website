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
      ? "This dashboard now combines the live approval queue with submitted-case intake, missing-document visibility, and direct access into the searchable review register."
      : "This dashboard provides operational visibility into pending registrations, submitted cases, document gaps, and the active review workload.";

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
          description="Pending staff registrations remain a live operational queue in the protected workspace."
        />
        <OverviewMetric
          title="New submitted cases"
          value={data.newSubmittedCasesCount.toString()}
          description="Staff-submitted mobility cases that are ready for the first review pass."
        />
        <OverviewMetric
          title="Cases with missing documents"
          value={data.missingDocumentsCount.toString()}
          description="Submitted or returned cases that are still missing required uploads."
        />
        <OverviewMetric
          title="Cases needing changes"
          value={data.casesNeedingChangesCount.toString()}
          description="Cases returned to staff for corrections will populate this metric."
        />
        <OverviewMetric
          title="Open reviews"
          value={data.openReviewsCount.toString()}
          description="Current submitted and changes-required case reviews awaiting officer or admin attention."
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
          description="Combined live review queue for submitted cases and records currently waiting on staff changes."
          items={data.openReviews}
          emptyTitle="No open reviews"
          emptyDescription="There are no current case reviews waiting for operational attention."
          footer={
            <Button asChild>
              <Link href="/dashboard/officer/cases">Open review register</Link>
            </Button>
          }
        />
        <DashboardListPanel
          title="New submitted cases"
          description="Submitted staff cases ready for the first review pass."
          items={data.newSubmittedCases}
          emptyTitle="No submitted cases yet"
          emptyDescription="Staff have not submitted any mobility cases yet."
        />
        <DashboardListPanel
          title="Cases with missing documents"
          description="This queue identifies submissions that need additional uploads or corrected files."
          items={data.missingDocuments}
          emptyTitle="No missing-document cases"
          emptyDescription="All submitted or returned cases currently have the required uploads on file."
        />
        <DashboardListPanel
          title="Cases needing changes"
          description="Returned applications and correction requests that still await staff follow-up."
          items={data.casesNeedingChanges}
          emptyTitle="No changes-required cases"
          emptyDescription="There are no cases currently marked as needing changes."
        />
        <DashboardListPanel
          title="Current academic year overview"
          description="Live master-data and case metrics that show whether the protected workspace has the administrative context it needs."
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