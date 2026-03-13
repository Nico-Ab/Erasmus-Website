import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportingSummaryRow } from "@/lib/reporting/service";

type ReportSummaryTableProps = {
  title: string;
  description: string;
  rows: ReportingSummaryRow[];
  testId: string;
};

export function ReportSummaryTable({ title, description, rows, testId }: ReportSummaryTableProps) {
  return (
    <Card className="border-slate-200 bg-white/95" data-testid={testId}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="leading-6">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
            <p className="text-sm font-semibold text-slate-900">No records match the current filters</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Widen the filters to repopulate this summary table.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm" aria-label={`${title} summary table`}>
              <caption className="sr-only">{title} summary with total, open, completed, and missing-document counts.</caption>
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Group</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold text-right" scope="col">Total</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold text-right" scope="col">Open</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold text-right" scope="col">Completed</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold text-right" scope="col">No agreement</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold text-right" scope="col">No certificate</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="align-top text-slate-700 hover:bg-slate-50/60">
                    <td className="border-b border-slate-100 px-4 py-4 font-medium text-slate-950">{row.label}</td>
                    <td className="border-b border-slate-100 px-4 py-4 text-right">{row.totalCount}</td>
                    <td className="border-b border-slate-100 px-4 py-4 text-right">{row.openCount}</td>
                    <td className="border-b border-slate-100 px-4 py-4 text-right">{row.completedCount}</td>
                    <td className="border-b border-slate-100 px-4 py-4 text-right">{row.missingMobilityAgreementCount}</td>
                    <td className="border-b border-slate-100 px-4 py-4 text-right">{row.missingFinalCertificateCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}