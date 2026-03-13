import Link from "next/link";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportingCaseListItem } from "@/lib/reporting/service";

type ReportCaseTableProps = {
  rows: ReportingCaseListItem[];
};

export function ReportCaseTable({ rows }: ReportCaseTableProps) {
  return (
    <Card className="border-slate-200 bg-white/95" data-testid="report-case-table">
      <CardHeader>
        <CardTitle>Filtered case register</CardTitle>
        <CardDescription>
          The filtered case list remains exportable and keeps archived records visible when they match the selected reporting scope.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
            <p className="text-sm font-semibold text-slate-900">No cases match the current report filters</p>
            <p className="mt-1 text-sm text-slate-600">
              Adjust the filters or clear them to reopen the full reporting register.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Staff</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Assignment</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Mobility</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Host</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Status</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Documents</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Updated</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Open</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="align-top text-slate-700" data-testid={`report-case-row-${row.id}`}>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <p className="font-semibold text-slate-950">{row.staffName}</p>
                      <p className="mt-1 text-xs text-slate-500">{row.staffEmail}</p>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <p className="font-medium text-slate-950">{row.facultyName}</p>
                      <p className="mt-1 text-xs text-slate-500">{row.departmentName}</p>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <p className="font-medium text-slate-950">{row.mobilityTypeLabel}</p>
                      <p className="mt-1 text-xs text-slate-500">{row.academicYearLabel}</p>
                      <p className="mt-1 text-xs text-slate-500">{row.workflowStateLabel}</p>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <p className="font-medium text-slate-950">{row.hostInstitution}</p>
                      <p className="mt-1 text-xs text-slate-500">{row.hostCity}, {row.hostCountry}</p>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <CaseStatusBadge label={row.status.label} statusKey={row.status.key} />
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">{row.missingDocumentsSummary}</td>
                    <td className="border-b border-slate-100 px-4 py-4">{row.updatedAtLabel}</td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <Link className="font-semibold text-primary hover:underline" href={`/dashboard/officer/cases/${row.id}`}>
                        Open case
                      </Link>
                    </td>
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