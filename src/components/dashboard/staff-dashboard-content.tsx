import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { OverviewMetric } from "@/components/app/overview-metric";
import { StaffCaseTable } from "@/components/cases/staff-case-table";
import { DashboardListPanel } from "@/components/dashboard/dashboard-list-panel";
import { Button } from "@/components/ui/button";
import type { StaffDashboardData } from "@/lib/dashboard/service";

type StaffDashboardContentProps = {
  data: StaffDashboardData;
};

export function StaffDashboardContent({ data }: StaffDashboardContentProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Staff area" }
        ]}
        description="Manage your mobility cases, required documents, and review follow-up from one structured staff workspace."
        meta={
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Academic title</dt>
              <dd className="mt-1 font-semibold text-slate-950">{data.assignmentSummary.academicTitle}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Faculty</dt>
              <dd className="mt-1 font-semibold text-slate-950">{data.assignmentSummary.faculty}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Department</dt>
              <dd className="mt-1 font-semibold text-slate-950">{data.assignmentSummary.department}</dd>
            </div>
          </dl>
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard/profile">Open profile editor</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/staff/cases/new">Create new case</Link>
            </Button>
          </>
        }
        eyebrow="Staff administration"
        title="Staff mobility workspace"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <OverviewMetric
          title="Current academic year"
          value={data.currentAcademicYearLabel ?? "Not set"}
          description="Current year context for new staff mobility records and reporting."
        />
        <OverviewMetric
          title="Own cases"
          value={data.ownCasesCount.toString()}
          description="All mobility cases currently linked to your account."
        />
        <OverviewMetric
          title="Draft cases"
          value={data.draftCasesCount.toString()}
          description="Case records that can still be resumed and completed later."
        />
        <OverviewMetric
          title="Submitted cases"
          value={data.submittedCasesCount.toString()}
          description="Cases already sent forward for officer review."
        />
        <OverviewMetric
          title="Open tasks"
          value={data.openTasksCount.toString()}
          description="Current follow-up work across profile, cases, and required documents."
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Case overview</h2>
            <p className="text-sm leading-6 text-slate-600">
              Continue a draft, review submitted records, or open a new case for another mobility period.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/staff/cases/new">Create new case</Link>
          </Button>
        </div>
        <StaffCaseTable items={data.cases} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <DashboardListPanel
          title="Current status areas"
          description="Workflow status groups populated from your stored case records."
          items={data.statusAreas}
          emptyTitle="No status areas available"
          emptyDescription="Workflow statuses will appear here once case tracking becomes active."
        />
        <DashboardListPanel
          title="Missing documents"
          description="Required uploads that are still outstanding on your active case records."
          items={data.missingDocuments}
          emptyTitle="No missing documents"
          emptyDescription="All currently required documents are on file for your active cases."
          footer={
            <p className="text-sm text-slate-600">
              Current upload policy: <span className="font-medium text-slate-900">{data.uploadPolicySummary}</span>
            </p>
          }
        />
        <DashboardListPanel
          title="Latest comments"
          description="Recent officer and administrator notes recorded against your mobility cases."
          items={data.latestComments}
          emptyTitle="No comments yet"
          emptyDescription="No review comments have been recorded on your cases yet."
        />
        <DashboardListPanel
          title="Open tasks"
          description="Actionable next steps so your case record can continue moving through the workflow."
          items={data.openTasks}
          emptyTitle="No open tasks"
          emptyDescription="Your profile and current case records do not require follow-up at the moment."
          footer={
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button asChild variant="outline">
                <Link href="/dashboard/profile">Open profile editor</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/staff/cases/new">Create new case</Link>
              </Button>
            </div>
          }
        />
      </section>
    </div>
  );
}
