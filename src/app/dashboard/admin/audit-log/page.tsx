import { UserRole } from "@prisma/client";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
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
      <PageHeader
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/users">Return to user management</Link>
          </Button>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin area", href: "/dashboard/admin" },
          { label: "Audit log" }
        ]}
        description="Review explicit records for user administration, case workflow changes, document handling, and other protected actions."
        eyebrow="Audit administration"
        title="Audit log"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric title="Recent entries" value={data.metrics.totalEntries.toString()} description="Most recent audit records shown on this page." />
        <OverviewMetric title="User actions" value={data.metrics.userActions.toString()} description="Entries tied to approvals, role changes, and access control." />
        <OverviewMetric title="Workflow actions" value={data.metrics.workflowActions.toString()} description="Case, document, and settings actions outside direct user administration." />
      </section>

      <Card className="border-slate-200 bg-white/95">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription className="leading-6">
            Each row represents an explicit audit entry, including actor, action, target, summary, and any structured details recorded with the change.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm" aria-label="Recent audit activity">
              <caption className="sr-only">Recent audit log activity including actor, action, target, and recorded summary details.</caption>
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-3 py-3">Timestamp</th>
                  <th className="px-3 py-3">Actor</th>
                  <th className="px-3 py-3">Action</th>
                  <th className="px-3 py-3">Target</th>
                  <th className="px-3 py-3">Summary</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-100 align-top text-slate-700 hover:bg-slate-50/60 last:border-b-0" data-testid={`audit-log-entry-${entry.id}`}>
                    <td className="whitespace-nowrap px-3 py-4 text-xs text-slate-500">{entry.createdAtLabel}</td>
                    <td className="px-3 py-4">
                      <div className="font-medium text-slate-900">{entry.actorName}</div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="font-medium text-slate-900">{entry.actionLabel}</div>
                      <div className="mt-1 text-xs text-slate-500">{entry.entityLabel}</div>
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-700">{entry.targetLabel}</td>
                    <td className="px-3 py-4">
                      <div className="text-sm leading-6 text-slate-900">{entry.summary}</div>
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