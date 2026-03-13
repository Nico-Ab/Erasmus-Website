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
        <CardDescription>
          Cases without a current mobility agreement or final certificate remain visible here regardless of archive state.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="border-b border-slate-200 px-4 py-3 font-semibold">Report</th>
                <th className="border-b border-slate-200 px-4 py-3 font-semibold">Cases</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="align-top text-slate-700">
                  <td className="border-b border-slate-100 px-4 py-4 font-medium text-slate-950">{row.label}</td>
                  <td className="border-b border-slate-100 px-4 py-4">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}