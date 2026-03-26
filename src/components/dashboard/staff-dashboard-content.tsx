import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { OverviewMetric } from "@/components/app/overview-metric";
import { StaffCaseTable } from "@/components/cases/staff-case-table";
import { DashboardListPanel } from "@/components/dashboard/dashboard-list-panel";
import { Button } from "@/components/ui/button";
import { type AppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import type { StaffDashboardData } from "@/lib/dashboard/service";

type StaffDashboardContentProps = {
  data: StaffDashboardData;
  locale?: AppLocale;
};

export function StaffDashboardContent({ data, locale = "en" }: StaffDashboardContentProps) {
  const messages = getMessages(locale);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: messages.common.dashboard, href: "/dashboard" },
          { label: messages.navigation.dashboard.staff.title }
        ]}
        description={locale === "bg" ? "Управлявайте своите случаи за мобилност, документи и последващи действия по прегледа от едно staff работно пространство." : "Manage your mobility cases, documents, and review follow-up from one staff workspace."}
        meta={
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">{messages.profile.academicTitle}</dt>
              <dd className="mt-1 font-semibold text-slate-950">{data.assignmentSummary.academicTitle}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{messages.profile.faculty}</dt>
              <dd className="mt-1 font-semibold text-slate-950">{data.assignmentSummary.faculty}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{messages.profile.department}</dt>
              <dd className="mt-1 font-semibold text-slate-950">{data.assignmentSummary.department}</dd>
            </div>
          </dl>
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard/profile">{locale === "bg" ? "Отвори редактора на профила" : "Open profile editor"}</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/staff/cases/new">{locale === "bg" ? "Създай нов случай" : "Create new case"}</Link>
            </Button>
          </>
        }
        eyebrow={locale === "bg" ? "Staff администрация" : "Staff administration"}
        title={locale === "bg" ? "Работно пространство за staff мобилност" : "Staff mobility workspace"}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <OverviewMetric
          title={locale === "bg" ? "Текуща учебна година" : "Current academic year"}
          value={data.currentAcademicYearLabel ?? messages.common.notSet}
          description={locale === "bg" ? "Активната учебна година, използвана за новите случаи." : "Active academic year used for new case records."}
        />
        <OverviewMetric
          title={locale === "bg" ? "Мои случаи" : "Own cases"}
          value={data.ownCasesCount.toString()}
          description={locale === "bg" ? "Всички случаи за мобилност, свързани с вашия акаунт." : "All mobility cases linked to your account."}
        />
        <OverviewMetric
          title={locale === "bg" ? "Чернови" : "Draft cases"}
          value={data.draftCasesCount.toString()}
          description={locale === "bg" ? "Случаи, които все още могат да бъдат продължени." : "Cases that can still be resumed."}
        />
        <OverviewMetric
          title={locale === "bg" ? "Подадени случаи" : "Submitted cases"}
          value={data.submittedCasesCount.toString()}
          description={locale === "bg" ? "Случаи, вече изпратени за преглед." : "Cases already sent for review."}
        />
        <OverviewMetric
          title={locale === "bg" ? "Отворени задачи" : "Open tasks"}
          value={data.openTasksCount.toString()}
          description={locale === "bg" ? "Текущи последващи действия по профил, случаи и документи." : "Current follow-up across profile, cases, and documents."}
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Case overview</h2>
            <p className="text-sm leading-6 text-slate-600">
              {locale === "bg" ? "Продължете чернова, прегледайте подадени записи или отворете нов случай." : "Continue a draft, review submitted records, or open a new case."}
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/staff/cases/new">{locale === "bg" ? "Създай нов случай" : "Create new case"}</Link>
          </Button>
        </div>
        <StaffCaseTable items={data.cases} locale={locale} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <DashboardListPanel
          title="Current status areas"
          description="Status groups based on your current case records."
          items={data.statusAreas}
          emptyTitle="No status areas available"
          emptyDescription="Workflow statuses will appear here once case tracking becomes active."
        />
        <DashboardListPanel
          title="Missing documents"
          description="Required uploads still outstanding on active case records."
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
          description="Recent officer and administrator notes on your cases."
          items={data.latestComments}
          emptyTitle="No comments yet"
          emptyDescription="No review comments have been recorded on your cases yet."
        />
        <DashboardListPanel
          title="Open tasks"
          description="Current next steps for your cases and profile."
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
