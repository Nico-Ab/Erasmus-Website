import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";

export type StaffCaseTableItem = {
  id: string;
  academicYearLabel: string | null;
  mobilityTypeLabel: string | null;
  hostInstitution: string;
  hostLocation: string;
  dateRangeLabel: string;
  status: {
    key: string;
    label: string;
  };
  updatedAtLabel: string;
  submittedAtLabel: string | null;
};

export function StaffCaseTable({
  items
}: {
  items: StaffCaseTableItem[];
}) {
  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader>
        <CardTitle>My mobility cases</CardTitle>
        <CardDescription>
          Readable case records for drafts, submissions, and later review outcomes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
            <p className="text-sm font-semibold text-slate-900">No mobility cases yet</p>
            <p className="mt-1 text-sm text-slate-600">
              Create your first mobility case to start drafting the academic-year, host, and travel details.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Academic year</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Mobility</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Host</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Dates</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Status</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Updated</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Open</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="align-top text-slate-700">
                    <td className="border-b border-slate-100 px-4 py-4">{item.academicYearLabel ?? "Not set"}</td>
                    <td className="border-b border-slate-100 px-4 py-4">{item.mobilityTypeLabel ?? "Not set"}</td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <p className="font-semibold text-slate-900">{item.hostInstitution}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.hostLocation}</p>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">{item.dateRangeLabel}</td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <div className="space-y-2">
                        <CaseStatusBadge label={item.status.label} statusKey={item.status.key} />
                        {item.submittedAtLabel ? (
                          <p className="text-xs text-slate-500">Submitted {item.submittedAtLabel}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">{item.updatedAtLabel}</td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <Link
                        className="font-semibold text-primary hover:underline"
                        href={`/dashboard/staff/cases/${item.id}`}
                      >
                        View case
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