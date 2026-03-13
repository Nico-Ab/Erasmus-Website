import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
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
      ? "Oversee registrations, review workload, master data, reporting access, and the current academic-year context from one administrative dashboard."
      : "Monitor pending registrations, review workload, missing documents, and reporting context from one officer workspace.";
  const breadcrumbs =
    mode === "admin"
      ? [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin area" }
        ]
      : [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Officer area" }
        ];

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          mode === "admin" ? (
            <>
              <Button asChild variant="outline">
                <Link href="/dashboard/admin/users">Manage users</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/admin/master-data">Manage master data</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/dashboard/reports">Open reports</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/officer/cases">Open review register</Link>
              </Button>
            </>
          )
        }
        breadcrumbs={breadcrumbs}
        description={description}
        eyebrow={mode === "admin" ? "Administrative operations" : "Review operations"}
        title={title}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OverviewMetric
          title="New registrations"
          value={data.newRegistrationsCount.toString()}
          description="Staff registrations that still need an administrative decision."
        />
        <OverviewMetric
          title="New submitted cases"
          value={data.newSubmittedCasesCount.toString()}
          description="Cases newly submitted and ready for the first review pass."
        />
        <OverviewMetric
          title="Cases with missing documents"
          value={data.missingDocumentsCount.toString()}
          description="Cases that still require one or more required uploads."
        />
        <OverviewMetric
          title="Cases needing changes"
          value={data.casesNeedingChangesCount.toString()}
          description="Cases returned to staff for correction and follow-up."
        />
        <OverviewMetric
          title="Open reviews"
          value={data.openReviewsCount.toString()}
          description="Current submitted and returned cases still waiting on review work."
        />
        <OverviewMetric
          title="Current academic year"
          value={data.currentAcademicYearLabel ?? "Not set"}
          description="Active academic-year context from master data."
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <DashboardListPanel
          title="New registrations"
          description="Recent staff registrations that still require approval or rejection."
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
                Registration decisions remain an administrator action even though officers can monitor the queue.
              </p>
            )
          }
        />
        <DashboardListPanel
          title="Open reviews"
          description="Combined review queue for submitted cases and records currently awaiting staff changes."
          items={data.openReviews}
          emptyTitle="No open reviews"
          emptyDescription="There are no case reviews waiting for operational attention."
          footer={
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard/officer/cases">Open review register</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/reports">Open reports</Link>
              </Button>
            </div>
          }
        />
        <DashboardListPanel
          title="New submitted cases"
          description="Submitted case records ready for first review."
          items={data.newSubmittedCases}
          emptyTitle="No submitted cases yet"
          emptyDescription="No staff case has entered the submitted review queue yet."
        />
        <DashboardListPanel
          title="Cases with missing documents"
          description="Cases that need additional uploads or corrected files before review can proceed."
          items={data.missingDocuments}
          emptyTitle="No missing-document cases"
          emptyDescription="All currently active review cases have the required uploads on file."
        />
        <DashboardListPanel
          title="Cases needing changes"
          description="Cases that have been returned to staff for revision."
          items={data.casesNeedingChanges}
          emptyTitle="No changes-required cases"
          emptyDescription="There are no cases currently marked as needing changes."
        />
        <DashboardListPanel
          title="Current academic year overview"
          description="Operational context for the current year, based on master data and live case metrics."
          items={data.academicYearOverview}
          emptyTitle="No academic year metrics"
          emptyDescription="No active academic year data is available for the dashboard."
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
