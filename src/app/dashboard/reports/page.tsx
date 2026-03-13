import { UserRole } from "@prisma/client";
import { PageHeader } from "@/components/app/page-header";
import { OverviewMetric } from "@/components/app/overview-metric";
import { ReportCaseTable } from "@/components/reports/report-case-table";
import { ReportDocumentGapTable } from "@/components/reports/report-document-gap-table";
import { ReportExportActions } from "@/components/reports/report-export-actions";
import { ReportFilters } from "@/components/reports/report-filters";
import { ReportSummaryTable } from "@/components/reports/report-summary-table";
import { requireRole } from "@/lib/auth/guards";
import {
  buildReportingQueryString,
  parseReportingFilters
} from "@/lib/reporting/filters";
import { getReportingData } from "@/lib/reporting/service";

type ReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  await requireRole([UserRole.OFFICER, UserRole.ADMIN]);
  const filters = parseReportingFilters(await searchParams);
  const data = await getReportingData(filters);
  const queryString = buildReportingQueryString(data.filters);
  const summaryRowLimit = data.displaySettings.summaryRowLimit;

  return (
    <div className="space-y-6" data-testid="reporting-page">
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Reports" }
        ]}
        description="Review archive-inclusive case totals, document gaps, and filtered summaries from one formal reporting workspace."
        eyebrow="Operational reporting"
        title="Operational reports"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <OverviewMetric
          title="Filtered cases"
          value={data.metrics.totalCount.toString()}
          description="All cases that match the active filters, including archived records when they match."
        />
        <OverviewMetric
          title="Open vs completed"
          value={`${data.metrics.openCount} / ${data.metrics.completedCount}`}
          description="Open cases shown against completed and archived closure totals."
        />
        <OverviewMetric
          title="Archived"
          value={data.metrics.archivedCount.toString()}
          description="Archived cases remain searchable and exportable in this workspace."
        />
        <OverviewMetric
          title="No mobility agreement"
          value={data.metrics.missingMobilityAgreementCount.toString()}
          description="Filtered cases without a current mobility agreement."
        />
        <OverviewMetric
          title="No final certificate"
          value={data.metrics.missingFinalCertificateCount.toString()}
          description="Filtered cases without a current final certificate."
        />
        <OverviewMetric
          title="Summary row limit"
          value={summaryRowLimit.toString()}
          description="Admin-managed display limit for summary sections on this page."
        />
      </section>

      <ReportFilters data={data} />
      <ReportExportActions queryString={queryString} />

      <section className="grid gap-4 xl:grid-cols-2">
        <ReportSummaryTable
          description="Mobility counts by academic year with open, completed, and missing-document breakdowns."
          rows={data.summaries.byAcademicYear.slice(0, summaryRowLimit)}
          testId="report-summary-academic-year"
          title="By academic year"
        />
        <ReportSummaryTable
          description="Faculty-level reporting across the current filtered case register."
          rows={data.summaries.byFaculty.slice(0, summaryRowLimit)}
          testId="report-summary-faculty"
          title="By faculty"
        />
        <ReportSummaryTable
          description="Department totals within the current reporting scope."
          rows={data.summaries.byDepartment.slice(0, summaryRowLimit)}
          testId="report-summary-department"
          title="By department"
        />
        <ReportSummaryTable
          description="Teaching and training totals with open and completed breakdowns."
          rows={data.summaries.byMobilityType.slice(0, summaryRowLimit)}
          testId="report-summary-mobility-type"
          title="By mobility type"
        />
        <ReportSummaryTable
          description="Country-level host reporting with missing-document visibility."
          rows={data.summaries.byHostCountry.slice(0, summaryRowLimit)}
          testId="report-summary-country"
          title="By host country"
        />
        <ReportSummaryTable
          description="Workflow status reporting, including archived cases when they match the filter scope."
          rows={data.summaries.byStatus.slice(0, summaryRowLimit)}
          testId="report-summary-status"
          title="By status"
        />
      </section>

      {data.displaySettings.showDocumentGapSummary ? (
        <ReportDocumentGapTable rows={data.summaries.documentGaps} />
      ) : null}

      {data.displaySettings.showHostInstitutionSummary ? (
        <ReportSummaryTable
          description="Institution-level totals prepared for later operational analysis and export."
          rows={data.summaries.byHostInstitution.slice(0, summaryRowLimit)}
          testId="report-summary-host-institution"
          title="By host institution"
        />
      ) : null}

      <ReportCaseTable rows={data.caseList} />
    </div>
  );
}