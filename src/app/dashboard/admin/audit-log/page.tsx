import { UserRole } from "@prisma/client";
import Link from "next/link";
import { OverviewMetric } from "@/components/app/overview-metric";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getAuditLogPageData } from "@/lib/audit/service";

export default async function AdminAuditLogPage() {
  await requireRole([UserRole.ADMIN]);
  const data = await getAuditLogPageData();

  return (
    <div className="space-y-6" data-testid="audit-log-page">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Audit log</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Review explicit records for user administration, case workflow changes, document handling, and other protected actions.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/admin/users">Return to user management</Link>
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric title="Recent entries" value={data.metrics.totalEntries.toString()} description="Most recent audit records shown on this page." />
        <OverviewMetric title="User actions" value={data.metrics.userActions.toString()} description="Entries tied to account approvals, role changes, and access control." />
        <OverviewMetric title="Workflow actions" value={data.metrics.workflowActions.toString()} description="Case, document, and settings actions outside direct user administration." />
      </section>

      <Card className="border-slate-200 bg-white/95">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Each row represents an explicit audit entry, including actor, action, target, summary, and any structured details recorded with the change.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-3 font-medium">Timestamp</th>
                  <th className="px-3 py-3 font-medium">Actor</th>
                  <th className="px-3 py-3 font-medium">Action</th>
                  <th className="px-3 py-3 font-medium">Target</th>
                  <th className="px-3 py-3 font-medium">Summary</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-100 align-top text-slate-700 last:border-b-0" data-testid={`audit-log-entry-${entry.id}`}>
                    <td className="px-3 py-4 text-xs text-slate-500">{entry.createdAtLabel}</td>
                    <td className="px-3 py-4">
                      <div className="font-medium text-slate-900">{entry.actorName}</div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="font-medium text-slate-900">{entry.actionLabel}</div>
                      <div className="mt-1 text-xs text-slate-500">{entry.entityLabel}</div>
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-700">{entry.targetLabel}</td>
                    <td className="px-3 py-4">
                      <div className="text-sm text-slate-900">{entry.summary}</div>
                      {entry.detailLines.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-xs text-slate-500">
                          {entry.detailLines.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}