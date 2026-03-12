import Link from "next/link";
import { OverviewMetric } from "@/components/app/overview-metric";
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
          <h1 className="text-2xl font-semibold text-slate-950">Staff operational dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            This workspace shows your current profile-linked context and the first operational areas that will later connect to cases, documents, and review history.
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewMetric
          title="Current academic year"
          value={data.currentAcademicYearLabel ?? "Not set"}
          description="Active year context that will later scope staff cases and reporting."
        />
        <OverviewMetric
          title="Own cases"
          value={data.ownCasesCount.toString()}
          description="No real mobility case records exist yet, so this remains an honest zero state."
        />
        <OverviewMetric
          title="Missing documents"
          value={data.missingDocumentsCount.toString()}
          description="Document requirements will appear here once case records and uploads are introduced."
        />
        <OverviewMetric
          title="Open tasks"
          value={data.openTasksCount.toString()}
          description="Actionable personal items derived from the real profile and configuration state."
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <DashboardListPanel
          title="Own cases overview"
          description="Your future case list, submissions, and progress summaries will land in this panel."
          items={[]}
          emptyTitle="No mobility cases available yet"
          emptyDescription="The case module has not been implemented yet, so there are no personal case records to summarize in the dashboard."
          footer={
            <Button asChild variant="outline">
              <Link href="/dashboard/profile">Review profile readiness</Link>
            </Button>
          }
        />
        <DashboardListPanel
          title="Current status areas"
          description="These active status areas are configured in master data and ready to receive future case records."
          items={data.statusAreas}
          emptyTitle="No status areas configured"
          emptyDescription="Ask an administrator to configure workflow statuses before case tracking begins."
        />
        <DashboardListPanel
          title="Missing documents"
          description="Required uploads will be tracked here once cases and secure document handling are available."
          items={[]}
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
          description="Officer review comments and correction notes will surface here when review workflows are introduced."
          items={[]}
          emptyTitle="No review comments yet"
          emptyDescription="There are no officer comments yet because submitted case review has not been implemented."
        />
      </section>

      <DashboardListPanel
        title="Open tasks"
        description="This panel keeps the current staff workspace focused on concrete next steps without inventing unavailable workflows."
        items={data.openTasks}
        emptyTitle="No open staff tasks"
        emptyDescription="Your profile and current configuration do not require action right now. Future case tasks will appear here when that module is live."
        footer={
          <Button asChild>
            <Link href="/dashboard/profile">Open profile editor</Link>
          </Button>
        }
      />
    </div>
  );
}