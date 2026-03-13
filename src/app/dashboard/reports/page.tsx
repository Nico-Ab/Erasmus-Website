import { UserRole } from "@prisma/client";
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

  return (
    <div className="space-y-6" data-testid="reporting-page">
      <section className="rounded-xl border border-slate-200 bg-white/95 p-5">
        <h1 className="text-2xl font-semibold text-slate-950">Operational reports</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Review filtered case counts, document gaps, and archive-inclusive summaries from one formal reporting workspace.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <OverviewMetric
          title="Filtered cases"
          value={data.metrics.totalCount.toString()}
          description="All cases that match the active reporting filters, including archived records when they match."
        />
        <OverviewMetric
          title="Open vs completed"
          value={`${data.metrics.openCount} / ${data.metrics.completedCount}`}
          description="Open cases are shown first, while completed and archived records remain counted together for closure reporting."
        />
        <OverviewMetric
          title="Archived"
          value={data.metrics.archivedCount.toString()}
          description="Archived cases remain searchable and exportable in the reporting workspace."
        />
        <OverviewMetric
          title="No mobility agreement"
          value={data.metrics.missingMobilityAgreementCount.toString()}
          description="Cases without a current mobility agreement in the filtered result set."
        />
        <OverviewMetric
          title="No final certificate"
          value={data.metrics.missingFinalCertificateCount.toString()}
          description="Cases without a current final certificate in the filtered result set."
        />
      </section>

      <ReportFilters data={data} />
      <ReportExportActions queryString={queryString} />

      <section className="grid gap-4 xl:grid-cols-2">
        <ReportSummaryTable
          description="Mobility counts by academic year with open, completed, and missing-document breakdowns."
          rows={data.summaries.byAcademicYear}
          testId="report-summary-academic-year"
          title="By academic year"
        />
        <ReportSummaryTable
          description="Faculty-level reporting across the current filtered case register."
          rows={data.summaries.byFaculty}
          testId="report-summary-faculty"
          title="By faculty"
        />
        <ReportSummaryTable
          description="Department counts remain tied to the current filter scope."
          rows={data.summaries.byDepartment}
          testId="report-summary-department"
          title="By department"
        />
        <ReportSummaryTable
          description="Teaching and training totals with open and completed breakdowns."
          rows={data.summaries.byMobilityType}
          testId="report-summary-mobility-type"
          title="By mobility type"
        />
        <ReportSummaryTable
          description="Country-level host reporting with missing-document visibility."
          rows={data.summaries.byHostCountry}
          testId="report-summary-country"
          title="By host country"
        />
        <ReportSummaryTable
          description="Workflow status reporting, including archived cases when they match the filter scope."
          rows={data.summaries.byStatus}
          testId="report-summary-status"
          title="By status"
        />
      </section>

      <ReportDocumentGapTable rows={data.summaries.documentGaps} />
      <ReportSummaryTable
        description="Institution-level totals remain sortable and export-friendly for later operational analysis."
        rows={data.summaries.byHostInstitution}
        testId="report-summary-host-institution"
        title="By host institution"
      />
      <ReportCaseTable rows={data.caseList} />
    </div>
  );
}