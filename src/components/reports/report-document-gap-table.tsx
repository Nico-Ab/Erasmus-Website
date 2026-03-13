import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportingDocumentGapRow } from "@/lib/reporting/service";

type ReportDocumentGapTableProps = {
  rows: ReportingDocumentGapRow[];
};

export function ReportDocumentGapTable({ rows }: ReportDocumentGapTableProps) {
  return (
    <Card className="border-slate-200 bg-white/95" data-testid="report-document-gap-table">
      <CardHeader>
        <CardTitle>Missing required document reports</CardTitle>
        <CardDescription className="leading-6">
          Cases without a current mobility agreement or final certificate remain visible here regardless of archive state.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm" aria-label="Missing required document summary">
            <caption className="sr-only">Counts of filtered cases that are still missing required documents.</caption>
            <thead>
              <tr className="text-left text-slate-500">
                <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Report</th>
                <th className="border-b border-slate-200 px-4 py-3 font-semibold text-right" scope="col">Cases</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="align-top text-slate-700 hover:bg-slate-50/60">
                  <td className="border-b border-slate-100 px-4 py-4 font-medium text-slate-950">{row.label}</td>
                  <td className="border-b border-slate-100 px-4 py-4 text-right">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}