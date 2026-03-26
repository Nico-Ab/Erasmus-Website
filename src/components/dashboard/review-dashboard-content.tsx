import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { OverviewMetric } from "@/components/app/overview-metric";
import { DashboardListPanel } from "@/components/dashboard/dashboard-list-panel";
import { Button } from "@/components/ui/button";
import { type AppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import type { ReviewDashboardData } from "@/lib/dashboard/service";

type ReviewDashboardContentProps = {
  mode: "officer" | "admin";
  data: ReviewDashboardData;
  locale?: AppLocale;
};

export function ReviewDashboardContent({ mode, data, locale = "en" }: ReviewDashboardContentProps) {
  const messages = getMessages(locale);
  const title = mode === "admin" ? (locale === "bg" ? "Административно оперативно табло" : "Admin operations dashboard") : (locale === "bg" ? "Табло за officer преглед" : "Officer review dashboard");
  const description =
    mode === "admin"
      ? locale === "bg"
        ? "Наблюдавайте регистрации, натоварване по преглед, основни данни, достъп до справки и текущата учебна година от едно административно пространство."
        : "Oversee registrations, review workload, master data, reporting access, and the current academic year from one admin workspace."
      : locale === "bg"
        ? "Следете чакащи регистрации, натоварване по преглед, липсващи документи и справки от едно officer пространство."
        : "Monitor pending registrations, review workload, missing documents, and reporting from one officer workspace.";
  const breadcrumbs =
    mode === "admin"
      ? [
          { label: messages.common.dashboard, href: "/dashboard" },
          { label: locale === "bg" ? "Административна зона" : "Admin area" }
        ]
      : [
          { label: messages.common.dashboard, href: "/dashboard" },
          { label: locale === "bg" ? "Officer зона" : "Officer area" }
        ];

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          mode === "admin" ? (
            <>
              <Button asChild variant="outline">
                <Link href="/dashboard/admin/users">{locale === "bg" ? "Управление на потребители" : "Manage users"}</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/admin/master-data">{locale === "bg" ? "Управление на основни данни" : "Manage master data"}</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/dashboard/reports">{messages.common.openReports}</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/officer/cases">{locale === "bg" ? "Отвори регистъра за преглед" : "Open review register"}</Link>
              </Button>
            </>
          )
        }
        breadcrumbs={breadcrumbs}
        description={description}
        eyebrow={mode === "admin" ? (locale === "bg" ? "Административни операции" : "Administrative operations") : (locale === "bg" ? "Операции по преглед" : "Review operations")}
        title={title}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OverviewMetric
          title="New registrations"
          value={data.newRegistrationsCount.toString()}
          description="Staff registrations waiting for a decision."
        />
        <OverviewMetric
          title="New submitted cases"
          value={data.newSubmittedCasesCount.toString()}
          description="Cases ready for first review."
        />
        <OverviewMetric
          title="Cases with missing documents"
          value={data.missingDocumentsCount.toString()}
          description="Cases still requiring one or more uploads."
        />
        <OverviewMetric
          title="Cases needing changes"
          value={data.casesNeedingChangesCount.toString()}
          description="Cases returned to staff for correction."
        />
        <OverviewMetric
          title="Open reviews"
          value={data.openReviewsCount.toString()}
          description="Submitted and returned cases still waiting on review work."
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
          description="Recent staff registrations that still require a decision."
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
          description="Combined queue for submitted cases and returned records."
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
          description="Cases that need additional uploads or corrected files."
          items={data.missingDocuments}
          emptyTitle="No missing-document cases"
          emptyDescription="All currently active review cases have the required uploads on file."
        />
        <DashboardListPanel
          title="Cases needing changes"
          description="Cases returned to staff for revision."
          items={data.casesNeedingChanges}
          emptyTitle="No changes-required cases"
          emptyDescription="There are no cases currently marked as needing changes."
        />
        <DashboardListPanel
          title="Current academic year overview"
          description="Current year context based on master data and live case metrics."
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
