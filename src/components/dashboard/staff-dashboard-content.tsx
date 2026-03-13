import Link from "next/link";
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
      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/95 p-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Staff mobility workspace</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            This workspace now supports real staff-owned mobility cases with draft persistence, submission, status history, and a clear path back into incomplete records.
          </p>
        </div>
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
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <OverviewMetric
          title="Current academic year"
          value={data.currentAcademicYearLabel ?? "Not set"}
          description="Active year context that scopes staff case creation and reporting."
        />
        <OverviewMetric
          title="Own cases"
          value={data.ownCasesCount.toString()}
          description="All mobility cases currently stored for the signed-in staff user."
        />
        <OverviewMetric
          title="Draft cases"
          value={data.draftCasesCount.toString()}
          description="Cases that can still be resumed, edited, and submitted later."
        />
        <OverviewMetric
          title="Submitted cases"
          value={data.submittedCasesCount.toString()}
          description="Cases that have moved into the review-ready state."
        />
        <OverviewMetric
          title="Open tasks"
          value={data.openTasksCount.toString()}
          description="Actionable profile and draft-case follow-up items."
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Own cases overview</h2>
            <p className="text-sm text-slate-600">
              Continue existing drafts or open a new case when another mobility period needs to be recorded.
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
          description="Configured case-status buckets populated from your current mobility records."
          items={data.statusAreas}
          emptyTitle="No status areas configured"
          emptyDescription="Ask an administrator to configure workflow statuses before case tracking begins."
        />
        <DashboardListPanel
          title="Missing documents"
          description="Required uploads will be tracked here once the secure document workflow is introduced."
          items={data.missingDocuments}
          emptyTitle="No document requests yet"
          emptyDescription="There are no missing uploads to resolve because the protected document workflow is not live yet."
          footer={
            <p className="text-sm text-slate-600">
              Current upload policy: <span className="font-medium text-slate-900">{data.uploadPolicySummary}</span>
            </p>
          }
        />
        <DashboardListPanel
          title="Latest comments"
          description="Recent officer or admin comments recorded against your mobility cases."
          items={data.latestComments}
          emptyTitle="No review comments yet"
          emptyDescription="There are no recorded review comments on your mobility cases yet."
        />
        <DashboardListPanel
          title="Open tasks"
          description="This panel keeps the staff workspace focused on concrete next steps without inventing unavailable workflows."
          items={data.openTasks}
          emptyTitle="No open staff tasks"
          emptyDescription="Your profile and current case records do not currently require action."
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