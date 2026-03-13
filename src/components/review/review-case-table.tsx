import Link from "next/link";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReviewCaseListData } from "@/lib/review-workflow/service";

type ReviewCaseTableProps = {
  cases: ReviewCaseListData["cases"];
};

function buildDocumentSummary(item: ReviewCaseListData["cases"][number]) {
  const parts: string[] = [];

  if (item.pendingDocumentReviewsCount > 0) {
    parts.push(`${item.pendingDocumentReviewsCount} pending review`);
  }

  if (item.rejectedDocumentsCount > 0) {
    parts.push(`${item.rejectedDocumentsCount} rejected`);
  }

  if (item.missingDocumentsCount > 0) {
    parts.push(`${item.missingDocumentsCount} missing`);
  }

  return parts.length > 0 ? parts.join(" | ") : "All required current documents are on file.";
}

function buildHostLocationLabel(city: string, country: string) {
  const parts = [city.trim(), country.trim()].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Location not set";
}

export function ReviewCaseTable({ cases }: ReviewCaseTableProps) {
  return (
    <Card className="border-slate-200 bg-white/95" data-testid="review-case-table">
      <CardHeader>
        <CardTitle>Review case register</CardTitle>
        <CardDescription>
          Readable review rows that stay scannable even when status, assignment, and document state need to be checked together.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cases.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
            <p className="text-sm font-semibold text-slate-900">No review cases match the current filters</p>
            <p className="mt-1 text-sm text-slate-600">
              Clear one or more filters to reopen the wider review queue, or wait for the next submitted case.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {cases.length} case{cases.length === 1 ? "" : "s"} in the current review queue
            </p>
            <div className="overflow-x-auto">
              <table aria-label="Review case register" className="min-w-full border-separate border-spacing-0 text-sm">
                <caption className="sr-only">
                  Officer review register with staff assignment details, document state, workflow status, and direct access to each case.
                </caption>
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Staff</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Assignment</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Mobility</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Host</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Documents</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Status</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Updated</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((item) => (
                    <tr key={item.id} className="align-top text-slate-700 hover:bg-slate-50/60" data-testid={`review-case-row-${item.id}`}>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <p className="font-semibold text-slate-950">{item.staffName}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.staffEmail}</p>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <p className="font-medium text-slate-950">{item.facultyName}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.departmentName}</p>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <p className="font-medium text-slate-950">{item.mobilityTypeLabel ?? "Not set"}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.academicYearLabel ?? "No academic year"}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.dateRangeLabel}</p>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <p className="font-medium text-slate-950">{item.hostInstitution}</p>
                        <p className="mt-1 text-xs text-slate-500">{buildHostLocationLabel(item.hostCity, item.hostCountry)}</p>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <p className="text-slate-700">{buildDocumentSummary(item)}</p>
                      </td>
                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-4">
                        <CaseStatusBadge label={item.status.label} statusKey={item.status.key} />
                      </td>
                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-4 text-xs text-slate-600">{item.updatedAtLabel}</td>
                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-4">
                        <Link className="font-semibold text-primary hover:underline" href={`/dashboard/officer/cases/${item.id}`}>
                          Open case
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}